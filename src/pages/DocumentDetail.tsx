import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Trash2, Share2, Download, CheckCircle, 
  AlertCircle, Calendar, Hash, User, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Document {
  id: string;
  category: string;
  categoryDisplay: string;
  subcategory: string;
  subcategoryDisplay: string;
  personName: string;
  referenceNumber: string;
  date: string;
  summary: string;
  confidence: number;
  isValid: boolean;
  createdAt: number;
  updatedAt: number;
  icon: string;
}

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      loadDocument(id);
    }
  }, [id]);

  const loadDocument = (docId: string) => {
    if (!window.Android?.getDocument) {
      // Mock data
      setDocument({
        id: docId,
        category: 'IDENTITY_CIVIL',
        categoryDisplay: 'Identity & Civil',
        subcategory: 'AADHAAR',
        subcategoryDisplay: 'Aadhaar Card',
        personName: 'Ashish Kumar Pandey',
        referenceNumber: '1234 5678 9012',
        date: '15/08/1990',
        summary: 'Aadhaar Card for Ashish Kumar Pandey',
        confidence: 0.95,
        isValid: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        icon: 'id-card',
      });
      setIsLoading(false);
      return;
    }

    try {
      const result = window.Android.getDocument(docId);
      const parsed = JSON.parse(result);
      setDocument(parsed);

      // Load image separately
      if (window.Android.getDocumentImage) {
        const img = window.Android.getDocumentImage(docId);
        setImageBase64(img);
      }
    } catch (e) {
      console.error('Error loading document:', e);
    }
    setIsLoading(false);
  };

  const handleDelete = () => {
    if (!id || !window.Android?.deleteDocument) return;
    
    const success = window.Android.deleteDocument(id);
    if (success) {
      navigate(-1);
    }
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share document:', id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <p className="text-muted-foreground">Document not found</p>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const confidencePercent = Math.round((document.confidence || 0) * 100);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold">Document Details</h1>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Document Image */}
        {imageBase64 && (
          <Card className="overflow-hidden">
            <img
              src={`data:image/jpeg;base64,${imageBase64}`}
              alt="Document"
              className="w-full h-auto"
            />
          </Card>
        )}

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {document.isValid ? (
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              Valid
            </Badge>
          ) : (
            <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
              <AlertCircle className="h-3 w-3 mr-1" />
              Needs Review
            </Badge>
          )}
          <Badge variant="outline">
            {confidencePercent}% confidence
          </Badge>
        </div>

        {/* Document Info */}
        <Card className="p-4 space-y-4">
          {/* Category & Type */}
          <div>
            <p className="text-xs text-muted-foreground">Category</p>
            <p className="font-medium">{document.categoryDisplay}</p>
            <p className="text-sm text-muted-foreground">{document.subcategoryDisplay}</p>
          </div>

          {/* Person Name */}
          {document.personName && (
            <div className="flex items-start gap-3">
              <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Person</p>
                <p className="font-medium">{document.personName}</p>
              </div>
            </div>
          )}

          {/* Reference Number */}
          {document.referenceNumber && (
            <div className="flex items-start gap-3">
              <Hash className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Reference Number</p>
                <p className="font-mono font-medium">{document.referenceNumber}</p>
              </div>
            </div>
          )}

          {/* Date */}
          {document.date && (
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-medium">{document.date}</p>
              </div>
            </div>
          )}

          {/* Summary */}
          <div>
            <p className="text-xs text-muted-foreground">Summary</p>
            <p className="text-sm">{document.summary}</p>
          </div>

          {/* Timestamps */}
          <div className="pt-2 border-t text-xs text-muted-foreground">
            <p>Added: {new Date(document.createdAt).toLocaleDateString()}</p>
            {document.updatedAt !== document.createdAt && (
              <p>Updated: {new Date(document.updatedAt).toLocaleDateString()}</p>
            )}
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this document. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
