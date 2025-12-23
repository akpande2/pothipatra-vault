import { useState } from 'react';
import { Header } from '@/components/Header';
import { ProfileSelector } from '@/components/ProfileSelector';
import { DocumentCard } from '@/components/DocumentCard';
import { EmptyState } from '@/components/EmptyState';
import { FloatingAddButton } from '@/components/FloatingAddButton';
import { AddDocumentSheet } from '@/components/AddDocumentSheet';
import { AddProfileSheet } from '@/components/AddProfileSheet';
import { DocumentDetailSheet } from '@/components/DocumentDetailSheet';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { useStore } from '@/hooks/useStore';
import { Document, DocumentType } from '@/types/document';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Index = () => {
  const { t } = useLanguage();
  const {
    profiles,
    activeProfile,
    activeProfileId,
    activeDocuments,
    setActiveProfileId,
    addProfile,
    addDocument,
    deleteDocument,
    isLoading,
  } = useStore();

  const [addDocumentOpen, setAddDocumentOpen] = useState(false);
  const [addProfileOpen, setAddProfileOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const filteredDocuments = activeDocuments.filter(doc =>
    doc.holderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddDocument = (data: {
    type: DocumentType;
    name: string;
    number: string;
    holderName: string;
    expiryDate?: string;
    issueDate?: string;
    frontImage?: string;
    backImage?: string;
  }) => {
    addDocument({
      ...data,
      profileId: activeProfileId,
    });
    toast({
      title: t.documentSaved,
      description: `${data.name}`,
    });
  };

  const handleAddProfile = (data: { name: string; relation: 'self' | 'spouse' | 'child' | 'parent' | 'other' }) => {
    try {
      const newProfile = addProfile(data);
      setActiveProfileId(newProfile.id);
      toast({
        title: t.memberAdded,
        description: `${data.name} ${t.profileReady}`,
      });
    } catch (error) {
      toast({
        title: t.cannotDelete,
        description: t.maxMembersReached,
        variant: 'destructive',
      });
    }
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setDetailOpen(true);
  };

  const handleEditDocument = (document: Document) => {
    handleViewDocument(document);
  };

  const handleDeleteClick = (document: Document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (documentToDelete) {
      deleteDocument(documentToDelete.id);
      toast({
        title: t.documentDeleted,
      });
      setDocumentToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      <main className="px-5 py-4">
        {/* Profile Selector */}
        <section className="mb-5">
          <p className="text-xs text-muted-foreground mb-2">{t.familyMembers}</p>
          <ProfileSelector
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSelect={setActiveProfileId}
            onAddProfile={() => setAddProfileOpen(true)}
            canAddMore={profiles.length < 4}
          />
        </section>

        {/* Search */}
        {activeDocuments.length > 0 && (
          <section className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t.searchDocuments}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-0 text-sm"
              />
            </div>
          </section>
        )}

        {/* Document Count */}
        {activeDocuments.length > 0 && (
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm text-muted-foreground">
              {activeProfile?.name} - {t.documents}
            </h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {filteredDocuments.length} {t.document}
            </span>
          </div>
        )}

        {/* Documents Grid */}
        {filteredDocuments.length > 0 ? (
          <div className="grid gap-3 stagger-children">
            {filteredDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onView={handleViewDocument}
                onEdit={handleEditDocument}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        ) : activeDocuments.length === 0 ? (
          <EmptyState onAddDocument={() => setAddDocumentOpen(true)} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">{t.noDocumentsFound}</p>
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <FloatingAddButton onClick={() => setAddDocumentOpen(true)} />

      {/* Sheets */}
      <AddDocumentSheet
        open={addDocumentOpen}
        onOpenChange={setAddDocumentOpen}
        onSubmit={handleAddDocument}
      />

      <AddProfileSheet
        open={addProfileOpen}
        onOpenChange={setAddProfileOpen}
        onSubmit={handleAddProfile}
      />

      <DocumentDetailSheet
        document={selectedDocument}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title={t.deleteDocument}
        description={t.deleteDocumentConfirm}
      />
    </div>
  );
};

export default Index;
