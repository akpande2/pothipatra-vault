declare global {
  interface Window {
    Android?: {
      sendChatMessage: (message: string) => void;
      getChatHistory: () => string;
      getChatMessages: (sessionId: string) => string;
      startNewChatSession: () => string;
      searchChatHistory: (query: string) => string;
      deleteChatSession: (sessionId: string) => boolean;
      getAllDocuments: () => string;
      getDocument: (documentId: string) => string;
      openScanner: () => void;
      openGallery: () => void;
      openFilePicker: () => void;
      getCapabilities: () => string;
      isReady: () => boolean;
    };
    onChatResponse?: (response: any) => void;
    onScanComplete?: (result: any) => void;
  }
}

export {};
