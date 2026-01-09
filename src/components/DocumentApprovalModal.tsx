import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, Edit2, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface CategoryOption {
  id: string;
  name: string;
}

interface DocumentPreview {
  id: string;
  category: string;
  categoryDisplay: string;
  categoryIcon: string;
  subcategory: string;
  subcategoryDisplay: string;
  personName: string;
  referenceNumber: string;
  date: string;
  summary: string;
  confidence: number;
  isValid: boolean;
  extractionMethod: string;
  imageBase64: string;
  allCategories: CategoryOption[];
  subcategories: CategoryOption[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentApprovalModal({ isOpen, onClose }: Props) {
  const [preview, setPreview] = useState<DocumentPreview | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedData, setEditedData] = useState<Partial<DocumentPreview>>({});

  useEffect(() => {
    // Listen for document preview from Android
    window.onDocumentPreview = (data: DocumentPreview) => {
      console.log('[Approval] Received preview:', data);
      setPreview(data);
      setEditedData({});
      setIsEditing(false);
      setIsLoading(false);
    };

    window.onDocumentApproved = (response: any) => {
      console.log('[Approval] Document approved:', response);
      setIsLoading(false);
      setPreview(null);
      onClose();
    };

    window.onDocumentRejected = () => {
      console.log('[Approval] Document rejected');
      setIsLoading(false);
      setPreview(null);
      onClose();
    };

    window.onApprovalError = (error: any) => {
      console.error('[Approval] Error:', error);
      setIsLoading(false);
    };

    return () => {
      window.onDocumentPreview = undefined;
      window.onDocumentApproved = undefined;
      window.onDocumentRejected = undefined;
      window.onApprovalError = undefined;
    };
  }, [onClose]);

  const handleApprove = () => {
    if (!window.Android?.approveDocument) return;
    setIsLoading(true);
    window.Android.approveDocument();
  };

  const handleReject = () => {
    if (!window.Android?.rejectDocument) return;
    window.Android.rejectDocument();
    setPreview(null);
    onClose();
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({
      personName: preview?.personName || '',
      referenceNumber: preview?.referenceNumber || '',
      date: preview?.date || '',
      summary: preview?.summary || '',
      category: preview?.category || '',
      subcategory: preview?.subcategory || '',
    });
  };

  const handleSaveEdit = () => {
    if (!window.Android?.editDocument) return;
    window.Android.editDocument(JSON.stringify(editedData));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData({});
  };

  if (!preview) return null;

  const confidencePercent = Math.round((preview.confidence || 0) * 100);

  return (
    <Dialog open={isOpen && !!preview} onOpenChange={() => !isLoading && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {preview.isValid ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            Document Preview
          </DialogTitle>
        </DialogHeader>

        {/* Image Preview */}
        {preview.imageBase64 && (
          <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
            <img
              src={`data:image/jpeg;base64,${preview.imageBase64}`}
              alt="Document preview"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Extraction Info */}
        <div className="space-y-4">
          {/* Category & Subcategory */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Category</Label>
              {isEditing ? (
                <Select
                  value={editedData.category || preview.category}
                  onValueChange={(value) => setEditedData({ ...editedData, category: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {preview.allCategories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm font-medium">{preview.categoryDisplay}</p>
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Type</Label>
              {isEditing ? (
                <Select
                  value={editedData.subcategory || preview.subcategory}
                  onValueChange={(value) => setEditedData({ ...editedData, subcategory: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {preview.subcategories?.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm font-medium">{preview.subcategoryDisplay}</p>
              )}
            </div>
          </div>

          {/* Person Name */}
          <div>
            <Label className="text-xs text-muted-foreground">Person Name</Label>
            {isEditing ? (
              <Input
                value={editedData.personName || ''}
                onChange={(e) => setEditedData({ ...editedData, personName: e.target.value })}
                className="mt-1"
              />
            ) : (
              <p className="text-sm font-medium">{preview.personName || 'Not detected'}</p>
            )}
          </div>

          {/* Reference Number */}
          <div>
            <Label className="text-xs text-muted-foreground">Reference/ID Number</Label>
            {isEditing ? (
              <Input
                value={editedData.referenceNumber || ''}
                onChange={(e) => setEditedData({ ...editedData, referenceNumber: e.target.value })}
                className="mt-1"
              />
            ) : (
              <p className="text-sm font-medium font-mono">{preview.referenceNumber || 'Not detected'}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <Label className="text-xs text-muted-foreground">Date</Label>
            {isEditing ? (
              <Input
                value={editedData.date || ''}
                onChange={(e) => setEditedData({ ...editedData, date: e.target.value })}
                className="mt-1"
                placeholder="DD/MM/YYYY"
              />
            ) : (
              <p className="text-sm font-medium">{preview.date || 'Not detected'}</p>
            )}
          </div>

          {/* Summary */}
          <div>
            <Label className="text-xs text-muted-foreground">Summary</Label>
            {isEditing ? (
              <Input
                value={editedData.summary || ''}
                onChange={(e) => setEditedData({ ...editedData, summary: e.target.value })}
                className="mt-1"
              />
            ) : (
              <p className="text-sm">{preview.summary}</p>
            )}
          </div>

          {/* Confidence */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Confidence: {confidencePercent}%</span>
            <span>Method: {preview.extractionMethod}</span>
          </div>
        </div>

        <DialogFooter className="flex gap-2 mt-4">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={isLoading}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleReject} disabled={isLoading}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button variant="outline" onClick={handleEdit} disabled={isLoading}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button onClick={handleApprove} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Approve
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
