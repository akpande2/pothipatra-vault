import React, { useState, useEffect } from 'react';
import { X, Check, ChevronRight, FileText, Image, Loader2, AlertCircle, FolderOpen } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface FoundDocument {
  uri: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  dateModified: number;
  folderName: string;
  isPdf: boolean;
  pageCount: number;
  thumbnailBase64: string;
  matchReason: string;
  confidence: number;
}

interface BatchResult {
  documents: FoundDocument[];
  hasMore: boolean;
  totalRemaining: number;
  batchNumber: number;
}

interface ImportResult {
  success: boolean;
  documentId?: string;
  documentType?: string;
  pageCount?: number;
  personName?: string;
  identifier?: string;
  error?: string;
}

// ============================================================================
// DOCUMENT SCANNER MODAL COMPONENT
// ============================================================================

interface DocumentScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [phase, setPhase] = useState<'scanning' | 'review' | 'complete'>('scanning');
  const [documents, setDocuments] = useState<FoundDocument[]>([]);
  const [currentBatch, setCurrentBatch] = useState<FoundDocument[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [totalRemaining, setTotalRemaining] = useState(0);
  const [processingIndex, setProcessingIndex] = useState<number | null>(null);
  const [importResults, setImportResults] = useState<Map<string, ImportResult>>(new Map());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startScan();
    }
  }, [isOpen]);

  const startScan = async () => {
    setPhase('scanning');
    setError(null);
    
    try {
      if (window.Android?.scanDeviceForDocuments) {
        console.log('[Scanner] Starting device scan...');
        const json = window.Android.scanDeviceForDocuments();
        const docs = JSON.parse(json || '[]');
        console.log('[Scanner] Found documents:', docs.length);
        
        setDocuments(docs);
        
        if (docs.length > 0) {
          loadNextBatch();
          setPhase('review');
        } else {
          setPhase('complete');
        }
      } else {
        setError('Scanner not available');
        setPhase('complete');
      }
    } catch (e) {
      console.error('[Scanner] Error:', e);
      setError('Failed to scan device');
      setPhase('complete');
    }
  };

  const loadNextBatch = () => {
    if (window.Android?.getNextDocumentBatch) {
      try {
        const json = window.Android.getNextDocumentBatch();
        const batch: BatchResult = JSON.parse(json);
        console.log('[Scanner] Batch loaded:', batch);
        
        setCurrentBatch(batch.documents);
        setHasMore(batch.hasMore);
        setTotalRemaining(batch.totalRemaining);
        
        if (batch.documents.length === 0) {
          setPhase('complete');
        }
      } catch (e) {
        console.error('[Scanner] Error loading batch:', e);
      }
    }
  };

  const handleSaveDocument = async (doc: FoundDocument, index: number) => {
    setProcessingIndex(index);
    
    try {
      if (window.Android?.importFoundDocument) {
        const result = window.Android.importFoundDocument(JSON.stringify(doc));
        const importResult: ImportResult = JSON.parse(result);
        
        setImportResults(prev => new Map(prev).set(doc.filePath, importResult));
        
        if (importResult.success) {
          console.log('[Scanner] Document imported:', importResult.documentId);
        } else {
          console.error('[Scanner] Import failed:', importResult.error);
        }
      }
    } catch (e) {
      console.error('[Scanner] Error importing:', e);
      setImportResults(prev => new Map(prev).set(doc.filePath, {
        success: false,
        error: 'Import failed'
      }));
    }
    
    setProcessingIndex(null);
  };

  const handleDismissDocument = (doc: FoundDocument) => {
    if (window.Android?.dismissFoundDocument) {
      window.Android.dismissFoundDocument(doc.filePath);
    }
    
    // Remove from current batch
    setCurrentBatch(prev => prev.filter(d => d.filePath !== doc.filePath));
  };

  const handleContinue = () => {
    if (hasMore) {
      loadNextBatch();
    } else {
      setPhase('complete');
    }
  };

  const handleSkipAll = () => {
    // Dismiss all remaining
    currentBatch.forEach(doc => {
      if (window.Android?.dismissFoundDocument) {
        window.Android.dismissFoundDocument(doc.filePath);
      }
    });
    
    setPhase('complete');
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold dark:text-white">Document Scanner</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {phase === 'scanning' && 'Scanning your device...'}
                {phase === 'review' && `Found ${currentBatch.length} documents`}
                {phase === 'complete' && 'Scan complete'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Scanning Phase */}
          {phase === 'scanning' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Looking for documents on your device...
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl mb-4">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Review Phase */}
          {phase === 'review' && currentBatch.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                We found some documents that might be IDs or important documents. 
                Would you like to save them?
              </p>
              
              {currentBatch.map((doc, index) => {
                const result = importResults.get(doc.filePath);
                const isProcessing = processingIndex === index;
                
                return (
                  <div 
                    key={doc.filePath}
                    className={`border dark:border-gray-700 rounded-xl p-3 ${
                      result?.success ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Thumbnail */}
                      <div className="w-16 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        {doc.thumbnailBase64 ? (
                          <img 
                            src={`data:image/jpeg;base64,${doc.thumbnailBase64}`}
                            alt={doc.fileName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {doc.isPdf ? (
                              <FileText className="w-8 h-8 text-gray-400" />
                            ) : (
                              <Image className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {doc.fileName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {doc.folderName} • {formatFileSize(doc.fileSize)}
                          {doc.isPdf && ` • ${doc.pageCount} pages`}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {doc.matchReason}
                        </p>
                        
                        {result?.success && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            ✓ Saved as {result.documentType} 
                            {result.personName && ` - ${result.personName}`}
                          </p>
                        )}
                        
                        {result && !result.success && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            ✗ {result.error}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      {!result && (
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleSaveDocument(doc, index)}
                            disabled={isProcessing}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
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
                            className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* More indicator */}
              {hasMore && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                  +{totalRemaining} more documents found
                </p>
              )}
            </div>
          )}

          {/* Complete Phase */}
          {phase === 'complete' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold dark:text-white mb-2">
                All Done!
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                {importResults.size > 0 
                  ? `Saved ${Array.from(importResults.values()).filter(r => r.success).length} documents`
                  : 'No new documents to import'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-700 flex justify-between">
          {phase === 'review' && (
            <>
              <button
                onClick={handleSkipAll}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Skip All
              </button>
              <button
                onClick={handleContinue}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
              >
                {hasMore ? 'See More' : 'Done'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
          
          {phase === 'complete' && (
            <button
              onClick={handleComplete}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Continue to App
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// HOOK FOR APP STARTUP
// ============================================================================

export const useDocumentScanner = () => {
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    checkShouldScan();
  }, []);

  const checkShouldScan = () => {
    if (window.Android?.shouldScanDevice) {
      const shouldScan = window.Android.shouldScanDevice();
      console.log('[Scanner] Should scan:', shouldScan);
      setShowScanner(shouldScan);
    }
  };

  const closeScanner = () => {
    setShowScanner(false);
  };

  return {
    showScanner,
    setShowScanner,
    closeScanner
  };
};

export default DocumentScannerModal;
