import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, FileText, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface ExtractedData {
  doc_type?: string;
  id_number?: string;
  name?: string;
  dob?: string;
  is_valid?: boolean;
  confidence?: number;
}

interface ScanResult {
  success: boolean;
  cancelled?: boolean;
  error?: string;
  ocr_text?: string;
  image_base64?: string;
  has_image?: boolean;
  doc_type?: string;
  id_number?: string;
  name?: string;
  dob?: string;
  is_valid?: boolean;
  extraction?: ExtractedData;
  timestamp?: number;
}

interface SavedDocument {
  id: string;
  type: string;
  idNumber: string;
  name: string;
  dob: string;
  imageBase64: string;
  ocrText: string;
  isValid: boolean;
  createdAt: number;
  updatedAt: number;
}

type UploadSource = 'camera' | 'gallery' | 'files';

// ============================================================================
// DOCUMENT STORAGE
// ============================================================================

const DOCUMENTS_STORAGE_KEY = 'pothipatra_documents';

function getStoredDocuments(): SavedDocument[] {
  try {
    const stored = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('[Storage] Failed to read documents:', e);
    return [];
  }
}

function saveDocument(doc: SavedDocument): boolean {
  try {
    const documents = getStoredDocuments();
    
    // Check for duplicates by ID number
    const existingIndex = documents.findIndex(d => d.idNumber === doc.idNumber);
    if (existingIndex >= 0) {
      // Update existing document
      documents[existingIndex] = { ...doc, updatedAt: Date.now() };
      console.log('[Storage] Updated existing document:', doc.idNumber);
    } else {
      // Add new document
      documents.push(doc);
      console.log('[Storage] Added new document:', doc.idNumber);
    }
    
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(documents));
    return true;
  } catch (e) {
    console.error('[Storage] Failed to save document:', e);
    return false;
  }
}

function generateDocumentId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// ANDROID BRIDGE
// ============================================================================

// Types are declared in useAndroidBridge.ts

function isAndroidApp(): boolean {
  return typeof window !== 'undefined' && !!window.Android;
}

// ============================================================================
// COMPONENT
// ============================================================================

