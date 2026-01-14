import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Folder, FolderOpen, FileText, ChevronRight, ChevronDown,
  IdCard, GraduationCap, Landmark, Home, HeartPulse, 
  Briefcase, Car, Receipt, FolderIcon, Search, ArrowLeft
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
}

interface Subcategory {
  id: string;
  name: string;
  category: string;
  count: number;
}

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
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  'id-card': IdCard,
  'graduation-cap': GraduationCap,
  'landmark': Landmark,
  'home': Home,
  'heart-pulse': HeartPulse,
  'briefcase': Briefcase,
  'car': Car,
  'receipt': Receipt,
  'folder': FolderIcon,
};

export function FolderView() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Document[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    if (!window.Android?.getCategories) {
      // Mock data for web preview
      setCategories([
        { id: 'IDENTITY_CIVIL', name: 'Identity & Civil', icon: 'id-card', description: 'Government IDs', count: 5 },
        { id: 'EDUCATION', name: 'Education', icon: 'graduation-cap', description: 'Academic records', count: 3 },
        { id: 'BANKING_FINANCE_TAX', name: 'Banking & Finance', icon: 'landmark', description: 'Financial docs', count: 2 },
        { id: 'PROPERTY_LEGAL', name: 'Property & Legal', icon: 'home', description: 'Property papers', count: 0 },
        { id: 'HEALTH_MEDICAL', name: 'Health & Medical', icon: 'heart-pulse', description: 'Medical records', count: 4 },
        { id: 'EMPLOYMENT_PROFESSIONAL', name: 'Employment', icon: 'briefcase', description: 'Work documents', count: 1 },
        { id: 'VEHICLE_TRAVEL', name: 'Vehicle & Travel', icon: 'car', description: 'Travel docs', count: 2 },
        { id: 'UTILITIES_BILLS', name: 'Utilities & Bills', icon: 'receipt', description: 'Monthly bills', count: 3 },
        { id: 'OTHERS', name: 'Others', icon: 'folder', description: 'Other documents', count: 0 },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const result = window.Android.getCategories();
      const parsed = JSON.parse(result);
      setCategories(parsed);
    } catch (e) {
      console.error('Error loading categories:', e);
    }
    setIsLoading(false);
  };

  const loadSubcategories = (categoryId: string) => {
    if (!window.Android?.getSubcategories) {
      // Mock data
      setSubcategories([
        { id: 'AADHAAR', name: 'Aadhaar Card', category: categoryId, count: 2 },
        { id: 'PAN', name: 'PAN Card', category: categoryId, count: 1 },
        { id: 'PASSPORT', name: 'Passport', category: categoryId, count: 1 },
      ]);
      return;
    }

    try {
      const result = window.Android.getSubcategories(categoryId);
      const parsed = JSON.parse(result);
      setSubcategories(parsed);
    } catch (e) {
      console.error('Error loading subcategories:', e);
      setSubcategories([]);
    }
  };

  const loadDocuments = (subcategoryId: string) => {
    if (!window.Android?.getDocumentsBySubcategory) {
      // Mock data
      setDocuments([
        {
          id: 'DOC_123',
          category: 'IDENTITY_CIVIL',
          categoryDisplay: 'Identity & Civil',
          subcategory: subcategoryId,
          subcategoryDisplay: 'Aadhaar Card',
          personName: 'Ashish Pandey',
          referenceNumber: '1234 5678 9012',
          date: '15/08/1990',
          summary: 'Aadhaar Card for Ashish Pandey',
          confidence: 0.95,
          isValid: true,
          createdAt: Date.now(),
        },
      ]);
      return;
    }

    try {
      const result = window.Android.getDocumentsBySubcategory(subcategoryId);
      const parsed = JSON.parse(result);
      setDocuments(parsed);
    } catch (e) {
      console.error('Error loading documents:', e);
      setDocuments([]);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
      setSubcategories([]);
      setSelectedSubcategory(null);
      setDocuments([]);
    } else {
      setExpandedCategory(categoryId);
      setSelectedSubcategory(null);
      setDocuments([]);
      loadSubcategories(categoryId);
    }
  };

  const handleSubcategoryClick = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    loadDocuments(subcategoryId);
  };

  const handleDocumentClick = (documentId: string) => {
    navigate(`/document/${documentId}`);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    if (!window.Android?.searchDocuments) {
      setSearchResults([]);
      return;
    }

    try {
      const result = window.Android.searchDocuments(searchQuery);
      const parsed = JSON.parse(result);
      setSearchResults(parsed);
    } catch (e) {
      console.error('Error searching:', e);
      setSearchResults([]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  const getIcon = (iconName: string) => {
    const IconComponent = ICON_MAP[iconName] || FolderIcon;
    return IconComponent;
  };

  const totalDocuments = categories.reduce((sum, cat) => sum + cat.count, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} variant="secondary">
          Search
        </Button>
      </div>

      {/* Search Results */}
      {searchResults !== null && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              Search Results ({searchResults.length})
            </h3>
            <Button variant="ghost" size="sm" onClick={clearSearch}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to folders
            </Button>
          </div>
          
          {searchResults.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No documents found for "{searchQuery}"
            </p>
          ) : (
            <div className="space-y-2">
              {searchResults.map((doc) => (
                <DocumentCard 
                  key={doc.id} 
                  document={doc} 
                  onClick={() => handleDocumentClick(doc.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Folder View */}
      {searchResults === null && (
        <>
          {/* Stats */}
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-semibold">My Documents</h2>
            <Badge variant="secondary">{totalDocuments} total</Badge>
          </div>

          {/* Category List */}
          <div className="space-y-2">
            {categories.map((category) => {
              const IconComponent = getIcon(category.icon);
              const isExpanded = expandedCategory === category.id;
              
              return (
                <div key={category.id} className="space-y-1">
                  {/* Category Row */}
                  <Card
                    className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
                      isExpanded ? 'bg-accent' : ''
                    } ${category.count === 0 ? 'opacity-50' : ''}`}
                    onClick={() => category.count > 0 && handleCategoryClick(category.id)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      
                      {isExpanded ? (
                        <FolderOpen className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <Folder className="h-5 w-5 text-yellow-500" />
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{category.name}</span>
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      </div>
                      
                      <Badge variant={category.count > 0 ? 'default' : 'outline'}>
                        {category.count}
                      </Badge>
                    </div>
                  </Card>

                  {/* Subcategories */}
                  {isExpanded && subcategories.length > 0 && (
                    <div className="ml-8 space-y-1">
                      {subcategories.map((subcat) => (
                        <div key={subcat.id}>
                          <Card
                            className={`p-2 cursor-pointer transition-colors hover:bg-accent ${
                              selectedSubcategory === subcat.id ? 'bg-accent border-primary' : ''
                            }`}
                            onClick={() => handleSubcategoryClick(subcat.id)}
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-blue-500" />
                              <span className="flex-1 text-sm">{subcat.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {subcat.count}
                              </Badge>
                            </div>
                          </Card>

                          {/* Documents in subcategory */}
                          {selectedSubcategory === subcat.id && documents.length > 0 && (
                            <div className="ml-6 mt-1 space-y-1">
                              {documents.map((doc) => (
                                <DocumentCard
                                  key={doc.id}
                                  document={doc}
                                  compact
                                  onClick={() => handleDocumentClick(doc.id)}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {isExpanded && subcategories.length === 0 && (
                    <div className="ml-8 p-2 text-sm text-muted-foreground">
                      No documents in this category
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// Document Card Component
interface DocumentCardProps {
  document: Document;
  compact?: boolean;
  onClick: () => void;
}

interface FolderViewProps {
  searchQuery?: string;
  viewMode?: 'grid' | 'list';
  sortBy?: 'date' | 'type' | 'name';
  sortOrder?: 'asc' | 'desc';
  selectedType?: string | null;
}

function DocumentCard({ document, compact = false, onClick }: DocumentCardProps) {
  if (compact) {
    return (
      <Card
        className="p-2 cursor-pointer transition-colors hover:bg-accent"
        onClick={onClick}
      >
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {document.personName || document.subcategoryDisplay}
            </p>
            {document.referenceNumber && (
              <p className="text-xs text-muted-foreground font-mono truncate">
                {document.referenceNumber}
              </p>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="p-3 cursor-pointer transition-colors hover:bg-accent"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">
              {document.personName || 'Unknown'}
            </p>
            {document.isValid && (
              <Badge variant="outline" className="text-xs text-green-600">
                Valid
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{document.subcategoryDisplay}</p>
          {document.referenceNumber && (
            <p className="text-xs font-mono text-muted-foreground mt-1">
              {document.referenceNumber}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">{document.summary}</p>
        </div>
      </div>
    </Card>
  );
}
