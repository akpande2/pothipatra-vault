import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FolderView } from '@/components/FolderView';
import { PersonView } from '@/components/PersonView';
import { 
  Folder, Users, Search, Filter, Plus, 
  Grid, List, SortAsc, SortDesc, X, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

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

export default function Documents() {
  const [activeTab, setActiveTab] = useState('folders');
  
  // Search and filter state (shared across views)
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // Document types for filter (populated from loaded docs)
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load document types for filter dropdown
  useEffect(() => {
    loadDocumentTypes();
  }, []);

  const loadDocumentTypes = () => {
    try {
      if (window.Android?.getAllDocumentsV2) {
        const json = window.Android.getAllDocumentsV2();
        const docs = JSON.parse(json || '[]');
        const types = [...new Set(docs.map((d: any) => d.documentType))];
        setDocumentTypes(types as string[]);
      } else if (window.Android?.getAllIDs) {
        const json = window.Android.getAllIDs();
        const ids = JSON.parse(json || '[]');
        const types = [...new Set(ids.map((d: any) => d.docType).filter(Boolean))];
        setDocumentTypes(types as string[]);
      }
    } catch (e) {
      console.error('[Documents] Error loading types:', e);
    }
  };

  const handleScan = () => {
    if (window.Android?.startScanner) {
      window.Android.startScanner();
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    loadDocumentTypes();
    // Trigger refresh in child components via key change
    setTimeout(() => setIsRefreshing(false), 500);
    toast.success('Documents refreshed');
  };

  const getDocumentTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      'AADHAAR': '🪪',
      'PAN': '💳',
      'VOTER_ID': '🗳️',
      'DRIVING_LICENSE': '🚗',
      'PASSPORT': '🛂',
      'BIRTH_CERTIFICATE': '👶',
      'VEHICLE_RC': '🏍️',
      'RATION_CARD': '🍚',
      'OTHER': '📄',
      'UNKNOWN': '📄'
    };
    return icons[type?.toUpperCase()] || '📄';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Page Header with Search */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold">Saved Documents</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <RefreshCw className={`w-5 h-5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleScan}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                Scan
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, ID number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-muted border-0 rounded-xl focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="px-4 py-2 flex items-center justify-between border-t">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${
                showFilters || selectedType 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filter
              {selectedType && <span className="ml-1 w-2 h-2 bg-primary rounded-full" />}
            </button>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-muted text-muted-foreground"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              {sortBy === 'date' ? 'Date' : sortBy === 'type' ? 'Type' : 'Name'}
            </button>
          </div>
          
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-background shadow-sm' : ''}`}
            >
              <Grid className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-background shadow-sm' : ''}`}
            >
              <List className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        
        {/* Filter Panel */}
        {showFilters && (
          <div className="px-4 py-3 border-t bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Document Type</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedType(null)}
                className={`px-3 py-1.5 rounded-full text-sm ${
                  !selectedType 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
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
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <span>{getDocumentTypeIcon(type)}</span>
                  {type.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            
            <p className="text-xs text-muted-foreground mt-3 mb-2">Sort By</p>
            <div className="flex gap-2">
              {(['date', 'type', 'name'] as SortBy[]).map(sort => (
                <button
                  key={sort}
                  onClick={() => setSortBy(sort)}
                  className={`px-3 py-1.5 rounded-full text-sm capitalize ${
                    sortBy === sort 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {sort}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="border-b">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b-0 h-12 p-0 bg-transparent">
            <TabsTrigger 
              value="folders" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Folder className="h-4 w-4 mr-2" />
              By Category
            </TabsTrigger>
            <TabsTrigger 
              value="persons"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Users className="h-4 w-4 mr-2" />
              By Person
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content - Pass filter props to child components */}
      {activeTab === 'folders' && (
        <FolderView 
          searchQuery={searchQuery}
          viewMode={viewMode}
          sortBy={sortBy}
          sortOrder={sortOrder}
          selectedType={selectedType}
          key={isRefreshing ? 'refresh' : 'normal'}
        />
      )}
      {activeTab === 'persons' && (
        <PersonView 
          searchQuery={searchQuery}
          key={isRefreshing ? 'refresh' : 'normal'}
        />
      )}
    </div>
  );
}
