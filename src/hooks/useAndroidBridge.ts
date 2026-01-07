import { useState, useEffect, useCallback } from "react";

// 1. Define the exact shape of the object sent from Kotlin
interface AndroidFileData {
  uri: string;     // This is your base64 dataUrl
  type: string;    // 'camera', 'gallery', etc.
  mimeType?: string;
}

interface AndroidBridge {
  openScanner(): void;
  openGallery(): void;
  openFilePicker(): void;
  getCapabilities(): string;
  isAIReady(): boolean;
  validateAadhaar(uid: string): boolean;
}

declare global {
  interface Window {
    Android?: {
      openScanner: () => void;
      openGallery: () => void;
      openFilePicker: () => void;
      getCapabilities?: () => string;
      isReady?: () => boolean;
      isAIReady?: () => boolean;
      validateAadhaar?: (uid: string) => boolean;
    };
    onFileSelected?: (data: { base64: string; mimeType: string; fileName: string }) => void;
    onScanComplete?: (result: any) => void;
  }
}

interface UseAndroidBridgeReturn {
  bridgeReady: boolean;
  isInApp: boolean;
  openScanner: () => void;
  openGallery: () => void;
  openFilePicker: () => void;
  getCapabilities: () => string | null;
}

export const useAndroidBridge = (): UseAndroidBridgeReturn => {
  const [bridgeReady, setBridgeReady] = useState(false);

  // 2. Reactive In-App check
  const [isInApp, setIsInApp] = useState(false);

  useEffect(() => {
    const checkBridge = () => {
      if (window.Android) {
        console.log("BRIDGE: Android object detected");
        setBridgeReady(true);
        setIsInApp(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (!checkBridge()) {
      // If not found, poll for 2 seconds (Android injection timing varies)
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
      console.warn("Scanner not available in this environment");
    }
  }, []);

  const openGallery = useCallback(() => {
    if (window.Android?.openGallery) {
      window.Android.openGallery();
    } else {
      console.warn("Gallery not available");
    }
  }, []);

  const openFilePicker = useCallback(() => {
    if (window.Android?.openFilePicker) {
      window.Android.openFilePicker();
    } else {
      console.warn("File picker not available");
    }
  }, []);

  const getCapabilities = useCallback((): string | null => {
    if (window.Android?.getCapabilities) {
      return window.Android.getCapabilities();
    }
    return null;
  }, []);

  return {
    bridgeReady,
    isInApp,
    openScanner,
    openGallery,
    openFilePicker,
    getCapabilities,
  };
};
