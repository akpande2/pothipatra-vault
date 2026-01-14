import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  RotateCw, Download, Share2, Trash2, Info,
  FileText, User, Calendar, Hash, MapPin
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface DocumentPage {
  pageNumber: number;
  imageBase64: string;
  ocrText: string;
  thumbnailBase64: string;
}

interface BaseDocument {
  id: string;
  documentType: string;
  pages: DocumentPage[];
  combinedOcrText: string;
  personName: string;
  confidence: number;
  isValid: boolean;
  createdAt: number;
  updatedAt: number;
  sourceFile?: string;
}

interface DocumentFields {
  [key: string]: any;
}

interface Document {
  base: BaseDocument;
  fields: DocumentFields;
  fieldType: string;
}

// ============================================================================
// DOCUMENT VIEWER MODAL
// ============================================================================

interface DocumentViewerProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentId,
  isOpen,
  onClose,
  onDelete
}) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageImage, setPageImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && documentId) {
      loadDocument();
    }
  }, [isOpen, documentId]);

  useEffect(() => {
    if (document && currentPage) {
      loadPageImage();
    }
  }, [document, currentPage]);

  const loadDocument = async () => {
    setIsLoading(true);
    
    try {
      if (window.Android?.getDocumentDetailsV2) {
        const json = window.Android.getDocumentDetailsV2(documentId);
        console.log('[Viewer] Document loaded:', json?.substring(0, 200));
        
        if (json && json !== '{}') {
          const doc = JSON.parse(json);
          setDocument(doc);
          setCurrentPage(1);
        }
      }
    } catch (e) {
      console.error('[Viewer] Error loading document:', e);
    }
    
    setIsLoading(false);
  };

  const loadPageImage = async () => {
    if (!document) return;
    
    // Try to get from pages array first
    const page = document.base.pages.find(p => p.pageNumber === currentPage);
    
    if (page?.imageBase64) {
      setPageImage(page.imageBase64);
      return;
    }
    
    // Fallback: load from Android
    if (window.Android?.getDocumentPageImage) {
      const image = window.Android.getDocumentPageImage(documentId, currentPage);
      setPageImage(image || '');
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (document && currentPage < document.base.pages.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.25, 0.5));
  };

  const handleDelete = () => {
    if (window.Android?.deleteDocumentV2) {
      const success = window.Android.deleteDocumentV2(documentId);
      if (success) {
        onDelete?.(documentId);
        onClose();
      }
    }
    setShowDeleteConfirm(false);
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDocumentTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'AADHAAR': '🪪',
      'PAN': '💳',
      'VOTER_ID': '🗳️',
      'DRIVING_LICENSE': '🚗',
      'PASSPORT': '🛂',
      'BIRTH_CERTIFICATE': '👶',
      'VEHICLE_RC': '🏍️',
      'RATION_CARD': '🍚'
    };
    return icons[type] || '📄';
  };

  const renderFieldValue = (key: string, value: any): React.ReactNode => {
    if (value === null || value === undefined || value === '') return null;
    
    // Skip internal fields
    if (['imageBase64', 'thumbnailBase64', 'ocrText', 'rawText'].includes(key)) return null;
    
    // Format key for display
    const displayKey = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
    
    // Handle arrays
    if (Array.isArray(value)) {
      if (value.length === 0) return null;
      return (
        <div key={key} className="py-2 border-b border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">{displayKey}</p>
          <p className="text-sm font-medium dark:text-white">{value.join(', ')}</p>
        </div>
      );
    }
    
    // Handle objects (nested)
    if (typeof value === 'object') {
      return null; // Skip complex objects for now
    }
    
    // Handle booleans
    if (typeof value === 'boolean') {
      return (
        <div key={key} className="py-2 border-b border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">{displayKey}</p>
          <p className="text-sm font-medium dark:text-white">{value ? 'Yes' : 'No'}</p>
        </div>
      );
    }
    
    return (
      <div key={key} className="py-2 border-b border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">{displayKey}</p>
        <p className="text-sm font-medium dark:text-white">{String(value)}</p>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80">
        <button onClick={onClose} className="p-2 text-white hover:bg-white/10 rounded-full">
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center text-white">
          <p className="font-medium">
            {document ? `${getDocumentTypeIcon(document.base.documentType)} ${document.fieldType}` : 'Loading...'}
          </p>
          {document && document.base.pages.length > 1 && (
            <p className="text-xs text-gray-400">
              Page {currentPage} of {document.base.pages.length}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-full ${showInfo ? 'bg-blue-500' : 'text-white hover:bg-white/10'}`}
          >
            <Info className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-red-400 hover:bg-white/10 rounded-full"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Image Area */}
        <div 
          ref={imageRef}
          className={`flex-1 overflow-auto flex items-center justify-center bg-gray-900 ${
            showInfo ? 'w-1/2' : 'w-full'
          }`}
        >
          {isLoading ? (
            <div className="text-white">Loading...</div>
          ) : pageImage ? (
            <img
              src={`data:image/jpeg;base64,${pageImage}`}
              alt={`Page ${currentPage}`}
              className="max-w-full max-h-full object-contain transition-transform"
              style={{ transform: `scale(${zoom})` }}
            />
          ) : (
            <div className="text-gray-500 flex flex-col items-center">
              <FileText className="w-16 h-16 mb-4" />
              <p>No image available</p>
            </div>
          )}
        </div>

        {/* Info Panel */}
        {showInfo && document && (
          <div className="w-1/2 bg-white dark:bg-gray-800 overflow-y-auto">
            <div className="p-4">
              {/* Document Type Header */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b dark:border-gray-700">
                <div className="text-4xl">
                  {getDocumentTypeIcon(document.base.documentType)}
                </div>
                <div>
                  <h3 className="font-bold text-lg dark:text-white">
                    {document.base.documentType.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {document.base.pages.length} page{document.base.pages.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {document.fields.name || document.base.personName ? (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="dark:text-white">
                      {document.fields.name || document.base.personName}
                    </span>
                  </div>
                ) : null}
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="dark:text-white">
                    {formatDate(document.base.createdAt)}
                  </span>
                </div>
              </div>

              {/* All Fields */}
              <div className="space-y-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Document Details
                </h4>
                {Object.entries(document.fields).map(([key, value]) => 
                  renderFieldValue(key, value)
                )}
              </div>

              {/* Confidence */}
              <div className="mt-4 pt-4 border-t dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Confidence</span>
                  <span className={`font-medium ${
                    document.base.confidence > 0.7 ? 'text-green-600' :
                    document.base.confidence > 0.4 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {Math.round(document.base.confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between p-4 bg-black/80">
        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-2 text-white disabled:opacity-30 hover:bg-white/10 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          {document && document.base.pages.length > 1 && (
            <div className="flex gap-1">
              {document.base.pages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-2 h-2 rounded-full ${
                    currentPage === idx + 1 ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}
          
          <button 
            onClick={handleNextPage}
            disabled={!document || currentPage >= document.base.pages.length}
            className="p-2 text-white disabled:opacity-30 hover:bg-white/10 rounded-full"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleZoomOut}
            className="p-2 text-white hover:bg-white/10 rounded-full"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-white text-sm w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button 
            onClick={handleZoomIn}
            className="p-2 text-white hover:bg-white/10 rounded-full"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        {/* Page Thumbnails */}
        {document && document.base.pages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto max-w-[200px]">
            {document.base.pages.map((page, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-12 h-16 rounded overflow-hidden border-2 flex-shrink-0 ${
                  currentPage === idx + 1 ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                {page.thumbnailBase64 ? (
                  <img 
                    src={`data:image/jpeg;base64,${page.thumbnailBase64}`}
                    alt={`Page ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center text-xs text-white">
                    {idx + 1}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold dark:text-white mb-2">Delete Document?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This action cannot be undone. The document will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
