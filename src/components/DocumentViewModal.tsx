import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, RotateCw, FileText, User, Hash, Calendar } from 'lucide-react';

interface DocumentData {
  id: string;
  categoryDisplay: string;
  subcategoryDisplay: string;
  personName: string;
  referenceNumber: string;
  date: string;
  summary: string;
  isValid: boolean;
  imageBase64: string;
}

export function DocumentViewModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    window.onDocumentView = (data: DocumentData) => {
      console.log('[DocView] Received document:', data.id);
      setDocument(data);
      setZoom(1);
      setRotation(0);
      setIsOpen(true);
    };

    return () => {
      window.onDocumentView = undefined;
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setDocument(null);
  };

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>{document.subcategoryDisplay}</span>
            {document.isValid && (
              <Badge variant="outline" className="text-green-600 border-green-500">Valid</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Info */}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground border-b pb-3">
          {document.personName && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{document.personName}</span>
            </div>
          )}
          {document.referenceNumber && (
            <div className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              <span className="font-mono">{document.referenceNumber}</span>
            </div>
          )}
          {document.date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{document.date}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2 py-2">
          <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="sm" onClick={() => setZoom(z => Math.min(3, z + 0.25))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setRotation(r => (r + 90) % 360)}>
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Image */}
        <div className="flex-1 overflow-auto bg-muted rounded-lg flex items-center justify-center min-h-[300px]">
          {document.imageBase64 ? (
            <img
              src={`data:image/jpeg;base64,${document.imageBase64}`}
              alt={document.subcategoryDisplay}
              className="rounded shadow-lg"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          ) : (
            <div className="text-muted-foreground flex flex-col items-center gap-2">
              <FileText className="h-12 w-12" />
              <span>No image</span>
            </div>
          )}
        </div>

        {document.summary && (
          <div className="pt-3 border-t">
            <p className="text-sm text-muted-foreground">{document.summary}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
