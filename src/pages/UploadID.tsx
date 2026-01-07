import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { AppLayout } from "@/components/AppLayout";
import {
  Camera,
  Image,
  FileText,
  X,
  Check,
  Settings,
  Loader2,
} from "lucide-react";
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
  { value: "aadhaar", labelEn: "Aadhaar Card", labelHi: "आधार कार्ड" },
  { value: "pan", labelEn: "PAN Card", labelHi: "पैन कार्ड" },
  { value: "passport", labelEn: "Passport", labelHi: "पासपोर्ट" },
  { value: "driving", labelEn: "Driving Licence", labelHi: "ड्राइविंग लाइसेंस" },
  { value: "voter", labelEn: "Voter ID", labelHi: "मतदाता पहचान पत्र" },
  { value: "ration", labelEn: "Ration Card", labelHi: "राशन कार्ड" },
  { value: "other", labelEn: "Other", labelHi: "अन्य" },
];

export default function UploadID() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState<UploadStep>("source");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  /* ============================================================
     ANDROID → WEB CALLBACKS
     ============================================================ */
  useEffect(() => {
    (window as any).onFileSelected = (data: {
      uri: string;
      type: string;
      mimeType?: string;
    }) => {
      console.log("onFileSelected:", data);
      if (data?.uri) {
        setCapturedImage(data.uri);
        setStep("preview");
        setIsLoading(false);
        toast.success("File selected");
      }
    };

    (window as any).onScanComplete = (data: any) => {
      console.log("onScanComplete:", data);
      setIsLoading(false);
      if (data?.cancelled) toast.info("Cancelled");
      else if (data?.error) toast.error(data.error);
    };

    return () => {
      delete (window as any).onFileSelected;
      delete (window as any).onScanComplete;
    };
  }, []);

  useEffect(() => {
    const handler = () => {
      console.log("GLOBAL CLICK DETECTED");
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);


  /* ============================================================
     ANDROID BRIDGE READY HANDSHAKE (CRITICAL)
     ============================================================ */
  useEffect(() => {
    const markAndroidReady = () => {
      console.log("Android bridge ready");
      setIsAndroid(true);
    };

    // If bridge already injected
    if ((window as any).Android) {
      markAndroidReady();
    }

    window.addEventListener("androidBridgeReady", markAndroidReady);

    return () => {
      window.removeEventListener("androidBridgeReady", markAndroidReady);
    };
  }, []);

  /* ============================================================
     SOURCE HANDLER
     ============================================================ */
  const handleSourceSelect = (source: "camera" | "gallery" | "files") => {
    const android = (window as any).Android;
    if (!android) {
      console.error("Android bridge not available");
      return;
    }

    setIsLoading(true);

    try {
      if (source === "camera") {
        android.openScanner();
        toast.info("Opening camera…");
      } else if (source === "gallery") {
        android.openGallery();
        toast.info("Opening gallery…");
      } else if (source === "files") {
        android.openFilePicker();
        toast.info("Opening files…");
      }
    } catch (err) {
      console.error("Android bridge call failed:", err);
      setIsLoading(false);
      toast.error("Failed to open picker");
    }
  };

  const handleCancel = () => {
    setCapturedImage(null);
    setDocumentType("");
    setStep("source");
  };

  const handleSaveDocument = () => {
    if (!documentType) return;
    navigate("/dashboard", {
      state: {
        newDocument: true,
        imageData: capturedImage,
        documentType,
      },
    });
  };

  const sources = [
    {
      id: "camera" as const,
      icon: Camera,
      label: language === "hi" ? "कैमरा" : "Camera",
      description: language === "hi" ? "फोटो लें" : "Take a photo",
    },
    {
      id: "gallery" as const,
      icon: Image,
      label: language === "hi" ? "गैलरी" : "Gallery",
      description:
        language === "hi" ? "गैलरी से चुनें" : "Choose from gallery",
    },
    {
      id: "files" as const,
      icon: FileText,
      label: language === "hi" ? "फाइल्स" : "Files",
      description:
        language === "hi" ? "फाइल से चुनें" : "Choose from files",
    },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-4">
        <div className="w-9" />
        <h1 className="text-lg font-semibold text-foreground">
          {t.addDocument}
        </h1>
        <Link
          to="/settings"
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Settings className="w-[18px] h-[18px] text-muted-foreground" />
        </Link>
      </header>

      {step === "source" ? (
      <div className="flex flex-col flex-1 p-6 relative z-50 pointer-events-auto">
          <div className="mb-8">
            <p className="text-muted-foreground text-base">
              {language === "hi"
                ? "अपना दस्तावेज़ कैसे अपलोड करना चाहते हैं?"
                : "How would you like to upload your document?"}
            </p>
          </div>

          <div className="flex-1 flex flex-col gap-4 relative z-50 pointer-events-auto">
            {sources.map((source) => {
              const Icon = source.icon;
              return (
                <button
                  onClick={() => {
                    console.log("CLICK RECEIVED", source.id);
                    handleSourceSelect(source.id);
                  }}
                  className={cn(
                    "pointer-events-auto",
                    "flex items-center gap-4 p-5 rounded-2xl border border-border",
                    "bg-card hover:bg-muted/50 hover:border-primary/30",
                    "transition-all duration-200 text-left group"
                  )}
                >

                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    {isLoading ? (
                      <Loader2 className="w-7 h-7 text-primary animate-spin" />
                    ) : (
                      <Icon className="w-7 h-7 text-primary stroke-[1.5]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-base text-foreground">
                      {source.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {source.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full bg-background">
          <div className="flex-1 bg-muted/30 flex items-center justify-center p-4">
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Document preview"
                className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
              />
            )}
          </div>

          <div className="p-6 border-t border-border bg-background space-y-4">
            <div className="space-y-2">
              <Label htmlFor="document-type">
                {language === "hi" ? "दस्तावेज़ का प्रकार" : "Document Type"}
              </Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue
                    placeholder={
                      language === "hi"
                        ? "दस्तावेज़ का प्रकार चुनें"
                        : "Select document type"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {language === "hi" ? type.labelHi : type.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="text-center text-muted-foreground text-sm">
              {language === "hi"
                ? "यह वह दस्तावेज़ है जो PothiPatra में सहेजा जाएगा"
                : "This is the version that will be saved in PothiPatra"}
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-14"
                onClick={handleCancel}
              >
                <X className="w-5 h-5 mr-2" />
                {t.cancel}
              </Button>
              <Button
                className="flex-1 h-14"
                disabled={!documentType}
                onClick={handleSaveDocument}
              >
                <Check className="w-5 h-5 mr-2" />
                {language === "hi" ? "दस्तावेज़ सहेजें" : "Save Document"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
