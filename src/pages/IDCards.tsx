import { useState, useMemo } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useStore } from '@/hooks/useStore';
import { AppLayout } from '@/components/AppLayout';
import { DocumentCard } from '@/components/DocumentCard';
import { DocumentDetailSheet } from '@/components/DocumentDetailSheet';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FolderOpen, FileText, Users, ChevronRight } from 'lucide-react';
import { DOCUMENT_TYPES, DocumentType, RELATIONS, Document } from '@/types/document';
import { cn } from '@/lib/utils';

const DOCUMENT_CATEGORIES: { type: DocumentType; icon: string }[] = [
  { type: 'aadhaar', icon: '🆔' },
  { type: 'pan', icon: '💳' },
  { type: 'passport', icon: '📘' },
  { type: 'driving', icon: '🚗' },
  { type: 'voter', icon: '🗳️' },
  { type: 'ration', icon: '🏠' },
  { type: 'other', icon: '📄' },
];

export default function IDCards() {
  const { t, language } = useLanguage();
  const { documents, knownPersons, isLoading, updateDocument, deleteDocument } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'type' | 'person'>('type');
  const [expandedType, setExpandedType] = useState<DocumentType | null>(null);
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);
  
  // Document actions state
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Filter documents based on search query
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const query = searchQuery.toLowerCase();
    return documents.filter(doc => 
      doc.name.toLowerCase().includes(query) ||
      doc.holderName.toLowerCase().includes(query) ||
      doc.number.toLowerCase().includes(query) ||
      DOCUMENT_TYPES[doc.type].label.toLowerCase().includes(query) ||
      DOCUMENT_TYPES[doc.type].labelHi.includes(query)
    );
  }, [documents, searchQuery]);

  // Group documents by type
  const documentsByType = useMemo(() => {
    const grouped: Record<DocumentType, typeof documents> = {
      aadhaar: [],
      pan: [],
      passport: [],
      driving: [],
      voter: [],
      ration: [],
      other: [],
    };
    filteredDocuments.forEach(doc => {
      grouped[doc.type].push(doc);
    });
    return grouped;
  }, [filteredDocuments]);

  // Group documents by person
  const documentsByPerson = useMemo(() => {
    const grouped: Record<string, typeof documents> = {};
    filteredDocuments.forEach(doc => {
      const personName = doc.holderName || (language === 'hi' ? 'अज्ञात' : 'Unknown');
      if (!grouped[personName]) {
        grouped[personName] = [];
      }
      grouped[personName].push(doc);
    });
    return grouped;
  }, [filteredDocuments, language]);

  // Get relation label for a person
  const getPersonRelation = (personName: string) => {
    const person = knownPersons.find(p => 
      p.name.toLowerCase().trim() === personName.toLowerCase().trim()
    );
    if (person) {
      const relation = RELATIONS.find(r => r.value === person.relation);
      return language === 'hi' ? relation?.labelHi : relation?.label;
    }
    return null;
  };

  const handleTypeClick = (type: DocumentType) => {
    setExpandedType(expandedType === type ? null : type);
  };

  const handlePersonClick = (personName: string) => {
    setExpandedPerson(expandedPerson === personName ? null : personName);
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setIsDetailOpen(true);
  };

  const handleEditDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setIsDetailOpen(true);
  };

  const handleDeleteDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedDocument) {
      deleteDocument(selectedDocument.id);
      setIsDeleteOpen(false);
      setSelectedDocument(null);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 pb-0">
          <h1 className="text-xl font-semibold text-foreground mb-1">
            {t.documents}
          </h1>
          <p className="text-muted-foreground text-sm mb-4">
            {language === 'hi' ? 'आपके सभी सहेजे गए दस्तावेज़' : 'All your saved documents'}
          </p>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'hi' ? 'दस्तावेज़ खोजें...' : 'Search documents...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-muted/50 border-border"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'type' | 'person')}>
            <TabsList className="w-full grid grid-cols-2 h-12 rounded-xl bg-muted/50 p-1">
              <TabsTrigger 
                value="type" 
                className="rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <FileText className="h-4 w-4" />
                {language === 'hi' ? 'प्रकार से' : 'By Type'}
              </TabsTrigger>
              <TabsTrigger 
                value="person" 
                className="rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Users className="h-4 w-4" />
                {language === 'hi' ? 'व्यक्ति से' : 'By Person'}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-muted/30 rounded-2xl border border-border">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FolderOpen className="w-8 h-8 text-primary stroke-[1.5]" />
              </div>
              <p className="text-muted-foreground text-center mb-1">
                {language === 'hi' ? 'कोई दस्तावेज़ नहीं' : 'No documents yet'}
              </p>
              <p className="text-muted-foreground/70 text-sm text-center">
                {language === 'hi' ? 'दस्तावेज़ जोड़ने के लिए अपलोड करें' : 'Upload to add documents'}
              </p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-muted/30 rounded-2xl border border-border">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground stroke-[1.5]" />
              </div>
              <p className="text-muted-foreground text-center">
                {language === 'hi' ? 'कोई परिणाम नहीं मिला' : 'No results found'}
              </p>
            </div>
          ) : activeTab === 'type' ? (
            /* By Document Type View */
            <div className="space-y-2">
              {DOCUMENT_CATEGORIES.map(({ type, icon }) => {
                const docs = documentsByType[type];
                const typeInfo = DOCUMENT_TYPES[type];
                const isExpanded = expandedType === type;

                return (
                  <div key={type} className="border border-border rounded-xl overflow-hidden bg-card">
                    <button
                      onClick={() => handleTypeClick(type)}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 text-left transition-colors",
                        "hover:bg-muted/50",
                        docs.length === 0 && "opacity-50"
                      )}
                      disabled={docs.length === 0}
                    >
                      <span className="text-2xl">{icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {language === 'hi' ? typeInfo.labelHi : typeInfo.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {docs.length} {language === 'hi' ? 'दस्तावेज़' : docs.length === 1 ? 'document' : 'documents'}
                        </p>
                      </div>
                      {docs.length > 0 && (
                        <ChevronRight className={cn(
                          "h-5 w-5 text-muted-foreground transition-transform",
                          isExpanded && "rotate-90"
                        )} />
                      )}
                    </button>
                    
                    {isExpanded && docs.length > 0 && (
                      <div className="border-t border-border p-3 space-y-2 bg-muted/30">
                        {docs.map(doc => (
                          <DocumentCard 
                            key={doc.id} 
                            document={doc}
                            onView={handleViewDocument}
                            onEdit={handleEditDocument}
                            onDelete={handleDeleteDocument}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* By Person View */
            <div className="space-y-2">
              {Object.entries(documentsByPerson).map(([personName, docs]) => {
                const isExpanded = expandedPerson === personName;
                const relation = getPersonRelation(personName);

                return (
                  <div key={personName} className="border border-border rounded-xl overflow-hidden bg-card">
                    <button
                      onClick={() => handlePersonClick(personName)}
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-medium text-primary">
                          {personName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{personName}</p>
                        <p className="text-sm text-muted-foreground">
                          {relation && <span className="text-primary">{relation} • </span>}
                          {docs.length} {language === 'hi' ? 'दस्तावेज़' : docs.length === 1 ? 'document' : 'documents'}
                        </p>
                      </div>
                      <ChevronRight className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform",
                        isExpanded && "rotate-90"
                      )} />
                    </button>
                    
                    {isExpanded && (
                      <div className="border-t border-border p-3 space-y-2 bg-muted/30">
                        {docs.map(doc => (
                          <DocumentCard 
                            key={doc.id} 
                            document={doc}
                            onView={handleViewDocument}
                            onEdit={handleEditDocument}
                            onDelete={handleDeleteDocument}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Document Detail Sheet */}
      <DocumentDetailSheet
        document={selectedDocument}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title={language === 'hi' ? 'दस्तावेज़ हटाएं?' : 'Delete Document?'}
        description={language === 'hi' 
          ? `क्या आप "${selectedDocument?.name || ''}" को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।`
          : `Are you sure you want to delete "${selectedDocument?.name || ''}"? This action cannot be undone.`
        }
      />
    </AppLayout>
  );
}
