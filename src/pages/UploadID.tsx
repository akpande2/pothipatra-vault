import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useStore } from '@/hooks/useStore';
import { DocumentType } from '@/types/document';
import { ScanResult } from '@/hooks/useAndroidBridge';
import { AppLayout } from '@/components/AppLayout';

function mapDocType(type?: string): DocumentType {
  const t = type?.toUpperCase();
  console.log('[UploadID] mapDocType input:', type, '-> upper:', t);
  if (t === 'AADHAAR') return 'aadhaar';
  if (t === 'PAN') return 'pan';
  if (t === 'VOTER_ID' || t === 'VOTER') return 'voter';
  if (t === 'PASSPORT') return 'passport';
  if (t === 'DRIVING_LICENSE' || t === 'DRIVING' || t === 'DL') return 'driving';
  if (t === 'RATION_CARD' || t === 'RATION') return 'ration';
  if (t === 'BIRTH_CERTIFICATE') return 'other';
  return 'other';
}

function getDocLabel(type: DocumentType, rawType?: string): string {
  if (rawType?.toUpperCase() === 'BIRTH_CERTIFICATE') return 'BirthCert';
  
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

      const rawType = result.doc_type || result.extraction?.doc_type || 'other';
      const docType = mapDocType(rawType);
      const idNumber = result.id_number || result.extraction?.id_number || '';
      const imageBase64 = result.image_base64 || '';
      
      let holderName = result.name || result.extraction?.name || '';
      if (holderName === 'NOT_FOUND' || holderName === 'not_found') {
        holderName = '';
      }

      console.log('[UploadID] Extracted:', { rawType, docType, idNumber, holderName, hasImage: !!imageBase64 });

      const firstName = holderName?.split(' ')[0] || '';
      const docLabel = getDocLabel(docType, rawType);
      const docName = firstName ? `${firstName}_${docLabel}` : docLabel;

      console.log('[UploadID] Saving document:', { docName, docType, idNumber });

      addDocument({
        type: docType,
        name: docName,
        number: idNumber,
        holderName: holderName,
        frontImage: imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : undefined,
      });

      toast.success(`${docLabel} saved!`);
      navigate('/id-cards');
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
      navigate('/id-cards');
    };
    reader.readAsDataURL(file);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-center px-4">
          <h1 className="text-lg font-semibold text-foreground">Upload Document</h1>
        </header>

        {/* Upload Options */}
        <div className="flex-1 p-4 space-y-3">
          <Button 
            variant="outline" 
            className="w-full h-16 gap-3 justify-start px-4" 
            onClick={() => handleSource('camera')} 
            disabled={isLoading}
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium">Scan with Camera</p>
              <p className="text-xs text-muted-foreground">Take a photo of your document</p>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="w-full h-16 gap-3 justify-start px-4" 
            onClick={() => handleSource('gallery')} 
            disabled={isLoading}
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Image className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium">Gallery</p>
              <p className="text-xs text-muted-foreground">Choose from your photos</p>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="w-full h-16 gap-3 justify-start px-4" 
            onClick={() => handleSource('files')} 
            disabled={isLoading}
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium">Files</p>
              <p className="text-xs text-muted-foreground">Browse documents and PDFs</p>
            </div>
          </Button>

          <input 
            ref={fileInputRef} 
            type="file" 
            accept="image/*,application/pdf" 
            className="hidden" 
            onChange={handleFile} 
          />
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">{loadingMsg}</p>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
