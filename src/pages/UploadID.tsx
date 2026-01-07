import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface StoredDocument {
  id: string;
  fileName: string;
  displayName: string;
  docType: string;
  ocrText: string;
  previewUrl: string;
  createdAt: number;
}

declare global {
  interface Window {
    Android?: {
      startScan: () => void;
    };
    onScanResult?: (result: any) => void;
  }
}

export default function UploadID() {
  const navigate = useNavigate();

  useEffect(() => {
    window.onScanResult = (result: any) => {
      try {
        /*
          Expected result shape from Android:
          {
            ocrText: string,
            docType: string,
            previewBase64: string,
            fileName?: string
          }
        */

        const ocrText = result.ocrText || "";
        const docType = result.docType || "Other";
        const previewUrl = result.previewBase64
          ? `data:image/jpeg;base64,${result.previewBase64}`
          : "";

        const firstName =
          ocrText
            .match(/\b[A-Z][a-z]+\b/)?.[0] || "Unknown";

        const newDoc: StoredDocument = {
          id: crypto.randomUUID(),
          fileName: result.fileName || "Scanned Document",
          displayName: firstName,
          docType,
          ocrText,
          previewUrl,
          createdAt: Date.now(),
        };

        const existing =
          JSON.parse(localStorage.getItem("documents") || "[]") as StoredDocument[];

        existing.unshift(newDoc);
        localStorage.setItem("documents", JSON.stringify(existing));

        navigate("/id-cards");
      } catch (e) {
        console.error("Failed to save document", e);
      }
    };
  }, [navigate]);

  const startScan = () => {
    if (window.Android?.startScan) {
      window.Android.startScan();
    } else {
      alert("Android bridge not available");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Upload Document</h1>

      <button
        onClick={startScan}
        className="w-full bg-primary text-white py-3 rounded-lg"
      >
        Scan / Upload Document
      </button>
    </div>
  );
}
