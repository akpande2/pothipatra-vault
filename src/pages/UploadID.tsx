import { useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Camera, Image, FileText, X, Check, Settings } from "lucide-react";
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

  const inputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<UploadStep>("source");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState("");

  /* ===============================
     FILE PICK HANDLER (KEY PART)
     =============================== */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setCapturedImage(url);
    setStep("preview");
  };

  const openPicker = () => {
    inputRef.current?.click();
  };

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

  return (
    <AppLayout>
      {/* HEADER */}
      <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4">
        <div />
        <h1 className="text-lg font-semibold">Add Document</h1>
        <Link
          to="/settings"
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Link>
      </header>

      {/* HIDDEN FILE INPUT (CRITICAL) */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {step === "source" ? (
        <div className="flex flex-col flex-1 p-6 gap-4">
          <p className="text-muted-foreground">
            How would you like to upload your document?
          </p>

          {[
            { icon: Camera, label: "Camera", desc: "Take a photo" },
            { icon: Image, label: "Gallery", desc: "Choose from gallery" },
            { icon: FileText, label: "Files", desc: "Choose from files" },
          ].map(({ icon: Icon, label, desc }) => (
            <button
              key={label}
              onClick={openPicker}
              className={cn(
                "flex items-center gap-4 p-5 rounded-2xl border border-border",
                "bg-card hover:bg-muted/50 transition-all text-left"
              )}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-7 h-7 text-primary" />
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
