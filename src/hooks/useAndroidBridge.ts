import { useState, useEffect, useCallback } from "react";

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
    Android?: AndroidBridge;
    onFileSelected?: (fileData: string, fileName: string, mimeType: string) => void;
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

  // Check immediately if we're in Android app
  const isInApp = typeof window !== "undefined" && !!window.Android;

  useEffect(() => {
    if (window.Android) {
      setBridgeReady(true);
    }

    const handleBridgeReady = () => {
      setBridgeReady(true);
    };
    window.addEventListener("androidBridgeReady", handleBridgeReady);

    return () => {
      window.removeEventListener("androidBridgeReady", handleBridgeReady);
    };
  }, []);

  const openScanner = useCallback(() => {
    if (window.Android) {
      window.Android.openScanner();
    } else {
      console.warn("Android bridge not available");
    }
  }, []);

  const openGallery = useCallback(() => {
    if (window.Android) {
      window.Android.openGallery();
    } else {
      console.warn("Android bridge not available");
    }
  }, []);

  const openFilePicker = useCallback(() => {
    if (window.Android) {
      window.Android.openFilePicker();
    } else {
      console.warn("Android bridge not available");
    }
  }, []);

  const getCapabilities = useCallback((): string | null => {
    if (window.Android) {
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
