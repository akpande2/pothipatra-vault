import { useState } from 'react';
import { ChatDocumentCard } from './ChatDocumentCard';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { FileStack } from 'lucide-react';

interface DocumentInfo {
  id: string;
  documentType?: string;
  category?: string;
  categoryDisplay?: string;
  subcategory?: string;
  subcategoryDisplay?: string;
  personName?: string;
  idNumber?: string;
  referenceNumber?: string;
  date?: string;
  dob?: string;
  summary?: string;
  isValid?: boolean;
}

interface Props {
  documents: DocumentInfo[];
}

export function ChatDocumentAttachments({ documents }: Props) {
  const [selectedDocument, setSelectedDocument] = useState<DocumentInfo | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!documents || documents.length === 0) {
    return null;
  }

  const handleDocumentClick = (doc: DocumentInfo) => {
    setSelectedDocument(doc);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setSelectedDocument(null);
  };

  return (
    <div className="mt-3 space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <FileStack className="h-3 w-3" />
        <span>Based on {documents.length} document{documents.length > 1 ? 's' : ''}</span>
      </div>

      {/* Document Cards */}
      <div className="space-y-2">
        {documents.map((doc) => (
          <ChatDocumentCard
            key={doc.id}
            document={doc}
            onClick={() => handleDocumentClick(doc)}
          />
        ))}
      </div>

      {/* Preview Modal */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        document={selectedDocument}
      />
    </div>
  );
}
