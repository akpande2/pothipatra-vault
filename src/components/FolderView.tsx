import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, FileText, Trash2, AlertCircle, Eye
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

interface DocumentItem {
  id: string;
  docType: string;
  idNumber: string;
  name: string;
  dob: string;
  isValid: boolean;
  confidence: number;
  timestamp: number;
}

interface FolderViewProps {
  searchQuery?: string;
  viewMode?: 'grid' | 'list';
  sortBy?: 'date' | 'type' | 'name';
  sortOrder?: 'asc' | 'desc';
  selectedType?: string | null;
}

// Document type configuration
const DOC_TYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  'AADHAAR': { icon: '🪪', label: 'Aadhaar Card', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' },
  'PAN': { icon: '💳', label: 'PAN Card', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
  'VOTER_ID': { icon: '🗳️', label: 'Voter ID', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
  'DRIVING_LICENSE': { icon: '🚗', label: 'Driving License', color: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
  'PASSPORT': { icon: '🛂', label: 'Passport', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' },
  'BIRTH_CERTIFICATE': { icon: '👶', label: 'Birth Certificate', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600' },
  'VEHICLE_RC': { icon: '🏍️', label: 'Vehicle RC', color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600' },
  'RATION_CARD': { icon: '🍚', label: 'Ration Card', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' },
  'IDENTITY_CIVIL': { icon: '📋', label: 'Identity Document', color: 'bg-slate-100 dark:bg-slate-900/30 text-slate-600' },
  'FINANCIAL': { icon: '💰', label: 'Financial Document', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' },
  'EDUCATION': { icon: '🎓', label: 'Education Certificate', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600' },
  'MEDICAL': { icon: '🏥', label: 'Medical Record', color: 'bg-red-100 dark:bg-red-900/30 text-red-600' },
  'UTILITY': { icon: '⚡', label: 'Utility Bill', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' },
  'PROPERTY': { icon: '🏠', label: 'Property Document', color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600' },
  'LEGAL': { icon: '⚖️', label: 'Legal Document', color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-600' },
  'OTHER': { icon: '📄', label: 'Other Document', color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-600' },
  'UNKNOWN': { icon: '📄', label: 'Unknown', color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-600' },
};

// ============================================================================
// FOLDER VIEW COMPONENT
// ============================================================================

export function FolderView({ 
  searchQuery = '', 
  viewMode = 'list',
  sortBy = 'date',
  sortOrder = 'desc',
  selectedType = null
}: FolderViewProps) {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [expandedType, setExpandedType] = useState<string | null>(null);

  // Load documents
  useEffect(() => {
    loadDocuments();
  }, []);

  // Filter and sort documents
  useEffect(() => {
    console.log('[FolderView] Filtering - documents:', documents.length, 'searchQuery:', searchQuery, 'selectedType:', selectedType);
    
    let filtered = [...documents];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.name?.toLowerCase().includes(query) ||
        doc.idNumber?.toLowerCase().includes(query) ||
        doc.docType?.toLowerCase().includes(query)
      );
      console.log('[FolderView] After search filter:', filtered.length);
    }
    
    // Type filter
    if (selectedType) {
      filtered = filtered.filter(doc => doc.docType === selectedType);
      console.log('[FolderView] After type filter:', filtered.length);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = (a.timestamp || 0) - (b.timestamp || 0);
          break;
        case 'type':
          comparison = (a.docType || '').localeCompare(b.docType || '');
          break;
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    console.log('[FolderView] Final filtered count:', filtered.length);
    setFilteredDocs(filtered);
  }, [documents, searchQuery, selectedType, sortBy, sortOrder]);

  const loadDocuments = () => {
    setIsLoading(true);
    
    try {
      if (window.Android?.getAllIDs) {
        const json = window.Android.getAllIDs();
        console.log('[FolderView] Raw JSON length:', json?.length);
        
        const rawDocs = JSON.parse(json || '[]');
        console.log('[FolderView] Parsed documents count:', rawDocs.length);
        
        if (rawDocs.length > 0) {
          console.log('[FolderView] First doc sample:', JSON.stringify(rawDocs[0]));
        }
        
        // Map to expected format - handle both old and new formats
        const docs: DocumentItem[] = rawDocs.map((doc: any) => ({
          id: doc.id,
          // Map category/subcategory to docType for display
          docType: doc.subcategory || doc.category || doc.docType || 'UNKNOWN',
          idNumber: doc.referenceNumber || doc.idNumber || '',
          name: doc.personName || doc.name || '',
          dob: doc.date || doc.dob || '',
          isValid: doc.isValid ?? true,
          confidence: doc.confidence || 0.5,
          timestamp: doc.timestamp || doc.createdAt || Date.now()
        }));
        
        console.log('[FolderView] Mapped documents:', docs.length);
        if (docs.length > 0) {
          console.log('[FolderView] First mapped doc:', JSON.stringify(docs[0]));
        }
        
        setDocuments(docs);
      } else {
        console.error('[FolderView] Android.getAllIDs not available');
      }
    } catch (e) {
      console.error('[FolderView] Error loading:', e);
      toast.error('Failed to load documents');
    }
    
    setIsLoading(false);
  };

  const handleDeleteDocument = (docId: string) => {
    try {
      let success = false;
      
      console.log('[FolderView] Deleting document:', docId);
      
      // Try deleteDocument first (standard method), then deleteID as fallback
      if (window.Android?.deleteDocument) {
        console.log('[FolderView] Using deleteDocument');
        success = window.Android.deleteDocument(docId);
      } else if (window.Android?.deleteID) {
        console.log('[FolderView] Using deleteID (fallback)');
        success = window.Android.deleteID(docId);
      } else {
        console.error('[FolderView] No delete method available on Android bridge');
      }
      
      console.log('[FolderView] Delete result:', success);
      
      if (success) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
        toast.success('Document deleted');
      } else {
        toast.error('Failed to delete document');
      }
    } catch (e) {
      console.error('[FolderView] Error deleting:', e);
      toast.error('Failed to delete document');
    }
    
    setDeleteDocId(null);
  };

  const handleViewDocument = (docId: string) => {
    console.log('[FolderView] Opening document:', docId);
    
    // Call Android bridge to view document
    if (window.Android?.viewDocument) {
      window.Android.viewDocument(docId);
    } else {
      // Fallback: dispatch event for web-based viewer
      window.dispatchEvent(new CustomEvent('viewDocument', { detail: { documentId: docId } }));
    }
  };

  const formatDate = (timestamp: number): string => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTypeConfig = (type: string) => {
    return DOC_TYPE_CONFIG[type?.toUpperCase()] || DOC_TYPE_CONFIG['UNKNOWN'];
  };

  // Group documents by type
  const groupedDocs = filteredDocs.reduce((acc, doc) => {
    const type = doc.docType || 'UNKNOWN';
    if (!acc[type]) acc[type] = [];
    acc[type].push(doc);
    return acc;
  }, {} as Record<string, DocumentItem[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (filteredDocs.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          {searchQuery || selectedType ? 'No documents match your filters' : 'No documents yet'}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Scan a document to get started
        </p>
      </div>
    );
  }

  // Grid View
  if (viewMode === 'grid') {
    return (
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredDocs.map(doc => {
            const config = getTypeConfig(doc.docType);
            return (
              <div
                key={doc.id}
                className="bg-card rounded-xl overflow-hidden shadow-sm border"
              >
                {/* Icon Area */}
                <div 
                  onClick={() => handleViewDocument(doc.id)}
                  className={`aspect-square ${config.color} flex items-center justify-center cursor-pointer`}
                >
                  <span className="text-5xl">{config.icon}</span>
                </div>
                
                {/* Info */}
                <div className="p-3">
                  <p className="font-medium truncate">{doc.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground truncate">{doc.idNumber}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{formatDate(doc.timestamp)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteDocId(doc.id);
                      }}
                      className="p-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Delete Confirmation */}
        {deleteDocId && (
          <DeleteConfirmModal 
            onConfirm={() => handleDeleteDocument(deleteDocId)}
            onCancel={() => setDeleteDocId(null)}
          />
        )}
      </div>
    );
  }

  // List View - Grouped by Type
  return (
    <div className="p-4 space-y-4">
      {Object.entries(groupedDocs).map(([type, docs]) => {
        const config = getTypeConfig(type);
        const isExpanded = expandedType === type || selectedType === type || searchQuery !== '';
        
        return (
          <div key={type} className="bg-card rounded-xl border overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => setExpandedType(isExpanded ? null : type)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                  <span className="text-xl">{config.icon}</span>
                </div>
                <div className="text-left">
                  <p className="font-medium">{config.label}</p>
                  <p className="text-sm text-muted-foreground">{docs.length} document{docs.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
            
            {/* Documents List */}
            {isExpanded && (
              <div className="border-t divide-y">
                {docs.map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-4 hover:bg-muted/30"
                  >
                    <div className="flex-1 min-w-0" onClick={() => handleViewDocument(doc.id)}>
                      <p className="font-medium truncate">{doc.name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground truncate">{doc.idNumber}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(doc.timestamp)}</p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewDocument(doc.id)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteDocId(doc.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Delete Confirmation */}
      {deleteDocId && (
        <DeleteConfirmModal 
          onConfirm={() => handleDeleteDocument(deleteDocId)}
          onCancel={() => setDeleteDocId(null)}
        />
      )}
    </div>
  );
}

// ============================================================================
// DELETE CONFIRMATION MODAL
// ============================================================================

function DeleteConfirmModal({ 
  onConfirm, 
  onCancel 
}: { 
  onConfirm: () => void; 
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-6 max-w-sm w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-bold">Delete Document?</h3>
            <p className="text-sm text-muted-foreground">This cannot be undone</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-muted rounded-xl font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-destructive text-destructive-foreground rounded-xl font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default FolderView;
