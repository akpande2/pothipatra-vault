import { useRef, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Camera, Image, FileText, X, Check, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type UploadStep = "source" | "preview";

const DOCUMENT_TYPES = [
  { value: "aadhaar", label: "Aadhaar Card" },
  { value: "pan", label: "PAN Card" },
  { value: "passport", label: "Passport" },
  { value: "driving", label: "Driving Licence" },
  { value: "voter", label: "Voter ID" },
  { value: "ration", label: "Ration Card" },
  { value: "other", label: "Other" },
];

export default function UploadID() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<UploadStep>("source");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  // =========================================================================
  // ANDROID BRIDGE DETECTION
  // =========================================================================
  useEffect(() => {
    const checkBridge = () => {
      const hasAndroid = !!(window as any).Android;
      console.log("[UploadID] Android bridge:", hasAndroid);
      setIsAndroid(hasAndroid);
    };

    // Check immediately
    checkBridge();

    // Listen for bridge ready event (fired by MainActivity.kt)
    const handleBridgeReady = () => {
      console.log("[UploadID] Bridge ready event");
      checkBridge();
    };
    window.addEventListener("androidBridgeReady", handleBridgeReady);

    // Recheck after delay (bridge injection timing can vary)
    const timeout = setTimeout(checkBridge, 1000);

    return () => {
      window.removeEventListener("androidBridgeReady", handleBridgeReady);
      clearTimeout(timeout);
    };
  }, []);

  // =========================================================================
  // ANDROID CALLBACKS - Receive data from native side
  // =========================================================================
  useEffect(() => {
    // Called when user selects image from gallery or files
    (window as any).onFileSelected = (data: { uri: string; type: string; mimeType?: string }) => {
      console.log("[UploadID] onFileSelected:", data.type);
      setIsLoading(false);

      if (data.uri) {
        setCapturedImage(data.uri);
        setStep("preview");
        toast.success("File selected!");
      }
    };

    // Called when scanner completes (camera capture + OCR)
    (window as any).onScanComplete = (data: any) => {
      console.log("[UploadID] onScanComplete:", data);
      setIsLoading(false);

      if (data.cancelled) {
        toast.info("Cancelled");
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Auto-select document type based on AI extraction
      if (data.doc_type) {
        const typeMap: Record<string, string> = {
          AADHAAR: "aadhaar",
          PAN: "pan",
          VOTER_ID: "voter",
        };
        if (typeMap[data.doc_type]) {
          setDocumentType(typeMap[data.doc_type]);
        }
      }

      if (data.success) {
        toast.success("Document scanned!");
      }
    };

    return () => {
      delete (window as any).onFileSelected;
      delete (window as any).onScanComplete;
    };
  }, []);

  // =========================================================================
  // SOURCE SELECTION - Different behavior for Android vs Web
  // =========================================================================
  const handleSourceSelect = (source: "camera" | "gallery" | "files") => {
    const android = (window as any).Android;
    console.log("[UploadID] handleSourceSelect:", source, "Android:", !!android);

    // ANDROID PATH - Call native bridge methods
    if (android) {
      setIsLoading(true);

      try {
        if (source === "camera" && android.openScanner) {
          console.log("[UploadID] Calling Android.openScanner()");
          android.openScanner();
          toast.info("Opening camera...");
        } else if (source === "gallery" && android.openGallery) {
          console.log("[UploadID] Calling Android.openGallery()");
          android.openGallery();
          toast.info("Opening gallery...");
        } else if (source === "files" && android.openFilePicker) {
          console.log("[UploadID] Calling Android.openFilePicker()");
          android.openFilePicker();
          toast.info("Opening files...");
        } else {
          // Method not available, fall back to file input
          console.warn("[UploadID] Method not available, using fallback");
          setIsLoading(false);
          fileInputRef.current?.click();
        }
      } catch (error) {
        console.error("[UploadID] Bridge error:", error);
        setIsLoading(false);
        toast.error("Failed to open");
      }

      // Safety timeout - reset loading if callback never fires
      setTimeout(() => setIsLoading(false), 10000);
      return;
    }

    // WEB FALLBACK - Use file input
    console.log("[UploadID] Using web fallback");
    fileInputRef.current?.click();
  };

  // =========================================================================
  // WEB FILE INPUT HANDLER (fallback for browser)
  // =========================================================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setCapturedImage(url);
    setStep("preview");
    e.target.value = ""; // Reset so same file can be selected again
  };

  // =========================================================================
  // ACTIONS
  // =========================================================================
  const handleCancel = () => {
    setCapturedImage(null);
    setDocumentType("");
    setStep("source");
  };

  const handleSaveDocument = () => {
    if (!documentType || !capturedImage) return;

    navigate("/dashboard", {
      state: {
        newDocument: true,
        imageData: capturedImage,
        documentType,
      },
    });
  };

  // =========================================================================
  // RENDER
  // =========================================================================
  const sources = [
    { id: "camera" as const, icon: Camera, label: "Camera", desc: "Take a photo" },
    { id: "gallery" as const, icon: Image, label: "Gallery", desc: "Choose from gallery" },
    { id: "files" as const, icon: FileText, label: "Files", desc: "Choose from files" },
  ];

  return (
    <AppLayout>
      {/* HEADER */}
      <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4">
        <div className="w-9" />
        <h1 className="text-lg font-semibold">Add Document</h1>
        <Link
          to="/settings"
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Link>
      </header>

      {/* HIDDEN FILE INPUT - Web fallback only */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {step === "source" ? (
        <div className="flex flex-col flex-1 p-6 gap-4">
          <p className="text-muted-foreground">
            How would you like to upload your document?
          </p>

          {/* Debug indicator - remove in production */}
          <p className="text-xs text-muted-foreground">
            Mode: {isAndroid ? "🤖 Android Native" : "🌐 Web Browser"}
          </p>

          {sources.map(({ id, icon: Icon, label, desc }) => (
            <button
              key={id}
              onClick={() => handleSourceSelect(id)}
              disabled={isLoading}
              className={cn(
                "flex items-center gap-4 p-5 rounded-2xl border border-border",
                "bg-card hover:bg-muted/50 transition-all text-left",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                {isLoading ? (
                  <Loader2 className="w-7 h-7 text-primary animate-spin" />
                ) : (
                  <Icon className="w-7 h-7 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium">{label}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col flex-1">
          {/* IMAGE PREVIEW */}
          <div className="flex-1 flex items-center justify-center bg-muted/30 p-4">
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Preview"
                className="max-h-full max-w-full rounded-xl shadow"
              />
            )}
          </div>

          {/* METADATA */}
          <div className="p-6 border-t border-border space-y-4">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-14" onClick={handleCancel}>
                <X className="w-5 h-5 mr-2" />
                Cancel
              </Button>
              <Button
                className="flex-1 h-14"
                disabled={!documentType}
                onClick={handleSaveDocument}
              >
                <Check className="w-5 h-5 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
