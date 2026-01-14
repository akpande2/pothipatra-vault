import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, FolderSearch, ArrowLeft, FileSearch, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface FoundDocument {
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  folderName: string;
  isPdf: boolean;
  pageCount: number;
  thumbnailBase64: string;
  matchReason: string;
  confidence: number;
}

interface ScanResult {
  documents: FoundDocument[];
  hasMore: boolean;
  totalRemaining: number;
  batchNumber: number;
}

export default function UploadID() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<FoundDocument[]>([]);
  const [showScanModal, setShowScanModal] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [processingFile, setProcessingFile] = useState<string | null>(null);
  const [importResults, setImportResults] = useState<Record<string, { success: boolean; message: string }>>({});

  const handleScanWithCamera = () => {
    if (window.Android?.startScanner) {
      window.Android.startScanner();
    } else if (window.Android?.openScanner) {
      window.Android.openScanner();
    } else {
      toast.error('Camera scanner not available');
    }
  };

  const handlePickFromGallery = () => {
    if (window.Android?.openGallery) {
      window.Android.openGallery();
    } else {
      toast.error('Gallery not available');
    }
  };

  const handlePickFromFiles = () => {
    if (window.Android?.openFilePicker) {
      window.Android.openFilePicker();
    } else {
      toast.error('File picker not available');
    }
  };

  const handleAutoScan = async () => {
    if (!window.Android?.scanDeviceForDocuments) {
      toast.error('Auto scan not available. Please update the app.');
      return;
    }

    setIsScanning(true);
    setShowScanModal(true);
    setScanResults([]);
    setImportResults({});

    try {
      // Trigger device scan
      const resultJson = window.Android.scanDeviceForDocuments();
      console.log('[AutoScan] Scan result:', resultJson);
      
      // Get first batch
      if (window.Android?.getNextDocumentBatch) {
        const batchJson = window.Android.getNextDocumentBatch();
        const batch: ScanResult = JSON.parse(batchJson || '{"documents":[],"hasMore":false}');
        
        console.log('[AutoScan] First batch:', batch);
        setScanResults(batch.documents || []);
        setHasMore(batch.hasMore);
        
        if (batch.documents.length === 0) {
          toast.info('No new documents found on your device');
          setShowScanModal(false);
        }
      }
    } catch (e) {
      console.error('[AutoScan] Error:', e);
      toast.error('Failed to scan device');
      setShowScanModal(false);
    } finally {
      setIsScanning(false);
    }
  };

  const handleLoadMore = () => {
    if (!window.Android?.getNextDocumentBatch) return;

    try {
      const batchJson = window.Android.getNextDocumentBatch();
      const batch: ScanResult = JSON.parse(batchJson || '{"documents":[],"hasMore":false}');
      
      setScanResults(prev => [...prev, ...(batch.documents || [])]);
      setHasMore(batch.hasMore);
    } catch (e) {
      console.error('[AutoScan] Error loading more:', e);
      toast.error('Failed to load more documents');
    }
  };

  const handleImportDocument = async (doc: FoundDocument) => {
    setProcessingFile(doc.filePath);

    try {
      if (window.Android?.importFoundDocument) {
        const resultJson = window.Android.importFoundDocument(JSON.stringify(doc));
        const result = JSON.parse(resultJson || '{}');
        
        if (result.success) {
          setImportResults(prev => ({
            ...prev,
            [doc.filePath]: { 
              success: true, 
              message: `Saved as ${result.documentType || 'Document'} - ${result.personName || 'Unknown'}` 
            }
          }));
          toast.success(`Imported: ${doc.fileName}`);
        } else {
          setImportResults(prev => ({
            ...prev,
            [doc.filePath]: { success: false, message: result.error || 'Import failed' }
          }));
          toast.error(`Failed to import: ${doc.fileName}`);
        }
      }
    } catch (e) {
      console.error('[AutoScan] Import error:', e);
      setImportResults(prev => ({
        ...prev,
        [doc.filePath]: { success: false, message: 'Import failed' }
      }));
      toast.error(`Failed to import: ${doc.fileName}`);
    } finally {
      setProcessingFile(null);
    }
  };

  const handleDismissDocument = (doc: FoundDocument) => {
    if (window.Android?.dismissFoundDocument) {
      window.Android.dismissFoundDocument(doc.filePath);
    }
    
    setScanResults(prev => prev.filter(d => d.filePath !== doc.filePath));
    setImportResults(prev => ({
      ...prev,
      [doc.filePath]: { success: false, message: 'Dismissed' }
    }));
  };

  const handleImportAll = async () => {
    for (const doc of scanResults) {
      if (!importResults[doc.filePath]) {
        await handleImportDocument(doc);
      }
    }
  };

  const handleDismissAll = () => {
    scanResults.forEach(doc => {
      if (!importResults[doc.filePath] && window.Android?.dismissFoundDocument) {
        window.Android.dismissFoundDocument(doc.filePath);
      }
    });
    setScanResults([]);
    setShowScanModal(false);
    toast.info('All documents dismissed');
  };

  const handleCloseScanModal = () => {
    setShowScanModal(false);
    setScanResults([]);
    setImportResults({});
    
    // Refresh documents list
    navigate('/documents');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const pendingDocs = scanResults.filter(doc => !importResults[doc.filePath]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Add Document</h1>
        </div>
      </div>

      {/* Upload Options */}
      <div className="p-4 space-y-4">
        <p className="text-muted-foreground text-sm">
          Choose how you want to add your document
        </p>

        {/* Scan with Camera */}
        <button
          onClick={handleScanWithCamera}
          className="w-full flex items-center gap-4 p-4 bg-card border rounded-xl hover:bg-muted/50 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera className="w-6 h-6 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-medium">Scan with Camera</p>
            <p className="text-sm text-muted-foreground">
              Use your camera to scan a document
            </p>
          </div>
        </button>

        {/* Pick from Gallery */}
        <button
          onClick={handlePickFromGallery}
          className="w-full flex items-center gap-4 p-4 bg-card border rounded-xl hover:bg-muted/50 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
            <Image className="w-6 h-6 text-green-500" />
          </div>
          <div className="text-left">
            <p className="font-medium">Choose from Gallery</p>
            <p className="text-sm text-muted-foreground">
              Select an existing photo of a document
            </p>
          </div>
        </button>

        {/* Pick from Files */}
        <button
          onClick={handlePickFromFiles}
          className="w-full flex items-center gap-4 p-4 bg-card border rounded-xl hover:bg-muted/50 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
            <FolderSearch className="w-6 h-6 text-orange-500" />
          </div>
          <div className="text-left">
            <p className="font-medium">Browse Files</p>
            <p className="text-sm text-muted-foreground">
              Select a PDF or image from your files
            </p>
          </div>
        </button>

        {/* Divider */}
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-sm text-muted-foreground">or</span>
          </div>
        </div>

        {/* Auto Scan */}
        <button
          onClick={handleAutoScan}
          disabled={isScanning}
          className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-dashed border-blue-500/30 rounded-xl hover:border-blue-500/50 transition-colors disabled:opacity-50"
        >
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
            {isScanning ? (
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            ) : (
              <FileSearch className="w-6 h-6 text-blue-500" />
            )}
          </div>
          <div className="text-left flex-1">
            <p className="font-medium text-blue-600 dark:text-blue-400">
              {isScanning ? 'Scanning...' : 'Auto Scan My Files'}
            </p>
            <p className="text-sm text-muted-foreground">
              Find documents in Downloads, Photos & more
            </p>
          </div>
        </button>

        <p className="text-xs text-center text-muted-foreground">
          Auto scan searches your device for PDFs and images that might be documents
        </p>
      </div>

      {/* Scan Results Modal */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-background w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b flex items-center justify-between shrink-0">
              <div>
                <h2 className="font-semibold">Found Documents</h2>
                <p className="text-sm text-muted-foreground">
                  {pendingDocs.length} document{pendingDocs.length !== 1 ? 's' : ''} to review
                </p>
              </div>
              <button
                onClick={handleCloseScanModal}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Documents List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {scanResults.length === 0 ? (
                <div className="text-center py-8">
                  <FileSearch className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No documents found</p>
                </div>
              ) : (
                scanResults.map((doc) => {
                  const result = importResults[doc.filePath];
                  const isProcessing = processingFile === doc.filePath;
                  
                  return (
                    <div
                      key={doc.filePath}
                      className={`border rounded-xl overflow-hidden ${
                        result?.success ? 'bg-green-50 dark:bg-green-900/20 border-green-200' :
                        result ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 opacity-60' : ''
                      }`}
                    >
                      <div className="flex gap-3 p-3">
                        {/* Thumbnail */}
                        <div className="w-16 h-20 bg-muted rounded-lg overflow-hidden shrink-0">
                          {doc.thumbnailBase64 ? (
                            <img
                              src={`data:image/jpeg;base64,${doc.thumbnailBase64}`}
                              alt={doc.fileName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-2xl">{doc.isPdf ? '📄' : '🖼️'}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">{doc.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.folderName} • {formatFileSize(doc.fileSize)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {doc.matchReason}
                          </p>
                          
                          {/* Result message */}
                          {result && (
                            <p className={`text-xs mt-1 ${result.success ? 'text-green-600' : 'text-gray-500'}`}>
                              {result.success ? '✓ ' : ''}{result.message}
                            </p>
                          )}
                        </div>
                        
                        {/* Actions */}
                        {!result && (
                          <div className="flex flex-col gap-2 shrink-0">
                            <button
                              onClick={() => handleImportDocument(doc)}
                              disabled={isProcessing}
                              className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDismissDocument(doc)}
                              disabled={isProcessing}
                              className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-destructive/10 hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              
              {/* Load More */}
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  className="w-full py-3 text-primary hover:bg-primary/10 rounded-xl"
                >
                  Load More Documents
                </button>
              )}
            </div>

            {/* Modal Footer */}
            {pendingDocs.length > 0 && (
              <div className="p-4 border-t flex gap-3 shrink-0">
                <button
                  onClick={handleDismissAll}
                  className="flex-1 py-2.5 bg-muted rounded-xl font-medium"
                >
                  Skip All
                </button>
                <button
                  onClick={handleImportAll}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium"
                >
                  Import All
                </button>
              </div>
            )}

            {/* Done button when all processed */}
            {pendingDocs.length === 0 && scanResults.length > 0 && (
              <div className="p-4 border-t shrink-0">
                <button
                  onClick={handleCloseScanModal}
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-medium"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
