import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface DocumentInfo {
  id: string;
  documentType?: string;
  category?: string;
  categoryDisplay?: string;
  subcategory?: string;
  subcategoryDisplay?: string;
  personName?: string;
  idNumber?: string;
  referenceNumber?: string;
  date?: string;
  dob?: string;
  summary?: string;
  isValid?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentInfo | null;
}

export function DocumentPreviewModal({ isOpen, onClose, document }: Props) {
  const [imageBase64, setImageBase64] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isOpen && document?.id) {
      loadDocumentImage(document.id);
    } else {
      setImageBase64('');
      setZoom(1);
      setRotation(0);
    }
  }, [isOpen, document?.id]);

  const loadDocumentImage = (docId: string) => {
    if (!window.Android?.getDocumentImage) {
      console.log('Android bridge not available');
      return;
    }

    setIsLoading(true);
    try {
      const base64 = window.Android.getDocumentImage(docId);
      setImageBase64(base64 || '');
    } catch (e) {
      console.error('Error loading document image:', e);
    }
    setIsLoading(false);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  if (!document) return null;

  const displayName = document.personName || document.subcategoryDisplay || document.documentType || 'Document';
  const displayNumber = document.referenceNumber || document.idNumber || '';
  const displayDate = document.date || document.dob || '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{displayName}</span>
              {document.isValid && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Valid
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Document Info */}
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground pb-2 border-b">
          {document.categoryDisplay && (
            <Badge variant="secondary">{document.categoryDisplay}</Badge>
          )}
          {document.subcategoryDisplay && (
            <Badge variant="outline">{document.subcategoryDisplay}</Badge>
          )}
          {displayNumber && (
            <span className="font-mono">{displayNumber}</span>
          )}
          {displayDate && (
            <span>{displayDate}</span>
          )}
        </div>

        {/* Image Controls */}
        <div className="flex items-center justify-center gap-2 py-2">
          <Button variant="outline" size="icon" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-16 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="outline" size="icon" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleRotate} title="Rotate">
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Document Image */}
        <div className="flex-1 overflow-auto bg-muted rounded-lg flex items-center justify-center min-h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : imageBase64 ? (
            <img
              src={`data:image/jpeg;base64,${imageBase64}`}
              alt={displayName}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          ) : (
            <div className="text-muted-foreground">No image available</div>
          )}
        </div>

        {/* Summary */}
        {document.summary && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">{document.summary}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
