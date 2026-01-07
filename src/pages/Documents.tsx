import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  FileText, 
  CreditCard, 
  User, 
  Calendar, 
  CheckCircle, 
  XCircle,
  Trash2,
  Eye,
  MoreVertical,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// ============================================================================
// TYPES (same as UploadID.tsx)
// ============================================================================

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

// ============================================================================
// STORAGE
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

function deleteDocument(id: string): boolean {
  try {
    const documents = getStoredDocuments();
    const filtered = documents.filter(d => d.id !== id);
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('[Storage] Failed to delete document:', e);
    return false;
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

const Documents: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<SavedDocument | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    const docs = getStoredDocuments();
    // Sort by creation date, newest first
    docs.sort((a, b) => b.createdAt - a.createdAt);
    setDocuments(docs);
    console.log('[Documents] Loaded:', docs.length, 'documents');
  };

  const handleDelete = (doc: SavedDocument) => {
    if (confirm(`Delete ${getDocTypeName(doc.type)}?\n${doc.idNumber}`)) {
      const success = deleteDocument(doc.id);
      if (success) {
        toast.success('Document deleted');
        loadDocuments();
      } else {
        toast.error('Failed to delete document');
      }
    }
  };

  const handleView = (doc: SavedDocument) => {
    setSelectedDoc(doc);
    setIsViewDialogOpen(true);
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

  const getDocTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'AADHAAR': return <CreditCard className="h-5 w-5 text-orange-500" />;
      case 'PAN': return <CreditCard className="h-5 w-5 text-blue-500" />;
      case 'VOTER_ID': return <FileText className="h-5 w-5 text-purple-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getDocTypeColor = (type: string): string => {
    switch (type.toUpperCase()) {
      case 'AADHAAR': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20';
      case 'PAN': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20';
      case 'VOTER_ID': return 'border-l-purple-500 bg-purple-50 dark:bg-purple-950/20';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const formatIdNumber = (type: string, id: string): string => {
    if (type.toUpperCase() === 'AADHAAR' && id.length === 12) {
      return `${id.slice(0,4)} ${id.slice(4,8)} ${id.slice(8,12)}`;
    }
    return id;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">My Documents</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={loadDocuments}
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/upload')}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-md mx-auto">
        {documents.length === 0 ? (
          // Empty State
          <Card className="mt-8">
            <CardContent className="pt-6 text-center">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-lg font-medium mb-2">No Documents Yet</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Scan your first ID document to get started
              </p>
              <Button onClick={() => navigate('/upload')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Document List
          <div className="space-y-4">
            {documents.map((doc) => (
              <Card 
                key={doc.id} 
                className={`border-l-4 ${getDocTypeColor(doc.type)} cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => handleView(doc)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {/* Document Icon or Thumbnail */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white dark:bg-slate-800 border flex items-center justify-center overflow-hidden">
                        {doc.imageBase64 ? (
                          <img 
                            src={`data:image/jpeg;base64,${doc.imageBase64}`}
                            alt={doc.type}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          getDocTypeIcon(doc.type)
                        )}
                      </div>

                      {/* Document Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm">
                            {getDocTypeName(doc.type)}
                          </h3>
                          {doc.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        
                        <p className="font-mono text-sm text-muted-foreground">
                          {formatIdNumber(doc.type, doc.idNumber)}
                        </p>
                        
                        {doc.name && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            <User className="h-3 w-3 inline mr-1" />
                            {doc.name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleView(doc); }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={(e) => { e.stopPropagation(); handleDelete(doc); }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-muted-foreground">
                      Added {formatDate(doc.createdAt)}
                    </span>
                    {doc.dob && (
                      <span className="text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        DOB: {doc.dob}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        {documents.length > 0 && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h3 className="font-medium mb-3">Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{documents.length}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {documents.filter(d => d.isValid).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Verified</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-600">
                    {documents.filter(d => !d.isValid).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Document Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDoc && getDocTypeName(selectedDoc.type)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedDoc && (
            <div className="space-y-4">
              {/* Image */}
              {selectedDoc.imageBase64 && (
                <div className="w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                  <img 
                    src={`data:image/jpeg;base64,${selectedDoc.imageBase64}`}
                    alt={selectedDoc.type}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Details */}
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">ID Number</span>
                  <span className="font-mono font-medium">
                    {formatIdNumber(selectedDoc.type, selectedDoc.idNumber)}
                  </span>
                </div>
                
                {selectedDoc.name && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{selectedDoc.name}</span>
                  </div>
                )}
                
                {selectedDoc.dob && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Date of Birth</span>
                    <span className="font-medium">{selectedDoc.dob}</span>
                  </div>
                )}
                
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-medium flex items-center gap-1 ${
                    selectedDoc.isValid ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {selectedDoc.isValid ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Verified
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        Pending Verification
                      </>
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Added</span>
                  <span className="text-sm">{formatDate(selectedDoc.createdAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    handleDelete(selectedDoc);
                    setIsViewDialogOpen(false);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Documents;