const UploadID: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isAndroid, setIsAndroid] = useState(false);

  // ========================================================================
  // INITIALIZATION
  // ========================================================================

  useEffect(() => {
    const androidDetected = isAndroidApp();
    setIsAndroid(androidDetected);
    console.log('[UploadID] Android detected:', androidDetected);

    // Setup scan complete callback
    window.onScanComplete = handleScanComplete;
    
    // Setup file selected callback (for gallery/files)
    window.onFileSelected = handleFileSelected;

    return () => {
      window.onScanComplete = undefined;
      window.onFileSelected = undefined;
    };
  }, []);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  /**
   * Handle scan result from Android camera
   */
  const handleScanComplete = (result: ScanResult) => {
    console.log('[UploadID] Scan complete:', {
      success: result.success,
      hasImage: result.has_image,
      docType: result.doc_type || result.extraction?.doc_type,
      idNumber: result.id_number || result.extraction?.id_number
    });

    setIsLoading(false);
    setLoadingMessage('');

    if (result.cancelled) {
      toast.info('Scan cancelled');
      return;
    }

    if (!result.success) {
      toast.error(result.error || 'Scan failed');
      return;
    }

    setScanResult(result);

    // Extract data from result (handle both flat and nested extraction)
    const docType = result.doc_type || result.extraction?.doc_type || 'UNKNOWN';
    const idNumber = result.id_number || result.extraction?.id_number || '';
    const name = result.name || result.extraction?.name || '';
    const dob = result.dob || result.extraction?.dob || '';
    const isValid = result.is_valid ?? result.extraction?.is_valid ?? false;
    const imageBase64 = result.image_base64 || '';
    const ocrText = result.ocr_text || '';

    // Validate we have required data
    if (!idNumber || idNumber === 'NOT_FOUND') {
      toast.error('Could not extract ID number from document');
      return;
    }

    // Create document object
    const document: SavedDocument = {
      id: generateDocumentId(),
      type: docType,
      idNumber: idNumber,
      name: name,
      dob: dob,
      imageBase64: imageBase64,
      ocrText: ocrText,
      isValid: isValid,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Save to storage
    const saved = saveDocument(document);
    
    if (saved) {
      toast.success(`${getDocTypeName(docType)} saved successfully!`, {
        description: `ID: ${formatIdNumber(docType, idNumber)}`
      });
      
      // Navigate to ID cards page after short delay
      setTimeout(() => {
        navigate('/id-cards');
      }, 1500);
    } else {
      toast.error('Failed to save document');
    }
  };

  /**
   * Handle file selected from gallery or file picker
   */
  const handleFileSelected = (data: { base64: string; mimeType: string; fileName: string }) => {
    console.log('[UploadID] File selected:', data.fileName, data.mimeType);
    
    setIsLoading(false);
    
    // For gallery/files, we receive the image but need to process it
    // The Android side should ideally run OCR on it too
    // For now, save as unprocessed document
    toast.info('Processing file...', { description: data.fileName });
    
    // TODO: Send to Android for OCR processing
    // For now, create a document with just the image
    const document: SavedDocument = {
      id: generateDocumentId(),
      type: 'UNKNOWN',
      idNumber: '',
      name: '',
      dob: '',
      imageBase64: data.base64,
      ocrText: '',
      isValid: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const saved = saveDocument(document);
    if (saved) {
      toast.success('File uploaded', { description: 'Processing required' });
      navigate('/id-cards');
    }
  };

  /**
   * Handle source button click
   */
  const handleSourceSelect = (source: UploadSource) => {
    console.log('[UploadID] Source selected:', source, 'isAndroid:', isAndroid);
    
    if (isAndroid && window.Android) {
      setIsLoading(true);
      
      switch (source) {
        case 'camera':
          setLoadingMessage('Opening camera...');
          console.log('[UploadID] Calling Android.openScanner()');
          window.Android.openScanner();
          break;
        case 'gallery':
          setLoadingMessage('Opening gallery...');
          console.log('[UploadID] Calling Android.openGallery()');
          window.Android.openGallery();
          break;
        case 'files':
          setLoadingMessage('Opening files...');
          console.log('[UploadID] Calling Android.openFilePicker()');
          window.Android.openFilePicker();
          break;
      }
    } else {
      // Web fallback - use file input
      if (fileInputRef.current) {
        fileInputRef.current.accept = source === 'camera' 
          ? 'image/*;capture=camera' 
          : source === 'gallery' 
            ? 'image/*' 
            : 'image/*,application/pdf';
        fileInputRef.current.click();
      }
    }
  };

  /**
   * Handle web file input change
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('[UploadID] Web file selected:', file.name, file.type);
    setIsLoading(true);
    setLoadingMessage('Processing file...');

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      
      // Create document with just the image
      const document: SavedDocument = {
        id: generateDocumentId(),
        type: 'UNKNOWN',
        idNumber: `WEB_${Date.now()}`,
        name: file.name,
        dob: '',
        imageBase64: base64,
        ocrText: '',
        isValid: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const saved = saveDocument(document);
      setIsLoading(false);
      
      if (saved) {
        toast.success('Document uploaded!');
        navigate('/id-cards');
      } else {
        toast.error('Failed to save document');
      }
    };
    reader.onerror = () => {
      setIsLoading(false);
      toast.error('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  // ========================================================================
  // HELPERS
  // ========================================================================

  const getDocTypeName = (type: string): string => {
    switch (type.toUpperCase()) {
      case 'AADHAAR': return 'Aadhaar Card';
      case 'PAN': return 'PAN Card';
      case 'VOTER_ID': return 'Voter ID';
      default: return 'Document';
    }
  };

  const formatIdNumber = (type: string, id: string): string => {
    if (type.toUpperCase() === 'AADHAAR' && id.length === 12) {
      return `${id.slice(0,4)} ${id.slice(4,8)} ${id.slice(8,12)}`;
    }
    return id;
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Upload Document</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-md mx-auto">
        {/* Mode indicator */}
        <div className="mb-6 text-center">
          <p className="text-sm text-muted-foreground">
            {isAndroid ? '🤖 Android Mode' : '🌐 Web Mode'}
          </p>
        </div>

        {/* Instructions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="text-lg font-medium mb-2">
              How would you like to upload your document?
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose an option below to scan or upload your ID document.
              Supported: Aadhaar, PAN Card, Voter ID
            </p>
          </CardContent>
        </Card>

        {/* Upload Options */}
        <div className="space-y-4">
          {/* Camera Button */}
          <Button
            className="w-full h-20 text-lg gap-4"
            variant="default"
            onClick={() => handleSourceSelect('camera')}
            disabled={isLoading}
          >
            <Camera className="h-8 w-8" />
            <div className="text-left">
              <div className="font-semibold">Scan with Camera</div>
              <div className="text-xs opacity-80">Take a photo of your document</div>
            </div>
          </Button>

          {/* Gallery Button */}
          <Button
            className="w-full h-20 text-lg gap-4"
            variant="outline"
            onClick={() => handleSourceSelect('gallery')}
            disabled={isLoading}
          >
            <Image className="h-8 w-8" />
            <div className="text-left">
              <div className="font-semibold">Choose from Gallery</div>
              <div className="text-xs opacity-80">Select an existing photo</div>
            </div>
          </Button>

          {/* Files Button */}
          <Button
            className="w-full h-20 text-lg gap-4"
            variant="outline"
            onClick={() => handleSourceSelect('files')}
            disabled={isLoading}
          >
            <FileText className="h-8 w-8" />
            <div className="text-left">
              <div className="font-semibold">Browse Files</div>
              <div className="text-xs opacity-80">Upload from your device</div>
            </div>
          </Button>
        </div>

        {/* Hidden file input for web fallback */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileInputChange}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium">{loadingMessage}</p>
            </Card>
          </div>
        )}

        {/* Success Preview (if result available) */}
        {scanResult?.success && !isLoading && (
          <Card className="mt-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold text-green-800 dark:text-green-400">
                  Document Scanned Successfully!
                </h3>
              </div>
              
              {scanResult.extraction && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">
                      {getDocTypeName(scanResult.doc_type || scanResult.extraction.doc_type || 'UNKNOWN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID Number:</span>
                    <span className="font-mono font-medium">
                      {scanResult.id_number || scanResult.extraction.id_number || 'N/A'}
                    </span>
                  </div>
                  {(scanResult.name || scanResult.extraction.name) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">
                        {scanResult.name || scanResult.extraction.name}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <p className="mt-4 text-xs text-muted-foreground">
                Redirecting to Documents...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-3">📸 Tips for best results</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Ensure good lighting</li>
              <li>• Keep the document flat</li>
              <li>• Capture the entire document</li>
              <li>• Avoid shadows and glare</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadID;
