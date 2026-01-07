import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const STORAGE_KEY = 'pothipatra_documents';

interface ScanResult {
  success: boolean;
  cancelled?: boolean;
  error?: string;
  ocr_text?: string;
  image_base64?: string;
  doc_type?: string;
  id_number?: string;
  name?: string;
  dob?: string;
  extraction?: { doc_type?: string; id_number?: string; name?: string; dob?: string };
}

declare global {
  interface Window {
    Android?: { openScanner: () => void; openGallery: () => void; openFilePicker: () => void };
    onScanComplete?: (result: ScanResult) => void;
    onFileSelected?: (data: { base64: string; mimeType: string; fileName: string }) => void;
  }
}

function mapDocType(type?: string): string {
  switch (type?.toUpperCase()) {
    case 'AADHAAR': return 'aadhaar';
    case 'PAN': return 'pan';
    case 'VOTER_ID': return 'voter';
    case 'PASSPORT': return 'passport';
    case 'DRIVING': return 'driving';
    default: return 'other';
  }
}

function saveToStorage(doc: any) {
  const docs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  docs.push({ ...doc, id: `doc_${Date.now()}`, createdAt: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export default function UploadID() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isAndroid = typeof window !== 'undefined' && !!window.Android;

  useEffect(() => {
    window.onScanComplete = (result: ScanResult) => {
      setIsLoading(false);
      if (result.cancelled) return;
      if (!result.success) { toast.error(result.error || 'Failed'); return; }

      const docType = result.doc_type || result.extraction?.doc_type || 'other';
      const idNumber = result.id_number || result.extraction?.id_number || '';
      const holderName = result.name || result.extraction?.name || '';
      const dob = result.dob || result.extraction?.dob || '';
      const imageBase64 = result.image_base64 || '';

      if (!idNumber || idNumber === 'NOT_FOUND') { toast.error('Could not extract ID'); return; }

      saveToStorage({
        type: mapDocType(docType),
        name: `${docType} Card`,
        number: idNumber,
        holderName,
        dateOfBirth: dob,
        image: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : '',
        ocrText: result.ocr_text || '',
      });

      toast.success('Document saved!');
      navigate('/');
    };

    window.onFileSelected = (data) => {
      setIsLoading(false);
      saveToStorage({ type: 'other', name: data.fileName, number: '', holderName: '', image: `data:${data.mimeType};base64,${data.base64}` });
      toast.success('Uploaded');
      navigate('/');
    };

    return () => { window.onScanComplete = undefined; window.onFileSelected = undefined; };
  }, [navigate]);

  const handleSource = (src: string) => {
    if (isAndroid && window.Android) {
      setIsLoading(true);
      if (src === 'camera') window.Android.openScanner();
      else if (src === 'gallery') window.Android.openGallery();
      else window.Android.openFilePicker();
    } else fileInputRef.current?.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      saveToStorage({ type: 'other', name: file.name, number: '', holderName: '', image: reader.result });
      setIsLoading(false);
      toast.success('Uploaded');
      navigate('/');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-background border-b px-4 py-3 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="font-semibold">Upload Document</h1>
      </div>
      <div className="p-4 space-y-4">
        <Button className="w-full h-14 gap-3" onClick={() => handleSource('camera')} disabled={isLoading}><Camera className="h-5 w-5" />Camera</Button>
        <Button variant="outline" className="w-full h-14 gap-3" onClick={() => handleSource('gallery')} disabled={isLoading}><Image className="h-5 w-5" />Gallery</Button>
        <Button variant="outline" className="w-full h-14 gap-3" onClick={() => handleSource('files')} disabled={isLoading}><FileText className="h-5 w-5" />Files</Button>
        <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />
        {isLoading && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><Card className="p-6"><Loader2 className="h-8 w-8 animate-spin" /></Card></div>}
      </div>
    </div>
  );
}
