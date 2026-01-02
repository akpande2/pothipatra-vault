import { useState, useEffect, useCallback } from 'react';

// TypeScript interface for window.Android
interface AndroidBridge {
  openScanner(): void;
  getCapabilities(): string;
  isAIReady(): boolean;
  validateAadhaar(uid: string): boolean;
}

declare global {
  interface Window {
    Android?: AndroidBridge;
  }
}

interface UseAndroidBridgeReturn {
  bridgeReady: boolean;
  isInApp: boolean;
  openScanner: () => void;
  getCapabilities: () => string | null;
}

export const useAndroidBridge = (): UseAndroidBridgeReturn => {
  const [bridgeReady, setBridgeReady] = useState(false);

  useEffect(() => {
    // Check if window.Android exists on mount
    if (window.Android) {
      setBridgeReady(true);
    }

    // Listen for custom event
    const handleBridgeReady = () => {
      setBridgeReady(true);
    };

    window.addEventListener('androidBridgeReady', handleBridgeReady);

    return () => {
      window.removeEventListener('androidBridgeReady', handleBridgeReady);
    };
  }, []);

  const openScanner = useCallback(() => {
    if (bridgeReady && window.Android) {
      window.Android.openScanner();
    } else {
      console.warn('Android bridge not ready. Cannot open scanner.');
    }
  }, [bridgeReady]);

  const getCapabilities = useCallback((): string | null => {
    if (bridgeReady && window.Android) {
      return window.Android.getCapabilities();
    }
    console.warn('Android bridge not ready. Cannot get capabilities.');
    return null;
  }, [bridgeReady]);

  return {
    bridgeReady,
    isInApp: bridgeReady,
    openScanner,
    getCapabilities,
  };
};
