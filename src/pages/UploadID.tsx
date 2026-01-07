import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useStore } from '@/hooks/useStore';
import { DocumentType } from '@/types/document';

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
  }
}

function mapDocType(type?: string): DocumentType {
  const t = type?.toUpperCase();
  console.log('[UploadID] mapDocType input:', type, '-> upper:', t);
  if (t === 'AADHAAR') return 'aadhaar';
  if (t === 'PAN') return 'pan';
  if (t === 'VOTER_ID' || t === 'VOTER') return 'voter';
  if (t === 'PASSPORT') return 'passport';
  if (t === 'DRIVING' || t === 'DL') return 'driving';
  if (t === 'RATION') return 'ration';
  return 'other';
}

function getDocLabel(type: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    aadhaar: 'Aadhaar', pan: 'PAN', passport: 'Passport',
    driving: 'DL', voter: 'VoterID', ration: 'Ration', other: 'Document'
  };
  return labels[type];
}

export default function UploadID() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addDocument } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const isAndroid = typeof window !== 'undefined' && !!window.Android;

  useEffect(() => {
    console.log('[UploadID] Setting up onScanComplete callback');
    
    window.onScanComplete = (result: ScanResult) => {
      console.log('[UploadID] onScanComplete received:', JSON.stringify(result, null, 2));
      setIsLoading(false);
      
      if (result.cancelled) {
        console.log('[UploadID] Scan cancelled');
        return;
      }
      
      if (!result.success) {
        console.log('[UploadID] Scan failed:', result.error);
        toast.error(result.error || 'Failed');
        return;
      }

      // Extract data (handle flat or nested)
      const rawType = result.doc_type || result.extraction?.doc_type || 'other';
      const docType = mapDocType(rawType);
      const idNumber = result.id_number || result.extraction?.id_number || '';
      const imageBase64 = result.image_base64 || '';
      
      // Handle "NOT_FOUND" as empty
      let holderName = result.name || result.extraction?.name || '';
      if (holderName === 'NOT_FOUND' || holderName === 'not_found') {
        holderName = '';
      }

      console.log('[UploadID] Extracted:', { rawType, docType, idNumber, holderName, hasImage: !!imageBase64 });

      // Generate name: FirstName_DocType or just DocType
      const firstName = holderName?.split(' ')[0] || '';
      const docName = firstName ? `${firstName}_${getDocLabel(docType)}` : getDocLabel(docType);

      console.log('[UploadID] Saving document:', { docName, docType, idNumber });

      // Save document - even without id_number
      addDocument({
        type: docType,
        name: docName,
        number: idNumber,
        holderName: holderName,
        frontImage: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : undefined,
      });

      toast.success(`${getDocLabel(docType)} saved!`);
      navigate('/');
    };

    return () => { 
      console.log('[UploadID] Cleaning up onScanComplete callback');
      window.onScanComplete = undefined; 
    };
  }, [navigate, addDocument]);

  const handleSource = (src: string) => {
    console.log('[UploadID] handleSource:', src, 'isAndroid:', isAndroid);
    
    if (isAndroid && window.Android) {
      setIsLoading(true);
      setLoadingMsg(src === 'camera' ? 'Opening camera...' : 'Processing...');
      
      console.log('[UploadID] Calling Android.' + (src === 'camera' ? 'openScanner' : src === 'gallery' ? 'openGallery' : 'openFilePicker') + '()');
      
      if (src === 'camera') window.Android.openScanner();
      else if (src === 'gallery') window.Android.openGallery();
      else window.Android.openFilePicker();
    } else {
      console.log('[UploadID] Using web file input');
      fileInputRef.current?.click();
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    console.log('[UploadID] Web file selected:', file.name, file.type);
    setIsLoading(true);
    setLoadingMsg('Processing...');
    
    const reader = new FileReader();
    reader.onload = () => {
      console.log('[UploadID] File read complete');
      addDocument({
        type: 'other',
        name: file.name.replace(/\.[^/.]+$/, ''),
        number: '',
        holderName: '',
        frontImage: reader.result as string,
      });
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
        <p className="text-xs text-muted-foreground">{isAndroid ? '🤖 Android Mode' : '🌐 Web Mode'}</p>
        <Button className="w-full h-14 gap-3" onClick={() => handleSource('camera')} disabled={isLoading}><Camera className="h-5 w-5" />Scan with Camera</Button>
        <Button variant="outline" className="w-full h-14 gap-3" onClick={() => handleSource('gallery')} disabled={isLoading}><Image className="h-5 w-5" />Gallery</Button>
        <Button variant="outline" className="w-full h-14 gap-3" onClick={() => handleSource('files')} disabled={isLoading}><FileText className="h-5 w-5" />Files</Button>
        <input ref={fileInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />
        {isLoading && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><Card className="p-6 flex flex-col items-center gap-3"><Loader2 className="h-8 w-8 animate-spin" /><p className="text-sm">{loadingMsg}</p></Card></div>}
      </div>
    </div>
  );
}
