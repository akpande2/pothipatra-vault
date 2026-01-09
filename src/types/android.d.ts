declare global {
  interface Window {
    Android?: {
      // Existing methods
      sendChatMessage: (message: string) => void;
      getChatHistory: () => string;
      getChatMessages: (sessionId: string) => string;
      startNewChatSession: () => string;
      searchChatHistory: (query: string) => string;
      deleteChatSession: (sessionId: string) => boolean;
      
      // Document methods
      getAllDocuments: () => string;
      getDocument: (documentId: string) => string;
      getDocumentImage: (documentId: string) => string;
      deleteDocument: (documentId: string) => boolean;
      searchDocuments: (query: string) => string;
      getDocumentsByCategory: (category: string) => string;
      getDocumentsBySubcategory: (subcategory: string) => string;
      
      // Upload methods
      openScanner: () => void;
      openGallery: () => void;
      openFilePicker: () => void;
      
      // Approval flow
      approveDocument: () => void;
      rejectDocument: () => void;
      editDocument: (changesJson: string) => void;
      getPendingDocument: () => string;
      
      // Category/Folder methods
      getCategories: () => string;
      getSubcategories: (category: string) => string;
      
      // Person methods
      getAllPersons: () => string;
      getPerson: (personId: string) => string;
      getDocumentsByPerson: (personId: string) => string;
      mergePersons: (keepPersonId: string, mergePersonId: string) => boolean;
      
      // Utility
      getCapabilities: () => string;
      isReady: () => boolean;
    };
    
    // Callbacks
    onChatResponse?: (response: any) => void;
    onScanComplete?: (result: any) => void;
    onDocumentPreview?: (preview: any) => void;
    onDocumentApproved?: (response: any) => void;
    onDocumentRejected?: () => void;
    onProcessingError?: (error: any) => void;
    onApprovalError?: (error: any) => void;
  }
}

export {};
