import { useState, useEffect, useCallback } from "react";

// ============= Type Definitions =============

export interface AndroidFileData {
  uri: string;
  type: string;
  mimeType?: string;
}

export interface ScanResult {
  success: boolean;
  cancelled?: boolean;
  error?: string;
  ocr_text?: string;
  image_base64?: string;
  doc_type?: string;
  id_number?: string;
  name?: string;
  dob?: string;
  extraction?: { doc_type?: string; id_number?: string; name?: string; dob?: string };
}

export interface ChatResponse {
  message: string;
  documents: Array<{ id: string; name: string; type: string }>;
  queryType: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SavedDocument {
  id: string;
  type: string;
  name: string;
  number: string;
  holderName: string;
  expiryDate?: string;
  issueDate?: string;
  frontImage?: string;
  backImage?: string;
  createdAt: string;
  updatedAt: string;
}

// Android Bridge Interface
interface AndroidBridge {
  // Document scanning methods
  openScanner(): void;
  openGallery(): void;
  openFilePicker(): void;
  getCapabilities?(): string;
  isAIReady?(): boolean;
  validateAadhaar?(uid: string): boolean;
  
  // Chat methods
  sendChatMessage?(message: string): void;
  getChatHistory?(): string;
  getChatMessages?(sessionId: string): string;
  startNewChatSession?(): string;
  searchChatHistory?(query: string): string;
  deleteChatSession?(sessionId: string): boolean;
  
  // Document methods
  getAllDocuments?(): string;
  getDocument?(documentId: string): string;
}

// Global Window interface declaration
declare global {
  interface Window {
    Android?: AndroidBridge;
    onFileSelected?: (data: AndroidFileData) => void;
    onScanComplete?: (result: ScanResult) => void;
    onChatResponse?: (response: ChatResponse) => void;
  }
}

// ============= Helper Functions =============

/**
 * Send a chat message to the Android AI assistant
 */
export function sendChatMessage(message: string): boolean {
  if (window.Android?.sendChatMessage) {
    window.Android.sendChatMessage(message);
    return true;
  }
  console.warn('[AndroidBridge] sendChatMessage not available');
  return false;
}

/**
 * Get chat history (list of sessions)
 */
export function getChatHistory(): ChatSession[] {
  if (window.Android?.getChatHistory) {
    try {
      const json = window.Android.getChatHistory();
      return JSON.parse(json) as ChatSession[];
    } catch (e) {
      console.error('[AndroidBridge] Failed to parse chat history:', e);
    }
  }
  return [];
}

/**
 * Get messages for a specific chat session
 */
export function getChatMessages(sessionId: string): ChatMessage[] {
  if (window.Android?.getChatMessages) {
    try {
      const json = window.Android.getChatMessages(sessionId);
      return JSON.parse(json) as ChatMessage[];
    } catch (e) {
      console.error('[AndroidBridge] Failed to parse chat messages:', e);
    }
  }
  return [];
}

/**
 * Start a new chat session
 */
export function startNewChatSession(): string | null {
  if (window.Android?.startNewChatSession) {
    return window.Android.startNewChatSession();
  }
  console.warn('[AndroidBridge] startNewChatSession not available');
  return null;
}

/**
 * Search chat history
 */
export function searchChatHistory(query: string): ChatSession[] {
  if (window.Android?.searchChatHistory) {
    try {
      const json = window.Android.searchChatHistory(query);
      return JSON.parse(json) as ChatSession[];
    } catch (e) {
      console.error('[AndroidBridge] Failed to parse search results:', e);
    }
  }
  return [];
}

/**
 * Delete a chat session
 */
export function deleteChatSession(sessionId: string): boolean {
  if (window.Android?.deleteChatSession) {
    return window.Android.deleteChatSession(sessionId);
  }
  console.warn('[AndroidBridge] deleteChatSession not available');
  return false;
}

/**
 * Get all saved documents
 */
export function getAllDocuments(): SavedDocument[] {
  if (window.Android?.getAllDocuments) {
    try {
      const json = window.Android.getAllDocuments();
      return JSON.parse(json) as SavedDocument[];
    } catch (e) {
      console.error('[AndroidBridge] Failed to parse documents:', e);
    }
  }
  return [];
}

/**
 * Get a single document by ID
 */
export function getDocument(documentId: string): SavedDocument | null {
  if (window.Android?.getDocument) {
    try {
      const json = window.Android.getDocument(documentId);
      return JSON.parse(json) as SavedDocument;
    } catch (e) {
      console.error('[AndroidBridge] Failed to parse document:', e);
    }
  }
  return null;
}

/**
 * Check if Android bridge is available
 */
export function isAndroidBridgeAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.Android;
}

/**
 * Check if chat functionality is available
 */
export function isChatAvailable(): boolean {
  return isAndroidBridgeAvailable() && !!window.Android?.sendChatMessage;
}

// ============= Hook =============

interface UseAndroidBridgeReturn {
  bridgeReady: boolean;
  isInApp: boolean;
  chatAvailable: boolean;
  openScanner: () => void;
  openGallery: () => void;
  openFilePicker: () => void;
  getCapabilities: () => string | null;
  // Chat helpers
  sendMessage: (message: string) => boolean;
  getChatHistory: () => ChatSession[];
  getChatMessages: (sessionId: string) => ChatMessage[];
  startNewSession: () => string | null;
  searchHistory: (query: string) => ChatSession[];
  deleteSession: (sessionId: string) => boolean;
  // Document helpers
  getAllDocs: () => SavedDocument[];
  getDoc: (id: string) => SavedDocument | null;
}

export const useAndroidBridge = (): UseAndroidBridgeReturn => {
  const [bridgeReady, setBridgeReady] = useState(false);
  const [isInApp, setIsInApp] = useState(false);
  const [chatAvailable, setChatAvailable] = useState(false);

  useEffect(() => {
    const checkBridge = () => {
      if (window.Android) {
        console.log("[AndroidBridge] Android object detected");
        setBridgeReady(true);
        setIsInApp(true);
        setChatAvailable(!!window.Android.sendChatMessage);
        return true;
      }
      return false;
    };

    if (!checkBridge()) {
      const interval = setInterval(() => {
        if (checkBridge()) clearInterval(interval);
      }, 500);
      
      const timeout = setTimeout(() => clearInterval(interval), 2000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, []);

  const openScanner = useCallback(() => {
    if (window.Android?.openScanner) {
      window.Android.openScanner();
    } else {
      console.warn("[AndroidBridge] Scanner not available");
    }
  }, []);

  const openGallery = useCallback(() => {
    if (window.Android?.openGallery) {
      window.Android.openGallery();
    } else {
      console.warn("[AndroidBridge] Gallery not available");
    }
  }, []);

  const openFilePicker = useCallback(() => {
    if (window.Android?.openFilePicker) {
      window.Android.openFilePicker();
    } else {
      console.warn("[AndroidBridge] File picker not available");
    }
  }, []);

  const getCapabilitiesFn = useCallback((): string | null => {
    if (window.Android?.getCapabilities) {
      return window.Android.getCapabilities();
    }
    return null;
  }, []);

  return {
    bridgeReady,
    isInApp,
    chatAvailable,
    openScanner,
    openGallery,
    openFilePicker,
    getCapabilities: getCapabilitiesFn,
    // Chat helpers
    sendMessage: sendChatMessage,
    getChatHistory,
    getChatMessages,
    startNewSession: startNewChatSession,
    searchHistory: searchChatHistory,
    deleteSession: deleteChatSession,
    // Document helpers
    getAllDocs: getAllDocuments,
    getDoc: getDocument,
  };
};
