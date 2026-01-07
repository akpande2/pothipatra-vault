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

  // Check for Android bridge
  useEffect(() => {
    const checkBridge = () => {
      const hasAndroid = !!(window as any).Android;
      console.log("[UploadID] Android bridge:", hasAndroid);
      setIsAndroid(hasAndroid);
    };
    checkBridge();
    window.addEventListener("androidBridgeReady", checkBridge);
    setTimeout(checkBridge, 1000);
    return () => window.removeEventListener("androidBridgeReady", checkBridge);
  }, []);

  // Android callbacks
  useEffect(() => {
    (window as any).onFileSelected = (data: { uri: string; type: string }) => {
      console.log("[UploadID] onFileSelected:", data.type);
      setIsLoading(false);
      if (data.uri) {
        setCapturedImage(data.uri);
        setStep("preview");
        toast.success("File selected!");
      }
    };

    (window as any).onScanComplete = (data: any) => {
      console.log("[UploadID] onScanComplete:", data);
      setIsLoading(false);
      if (data.cancelled) { toast.info("Cancelled"); return; }
      if (data.error) { toast.error(data.error); return; }
      if (data.doc_type) {
        const map: Record<string, string> = { AADHAAR: "aadhaar", PAN: "pan", VOTER_ID: "voter" };
        if (map[data.doc_type]) setDocumentType(map[data.doc_type]);
      }
      if (data.success) toast.success("Document scanned!");
    };

    return () => {
      delete (window as any).onFileSelected;
      delete (window as any).onScanComplete;
    };
  }, []);

  // THIS IS THE KEY FUNCTION - calls different bridge methods
  const handleSourceSelect = (source: "camera" | "gallery" | "files") => {
    const android = (window as any).Android;
    console.log("[UploadID] handleSourceSelect:", source, "Android:", !!android);

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
        }
      } catch (e) {
        console.error("[UploadID] Bridge error:", e);
        setIsLoading(false);
      }
      setTimeout(() => setIsLoading(false), 10000);
      return;
    }
    // Web fallback
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturedImage(URL.createObjectURL(file));
    setStep("preview");
    e.target.value = "";
  };

  const handleCancel = () => {
    setCapturedImage(null);
    setDocumentType("");
    setStep("source");
  };

  const handleSaveDocument = () => {
    if (!documentType || !capturedImage) return;
    navigate("/dashboard", { state: { newDocument: true, imageData: capturedImage, documentType } });
  };

  const sources = [
    { id: "camera" as const, icon: Camera, label: "Camera", desc: "Take a photo" },
    { id: "gallery" as const, icon: Image, label: "Gallery", desc: "Choose from gallery" },
    { id: "files" as const, icon: FileText, label: "Files", desc: "Choose from files" },
  ];

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="w-10" />
        <h1 className="text-xl font-semibold text-center text-foreground">Add Document</h1>
        <Link to="/settings">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />

      {step === "source" ? (
        <div className="flex flex-col gap-4 mt-8">
          <p className="text-muted-foreground text-center mb-4">How would you like to upload your document?</p>
          <p className="text-xs text-center text-muted-foreground">{isAndroid ? "🤖 Android Mode" : "🌐 Web Mode"}</p>

          {sources.map(({ id, icon: Icon, label, desc }) => (
            <button
              key={id}
              onClick={() => handleSourceSelect(id)}
              disabled={isLoading}
              className={cn(
                "flex items-center gap-4 p-5 rounded-2xl border border-border",
                "bg-card hover:bg-muted/50 transition-all text-left",
                "disabled:opacity-50"
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                {isLoading ? <Loader2 className="h-6 w-6 text-primary animate-spin" /> : <Icon className="h-6 w-6 text-primary" />}
              </div>
              <div>
                <p className="font-medium text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-border bg-muted">
            {capturedImage && <img src={capturedImage} alt="Preview" className="w-full h-full object-contain" />}
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleCancel}><X className="h-4 w-4 mr-2" />Cancel</Button>
              <Button className="flex-1" onClick={handleSaveDocument} disabled={!documentType}><Check className="h-4 w-4 mr-2" />Save</Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
