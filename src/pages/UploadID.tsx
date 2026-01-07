import { useState, useEffect, useCallback } from "react";
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
import { useNativeBridge } from "@/hooks/useNativeBridge";

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
  const { openScanner, openGallery, bridgeReady } = useNativeBridge();
  const [step, setStep] = useState<UploadStep>("source");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Listen for the event dispatched by our global hook
    const handleFile = (event: any) => {
      const data = event.detail;
      if (data?.uri) {
        setCapturedImage(data.uri);
        setStep("preview");
        setIsLoading(false);
        toast.success("Document captured!");
      }
    };

    window.addEventListener("android-file-received", handleFile);
    return () => window.removeEventListener("android-file-received", handleFile);
  }, []);

  /* ============================================================
     SOURCE HANDLER
     ============================================================ */
  const handleSourceSelect = (source: "camera" | "gallery" | "files") => {
    setIsLoading(true);

    if (source === "camera") openScanner();
    else if (source === "gallery") openGallery();
    else {
      // Fallback for file picker if needed
      (window as any).Android?.openFilePicker?.();
    }
    setTimeout(() => setIsLoading(false), 30000);
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
      description: language === "hi" ? "गैलरी से चुनें" : "Choose from gallery",
    },
    {
      id: "files" as const,
      icon: FileText,
      label: language === "hi" ? "फाइल्स" : "Files",
      description: language === "hi" ? "फाइल से चुनें" : "Choose from files",
    },
  ];

  return (
    <AppLayout>
      <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-4">
        <div className="w-9" />
        <h1 className="text-lg font-semibold text-foreground">
          {t.addDocument}
        </h1>
        <Link to="/settings" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted">
          <Settings className="w-[18px] h-[18px] text-muted-foreground" />
        </Link>
      </header>

      {step === "source" ? (
        <div className="flex flex-col flex-1 p-6">
          <div className="mb-8">
            <p className="text-muted-foreground text-base">
              {language === "hi"
                ? "अपना दस्तावेज़ कैसे अपलोड करना चाहते हैं?"
                : "How would you like to upload your document?"}
            </p>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            {sources.map((source) => {
              const Icon = source.icon;
              return (
                <button
                  key={source.id}
                  disabled={isLoading}
                  onClick={() => handleSourceSelect(source.id)}
                  className={cn(
                    "flex items-center gap-4 p-5 rounded-2xl border border-border",
                    "bg-card hover:bg-muted/50 active:scale-[0.98] transition-all text-left",
                    isLoading && "opacity-50 cursor-not-allowed"
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
                    <p className="font-medium text-base text-foreground">{source.label}</p>
                    <p className="text-sm text-muted-foreground">{source.description}</p>
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
                  <SelectValue placeholder={language === "hi" ? "चुनें" : "Select"} />
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

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-14" onClick={handleCancel}>
                <X className="w-5 h-5 mr-2" />
                {t.cancel}
              </Button>
              <Button className="flex-1 h-14" disabled={!documentType} onClick={handleSaveDocument}>
                <Check className="w-5 h-5 mr-2" />
                {language === "hi" ? "सहेजें" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
