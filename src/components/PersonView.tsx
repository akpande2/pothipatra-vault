import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, ChevronRight, ChevronDown, FileText, Folder, FolderOpen,
  Search, Users, Merge, ArrowLeft
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Person {
  id: string;
  firstName: string;
  displayName: string;
  documentCount: number;
  documentIds: string[];
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
}

interface PersonViewProps {
  searchQuery?: string;
}

interface GroupedDocuments {
  [category: string]: {
    categoryDisplay: string;
    documents: Document[];
  };
}

export function PersonView() {
  const navigate = useNavigate();
  const [persons, setPersons] = useState<Person[]>([]);
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [personDocuments, setPersonDocuments] = useState<GroupedDocuments>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [selectedForMerge, setSelectedForMerge] = useState<string[]>([]);

  useEffect(() => {
    loadPersons();
  }, []);

  const loadPersons = () => {
    if (!window.Android?.getAllPersons) {
      // Mock data
      setPersons([
        { id: 'P1', firstName: 'Ashish', displayName: 'Ashish Kumar Pandey', documentCount: 8, documentIds: [] },
        { id: 'P2', firstName: 'Sneha', displayName: 'Sneha Chaubey', documentCount: 5, documentIds: [] },
        { id: 'P3', firstName: 'Bhargavi', displayName: 'Bhargavi Pandey', documentCount: 3, documentIds: [] },
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const result = window.Android.getAllPersons();
      const parsed = JSON.parse(result);
      setPersons(parsed);
    } catch (e) {
      console.error('Error loading persons:', e);
    }
    setIsLoading(false);
  };

  const loadPersonDocuments = (personId: string) => {
    if (!window.Android?.getDocumentsByPerson) {
      // Mock data
      setPersonDocuments({
        'IDENTITY_CIVIL': {
          categoryDisplay: 'Identity & Civil',
          documents: [
            {
              id: 'D1',
              category: 'IDENTITY_CIVIL',
              categoryDisplay: 'Identity & Civil',
              subcategory: 'AADHAAR',
              subcategoryDisplay: 'Aadhaar Card',
              personName: 'Ashish Kumar Pandey',
              referenceNumber: '1234 5678 9012',
              date: '15/08/1990',
              summary: 'Aadhaar Card',
            },
          ],
        },
      });
      return;
    }

    try {
      const result = window.Android.getDocumentsByPerson(personId);
      const docs: Document[] = JSON.parse(result);
      
      // Group by category
      const grouped: GroupedDocuments = {};
      docs.forEach((doc) => {
        if (!grouped[doc.category]) {
          grouped[doc.category] = {
            categoryDisplay: doc.categoryDisplay,
            documents: [],
          };
        }
        grouped[doc.category].documents.push(doc);
      });
      
      setPersonDocuments(grouped);
    } catch (e) {
      console.error('Error loading person documents:', e);
      setPersonDocuments({});
    }
  };

  const handlePersonClick = (personId: string) => {
    navigate(`/person/${personId}`);  // Navigate to profile page
  };

  const handleCategoryClick = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleDocumentClick = (documentId: string) => {
    navigate(`/document/${documentId}`);
  };

  const handleMergeToggle = (personId: string) => {
    setSelectedForMerge((prev) => {
      if (prev.includes(personId)) {
        return prev.filter((id) => id !== personId);
      }
      if (prev.length < 2) {
        return [...prev, personId];
      }
      return prev;
    });
  };

  const handleMerge = () => {
    if (selectedForMerge.length !== 2) return;
    
    if (!window.Android?.mergePersons) {
      console.log('Merge not available');
      return;
    }

    const [keep, merge] = selectedForMerge;
    const success = window.Android.mergePersons(keep, merge);
    
    if (success) {
      setSelectedForMerge([]);
      setMergeDialogOpen(false);
      loadPersons();
    }
  };

  const filteredPersons = searchQuery.trim()
    ? persons.filter((p) =>
        p.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : persons;

  const totalPersons = persons.length;
  const totalDocuments = persons.reduce((sum, p) => sum + p.documentCount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">By Person</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{totalPersons} people</Badge>
          <Badge variant="secondary">{totalDocuments} docs</Badge>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {persons.length > 1 && (
          <Button
            variant="outline"
            onClick={() => setMergeDialogOpen(true)}
          >
            <Merge className="h-4 w-4 mr-2" />
            Merge
          </Button>
        )}
      </div>

      {/* Person List */}
      {filteredPersons.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {searchQuery ? 'No people found' : 'No documents uploaded yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPersons.map((person) => {
            const isExpanded = expandedPerson === person.id;
            
            return (
              <div key={person.id} className="space-y-1">
                {/* Person Row */}
                <Card
                  className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
                    isExpanded ? 'bg-accent' : ''
                  }`}
                  onClick={() => handlePersonClick(person.id)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium">{person.displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {person.documentCount} document{person.documentCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    <Badge variant="secondary">{person.documentCount}</Badge>
                  </div>
                </Card>

                {/* Person's Documents by Category */}
                {isExpanded && Object.keys(personDocuments).length > 0 && (
                  <div className="ml-8 space-y-1">
                    {Object.entries(personDocuments).map(([categoryId, categoryData]) => (
                      <div key={categoryId}>
                        {/* Category Row */}
                        <Card
                          className={`p-2 cursor-pointer transition-colors hover:bg-accent ${
                            expandedCategory === categoryId ? 'bg-accent' : ''
                          }`}
                          onClick={() => handleCategoryClick(categoryId)}
                        >
                          <div className="flex items-center gap-2">
                            {expandedCategory === categoryId ? (
                              <FolderOpen className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <Folder className="h-4 w-4 text-yellow-500" />
                            )}
                            <span className="flex-1 text-sm font-medium">
                              {categoryData.categoryDisplay}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {categoryData.documents.length}
                            </Badge>
                          </div>
                        </Card>

                        {/* Documents in Category */}
                        {expandedCategory === categoryId && (
                          <div className="ml-6 mt-1 space-y-1">
                            {categoryData.documents.map((doc) => (
                              <Card
                                key={doc.id}
                                className="p-2 cursor-pointer transition-colors hover:bg-accent"
                                onClick={() => handleDocumentClick(doc.id)}
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-blue-500" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate">{doc.subcategoryDisplay}</p>
                                    {doc.referenceNumber && (
                                      <p className="text-xs font-mono text-muted-foreground truncate">
                                        {doc.referenceNumber}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {isExpanded && Object.keys(personDocuments).length === 0 && (
                  <div className="ml-8 p-2 text-sm text-muted-foreground">
                    Loading documents...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Merge Dialog */}
      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merge People</DialogTitle>
          </DialogHeader>
          
          <p className="text-sm text-muted-foreground">
            Select 2 people to merge. The first selected will be kept, and all documents from the second will be moved to the first.
          </p>

          <div className="space-y-2 my-4">
            {persons.map((person) => (
              <Card
                key={person.id}
                className={`p-3 cursor-pointer transition-colors ${
                  selectedForMerge.includes(person.id) 
                    ? 'bg-primary/10 border-primary' 
                    : 'hover:bg-accent'
                }`}
                onClick={() => handleMergeToggle(person.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                    selectedForMerge.includes(person.id) 
                      ? 'border-primary bg-primary text-primary-foreground' 
                      : 'border-muted-foreground'
                  }`}>
                    {selectedForMerge.indexOf(person.id) >= 0 && (
                      <span className="text-xs font-bold">
                        {selectedForMerge.indexOf(person.id) + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{person.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {person.documentCount} documents
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {selectedForMerge.length === 2 && (
            <p className="text-sm text-center">
              <span className="font-medium">
                {persons.find((p) => p.id === selectedForMerge[1])?.displayName}
              </span>
              {' '}will be merged into{' '}
              <span className="font-medium">
                {persons.find((p) => p.id === selectedForMerge[0])?.displayName}
              </span>
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedForMerge([]);
              setMergeDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleMerge}
              disabled={selectedForMerge.length !== 2}
            >
              <Merge className="h-4 w-4 mr-2" />
              Merge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
