import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { AppLayout } from "@/components/AppLayout";
import { Camera, Image, FileText, X, Check, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleCameraClick = () => {
    // Debug: Check what's available
    console.log("Android bridge:", (window as any).Android);
    console.log("isAndroidBridgeReady:", (window as any).isAndroidBridgeReady);

    if ((window as any).Android) {
      console.log("Calling Android.openScanner()...");
      (window as any).Android.openScanner();
      toast.info("Opening Secure Camera...");
    } else {
      toast.error("Android bridge not found!");
      cameraInputRef.current?.click();
    }
  };

  const handleSourceSelect = (source: "camera" | "gallery" | "files") => {
    if (source === "camera") {
      handleCameraClick();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedImage(reader.result as string);
        setStep("preview");
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleCancel = () => {
    setCapturedImage(null);
    setDocumentType("");
    setStep("source");
  };

  const handleSaveDocument = () => {
    if (!documentType) return;
    // Navigate to dashboard with the image data and document type
    navigate("/dashboard", {
      state: {
        newDocument: true,
        imageData: capturedImage,
        documentType: documentType,
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
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header */}
      <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-4">
        <div className="w-9" />
        <h1 className="text-lg font-semibold text-foreground">{t.addDocument}</h1>
        <Link
          to="/settings"
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Settings className="w-[18px] h-[18px] text-muted-foreground" />
        </Link>
      </header>

      {step === "source" ? (
        <div className="flex flex-col flex-1 p-6">
          {/* Description */}
          <div className="mb-8">
            <p className="text-muted-foreground text-base">
              {language === "hi"
                ? "अपना दस्तावेज़ कैसे अपलोड करना चाहते हैं?"
                : "How would you like to upload your document?"}
            </p>
          </div>

          {/* Source Options */}
          <div className="flex-1 flex flex-col gap-4">
            {sources.map((source) => {
              const Icon = source.icon;
              return (
                <button
                  key={source.id}
                  onClick={() => handleSourceSelect(source.id)}
                  className={cn(
                    "flex items-center gap-4 p-5 rounded-2xl border border-border",
                    "bg-card hover:bg-muted/50 hover:border-primary/30",
                    "transition-all duration-200 text-left group",
                  )}
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-7 h-7 text-primary stroke-[1.5]" />
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
          {/* Full-screen Preview */}
          <div className="flex-1 relative bg-muted/30 flex items-center justify-center p-4">
            {capturedImage && (
              <img
                src={capturedImage}
                alt="Document preview"
                className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
              />
            )}
          </div>

          {/* Confirmation Section */}
          <div className="p-6 border-t border-border bg-background space-y-4">
            {/* Document Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="document-type" className="text-sm font-medium text-foreground">
                {language === "hi" ? "दस्तावेज़ का प्रकार" : "Document Type"}
              </Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger id="document-type" className="w-full h-12 bg-background rounded-xl">
                  <SelectValue placeholder={language === "hi" ? "दस्तावेज़ का प्रकार चुनें" : "Select document type"} />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="cursor-pointer">
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
              <Button variant="outline" className="flex-1 h-14 gap-2 text-base rounded-xl" onClick={handleCancel}>
                <X className="w-5 h-5" />
                {t.cancel}
              </Button>
              <Button
                className="flex-1 h-14 gap-2 text-base rounded-xl"
                onClick={handleSaveDocument}
                disabled={!documentType}
              >
                <Check className="w-5 h-5" />
                {language === "hi" ? "दस्तावेज़ सहेजें" : "Save Document"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
