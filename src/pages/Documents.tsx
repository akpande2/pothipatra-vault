import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Plus, ChevronRight, FileText, 
  Grid, List, SortAsc, SortDesc, Trash2, Eye,
  MoreVertical, X, Check, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

import { DocumentFieldsDisplay, getDocumentTypeIcon, getDocumentTypeColor } from '../components/DocumentFieldsDisplay';
import { DocumentViewer } from '../components/DocumentViewer';

// ============================================================================
// TYPES
// ============================================================================

interface DocumentSummary {
  id: string;
  documentType: string;
  documentTypeDisplay: string;
  personName: string;
  identifier: string;
  summary: string;
  pageCount: number;
  confidence: number;
  createdAt: number;
  isValid: boolean;
  thumbnail: string;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'date' | 'type' | 'name';
type SortOrder = 'asc' | 'desc';

// ============================================================================
// DOCUMENTS PAGE
// ============================================================================

const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Viewer state
  const [viewerDocId, setViewerDocId] = useState<string | null>(null);
  
  // Delete confirmation
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);

  // Load documents
  useEffect(() => {
    loadDocuments();
  }, []);

  // Filter and sort documents
  useEffect(() => {
    let filtered = [...documents];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.personName.toLowerCase().includes(query) ||
        doc.identifier.toLowerCase().includes(query) ||
        doc.documentTypeDisplay.toLowerCase().includes(query) ||
        doc.summary.toLowerCase().includes(query)
      );
    }
    
    // Type filter
    if (selectedType) {
      filtered = filtered.filter(doc => doc.documentType === selectedType);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.createdAt - b.createdAt;
          break;
        case 'type':
          comparison = a.documentType.localeCompare(b.documentType);
          break;
        case 'name':
          comparison = a.personName.localeCompare(b.personName);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredDocuments(filtered);
  }, [documents, searchQuery, selectedType, sortBy, sortOrder]);

  const loadDocuments = useCallback(() => {
    setIsLoading(true);
    
    try {
      // Try V2 storage first
      if (window.Android?.getAllDocumentsV2) {
        const json = window.Android.getAllDocumentsV2();
        const docs = JSON.parse(json || '[]');
        console.log('[Documents] Loaded V2:', docs.length);
        setDocuments(docs);
      } 
      // Fallback to legacy
      else if (window.Android?.getAllIDs) {
        const json = window.Android.getAllIDs();
        const ids = JSON.parse(json || '[]');
        // Convert legacy format
        const docs: DocumentSummary[] = ids.map((id: any) => ({
          id: id.id,
          documentType: id.docType || 'UNKNOWN',
          documentTypeDisplay: id.docType?.replace(/_/g, ' ') || 'Unknown',
          personName: id.name || '',
          identifier: id.idNumber || '',
          summary: `${id.docType}: ${id.idNumber}`,
          pageCount: 1,
          confidence: id.confidence || 0.5,
          createdAt: id.timestamp || Date.now(),
          isValid: id.isValid ?? true,
          thumbnail: ''
        }));
        setDocuments(docs);
      }
    } catch (e) {
      console.error('[Documents] Error loading:', e);
      toast.error('Failed to load documents');
    }
    
    setIsLoading(false);
  }, []);

  const handleDeleteDocument = (docId: string) => {
    try {
      let success = false;
      
      if (window.Android?.deleteDocumentV2) {
        success = window.Android.deleteDocumentV2(docId);
      } else if (window.Android?.deleteID) {
        success = window.Android.deleteID(docId);
      }
      
      if (success) {
        setDocuments(prev => prev.filter(d => d.id !== docId));
        toast.success('Document deleted');
      } else {
        toast.error('Failed to delete document');
      }
    } catch (e) {
      console.error('[Documents] Error deleting:', e);
      toast.error('Failed to delete document');
    }
    
    setDeleteDocId(null);
  };

  const handleScan = () => {
    if (window.Android?.startScanner) {
      window.Android.startScanner();
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get unique document types for filter
  const documentTypes = [...new Set(documents.map(d => d.documentType))];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold dark:text-white">Documents</h1>
            <button
              onClick={handleScan}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
            >
              <Plus className="w-4 h-4" />
              Scan
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
        
        {/* Filters & View Toggle */}
        <div className="px-4 py-2 flex items-center justify-between border-t dark:border-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                showFilters || selectedType 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filter
              {selectedType && <span className="ml-1">•</span>}
            </button>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              {sortBy === 'date' ? 'Date' : sortBy === 'type' ? 'Type' : 'Name'}
            </button>
          </div>
          
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
            >
              <Grid className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
            >
              <List className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="px-4 py-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 mb-2">Document Type</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedType(null)}
                className={`px-3 py-1.5 rounded-full text-sm ${
                  !selectedType 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                All
              </button>
              {documentTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(selectedType === type ? null : type)}
                  className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${
                    selectedType === type 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <span>{getDocumentTypeIcon(type)}</span>
                  {type.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            
            <p className="text-xs text-gray-500 mt-3 mb-2">Sort By</p>
            <div className="flex gap-2">
              {(['date', 'type', 'name'] as SortBy[]).map(sort => (
                <button
                  key={sort}
                  onClick={() => setSortBy(sort)}
                  className={`px-3 py-1.5 rounded-full text-sm capitalize ${
                    sortBy === sort 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {sort}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || selectedType ? 'No documents match your filters' : 'No documents yet'}
            </p>
            <button
              onClick={handleScan}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-xl"
            >
              Scan Your First Document
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-2 gap-3">
            {filteredDocuments.map(doc => (
              <div
                key={doc.id}
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border dark:border-gray-700"
              >
                {/* Thumbnail */}
                <div 
                  onClick={() => setViewerDocId(doc.id)}
                  className="aspect-[3/4] bg-gray-100 dark:bg-gray-700 relative cursor-pointer"
                >
                  {doc.thumbnail ? (
                    <img
                      src={`data:image/jpeg;base64,${doc.thumbnail}`}
                      alt={doc.documentTypeDisplay}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">{getDocumentTypeIcon(doc.documentType)}</span>
                    </div>
                  )}
                  
                  {/* Page count badge */}
                  {doc.pageCount > 1 && (
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                      {doc.pageCount} pages
                    </div>
                  )}
                  
                  {/* Type badge */}
                  <div className={`absolute bottom-2 left-2 text-xs px-2 py-0.5 rounded-full ${getDocumentTypeColor(doc.documentType)}`}>
                    {doc.documentTypeDisplay}
                  </div>
                </div>
                
                {/* Info */}
                <div className="p-3">
                  <p className="font-medium dark:text-white truncate">{doc.personName || 'Unknown'}</p>
                  <p className="text-xs text-gray-500 truncate">{doc.identifier}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{formatDate(doc.createdAt)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteDocId(doc.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="space-y-2">
            {filteredDocuments.map(doc => (
              <div
                key={doc.id}
                onClick={() => setViewerDocId(doc.id)}
                className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border dark:border-gray-700 flex items-center gap-3 cursor-pointer"
              >
                {/* Icon/Thumbnail */}
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getDocumentTypeColor(doc.documentType)}`}>
                  {doc.thumbnail ? (
                    <img
                      src={`data:image/jpeg;base64,${doc.thumbnail}`}
                      alt={doc.documentTypeDisplay}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-2xl">{getDocumentTypeIcon(doc.documentType)}</span>
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium dark:text-white truncate">{doc.personName || 'Unknown'}</p>
                    {doc.pageCount > 1 && (
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                        {doc.pageCount}p
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{doc.identifier}</p>
                  <p className="text-xs text-gray-400">{doc.documentTypeDisplay} • {formatDate(doc.createdAt)}</p>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteDocId(doc.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Stats */}
        {!isLoading && documents.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-4">
            {filteredDocuments.length} of {documents.length} documents
          </p>
        )}
      </main>

      {/* Document Viewer */}
      {viewerDocId && (
        <DocumentViewer
          documentId={viewerDocId}
          isOpen={!!viewerDocId}
          onClose={() => setViewerDocId(null)}
          onDelete={(id) => {
            setDocuments(prev => prev.filter(d => d.id !== id));
            setViewerDocId(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteDocId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold dark:text-white">Delete Document?</h3>
                <p className="text-sm text-gray-500">This cannot be undone</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteDocId(null)}
                className="flex-1 py-2.5 bg-gray-200 dark:bg-gray-700 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDocument(deleteDocId)}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium"
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

export default DocumentsPage;
