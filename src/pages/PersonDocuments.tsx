import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, ChevronRight, FileText, CreditCard, Car, Vote, BookOpen, Heart, GraduationCap, Receipt, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Profile {
  personId: string;
  fullName: string;
  gender: string;
  dob: string;
  relationship: string;
  relationshipDisplay: string;
  aadhaarNumber: string;
  panNumber: string;
  bloodGroup: string;
  phone: string;
}

interface Document {
  id: string;
  category: string;
  subcategory: string;
  categoryDisplay: string;
  subcategoryDisplay: string;
  personName: string;
  referenceNumber: string;
  date: string;
  summary: string;
  isValid: boolean;
}

interface Person {
  id: string;
  firstName: string;
  displayName: string;
  documentCount: number;
  relationship: string;
}

// Category icons
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'IDENTITY_CIVIL': CreditCard,
  'IDENTITY_TRAVEL': Plane,
  'EDUCATION': GraduationCap,
  'MEDICAL': Heart,
  'FINANCIAL': Receipt,
  'LEGAL': FileText,
  'VEHICLE': Car,
  'OTHER': FileText,
};

const CATEGORY_COLORS: Record<string, string> = {
  'IDENTITY_CIVIL': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  'IDENTITY_TRAVEL': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'EDUCATION': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'MEDICAL': 'bg-red-500/10 text-red-500 border-red-500/20',
  'FINANCIAL': 'bg-green-500/10 text-green-500 border-green-500/20',
  'LEGAL': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'VEHICLE': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  'OTHER': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export default function PersonDocuments() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [person, setPerson] = useState<Person | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPersonData(id);
    }
  }, [id]);

  const loadPersonData = (personId: string) => {
    setIsLoading(true);
    console.log('[PersonDocs] Loading data for:', personId);
    
    // Load person
    if (window.Android?.getPersons) {
      try {
        const json = window.Android.getPersons();
        const persons = JSON.parse(json);
        const found = persons.find((p: Person) => p.id === personId);
        setPerson(found || null);
      } catch (e) {
        console.error('Error loading person:', e);
      }
    }

    // Load profile
    if (window.Android?.getProfile) {
      try {
        const json = window.Android.getProfile(personId);
        console.log('[PersonDocs] Profile JSON:', json);
        const data = JSON.parse(json);
        if (data.personId) {
          setProfile(data);
        }
      } catch (e) {
        console.error('[PersonDocs] Error loading profile:', e);
      }
    }

    // Load documents for this person
    if (window.Android?.getDocumentsForPerson) {
      try {
        console.log('[PersonDocs] Calling getDocumentsForPerson...');
        const json = window.Android.getDocumentsForPerson(personId);
        console.log('[PersonDocs] Documents JSON:', json);
        const docs = JSON.parse(json);
        console.log('[PersonDocs] Parsed documents:', docs.length);
        setDocuments(docs);
      } catch (e) {
        console.error('[PersonDocs] Error loading documents:', e);
      }
    } else {
      console.error('[PersonDocs] getDocumentsForPerson not available!');
    }

    setIsLoading(false);
  };

  // Group documents by category
  const groupedDocs = documents.reduce((acc, doc) => {
    const cat = doc.category || 'OTHER';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  const handleDocumentClick = (docId: string) => {
    // Open document preview
    if (window.Android?.viewDocument) {
      window.Android.viewDocument(docId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const displayName = profile?.fullName || person?.displayName || 'Unknown';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/documents')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg flex-1">{displayName}</h1>
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4 pb-24">
          
          {/* Profile Card - Clickable */}
          <Card 
            className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => navigate(`/person/${id}/profile`)}
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-lg">{displayName}</h2>
                  {profile?.relationshipDisplay && profile.relationshipDisplay !== 'Other' && (
                    <Badge variant="secondary" className="text-xs">
                      {profile.relationshipDisplay}
                    </Badge>
                  )}
                </div>
                
                {/* Quick Info */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                  {profile?.dob && (
                    <span>DOB: {profile.dob}</span>
                  )}
                  {profile?.bloodGroup && (
                    <span>Blood: {profile.bloodGroup}</span>
                  )}
                  {profile?.phone && (
                    <span>{profile.phone}</span>
                  )}
                </div>

                {/* ID Numbers Preview */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile?.aadhaarNumber && (
                    <Badge variant="outline" className="text-xs font-mono">
                      Aadhaar: ••••{profile.aadhaarNumber.slice(-4)}
                    </Badge>
                  )}
                  {profile?.panNumber && (
                    <Badge variant="outline" className="text-xs font-mono">
                      PAN: {profile.panNumber}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="mt-3 pt-3 border-t flex items-center justify-between">
              <span className="text-sm text-muted-foreground">View Full Profile</span>
              <span className="text-sm text-primary">Edit →</span>
            </div>
          </Card>

          {/* Documents Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider px-1">
              Documents ({documents.length})
            </h3>

            {documents.length === 0 ? (
              <Card className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No documents yet</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/upload')}
                >
                  Add Document
                </Button>
              </Card>
            ) : (
              Object.entries(groupedDocs).map(([category, docs]) => {
                const Icon = CATEGORY_ICONS[category] || FileText;
                const colorClass = CATEGORY_COLORS[category] || CATEGORY_COLORS['OTHER'];
                const categoryName = docs[0]?.categoryDisplay || category;

                return (
                  <div key={category} className="space-y-2">
                    {/* Category Header */}
                    <div className="flex items-center gap-2 px-1">
                      <div className={`w-6 h-6 rounded flex items-center justify-center ${colorClass.split(' ')[0]}`}>
                        <Icon className={`h-3.5 w-3.5 ${colorClass.split(' ')[1]}`} />
                      </div>
                      <span className="text-sm font-medium">{categoryName}</span>
                      <span className="text-xs text-muted-foreground">({docs.length})</span>
                    </div>

                    {/* Document Cards */}
                    <div className="space-y-2">
                      {docs.map((doc) => (
                        <Card
                          key={doc.id}
                          className={`p-3 cursor-pointer hover:bg-accent/50 transition-colors border-l-4 ${colorClass.split(' ')[2]}`}
                          onClick={() => handleDocumentClick(doc.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass.split(' ')[0]}`}>
                              <Icon className={`h-5 w-5 ${colorClass.split(' ')[1]}`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{doc.subcategoryDisplay || doc.subcategory}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {doc.referenceNumber && (
                                  <span className="font-mono">
                                    {doc.referenceNumber.length > 8 
                                      ? `••••${doc.referenceNumber.slice(-4)}` 
                                      : doc.referenceNumber}
                                  </span>
                                )}
                                {doc.date && (
                                  <>
                                    <span>•</span>
                                    <span>{doc.date}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {doc.isValid && (
                              <Badge variant="outline" className="text-green-600 border-green-500 text-xs">
                                ✓
                              </Badge>
                            )}
                            
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
