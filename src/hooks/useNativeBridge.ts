import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface AndroidFileData {
  uri: string;
  type: string;
  mimeType?: string;
}

export const useNativeBridge = () => {
  const [bridgeReady, setBridgeReady] = useState(false);

  useEffect(() => {
    // 1. Define the callback GLOBALLY as soon as the app starts
    (window as any).onFileSelected = (data: AndroidFileData) => {
      console.log("NATIVE_BRIDGE: Data received", data);
      
      // Dispatch a custom event so any component (like UploadID) can hear it
      const event = new CustomEvent("android-file-received", { detail: data });
      window.dispatchEvent(event);
    };

    (window as any).onScanComplete = (data: any) => {
      window.dispatchEvent(new CustomEvent("android-scan-signal", { detail: data }));
    };

    // 2. Poll for the Android object (sometimes injection is slow)
    const checkInterval = setInterval(() => {
      if ((window as any).Android) {
        setBridgeReady(true);
        console.log("NATIVE_BRIDGE: Android detected");
        clearInterval(checkInterval);
      }
    }, 500);

    return () => clearInterval(checkInterval);
  }, []);

  const openScanner = useCallback(() => {
    if ((window as any).Android?.openScanner) {
      (window as any).Android.openScanner();
    } else {
      toast.error("Bridge not connected");
    }
  }, []);

  const openGallery = useCallback(() => {
    if ((window as any).Android?.openGallery) {
      (window as any).Android.openGallery();
    }
  }, []);

  return { bridgeReady, openScanner, openGallery };
};
