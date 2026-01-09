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
// 1. ADD THIS IMPORT
import { DocumentApprovalModal } from '@/components/DocumentApprovalModal';

function mapDocType(type?: string): DocumentType {
  const t = type?.toUpperCase();
  if (t === 'AADHAAR') return 'aadhaar';
  if (t === 'PAN') return 'pan';
  if (t === 'VOTER_ID' || t === 'VOTER') return 'voter';
  if (t === 'PASSPORT') return 'passport';
  if (t === 'DRIVING_LICENSE' || t === 'DRIVING' || t === 'DL') return 'driving';
  if (t === 'RATION_CARD' || t === 'RATION') return 'ration';
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
  
  // 2. ADD THIS STATE
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  
  const isAndroid = typeof window !== 'undefined' && !!window.Android;

  useEffect(() => {
    console.log('[UploadID] Setting up bridge callbacks');
    
    // Existing scan complete logic
    window.onScanComplete = (result: ScanResult) => {
      setIsLoading(false);
      if (result.cancelled) return;
      if (!result.success) {
        toast.error(result.error || 'Failed');
        return;
      }

      const rawType = result.doc_type || result.extraction?.doc_type || 'other';
      const docType = mapDocType(rawType);
      const idNumber = result.id_number || result.extraction?.id_number || '';
      const imageBase64 = result.image_base64 || '';
      let holderName = result.name || result.extraction?.name || '';
      if (holderName === 'NOT_FOUND' || holderName === 'not_found') holderName = '';

      const firstName = holderName?.split(' ')[0] || '';
      const docLabel = getDocLabel(docType, rawType);
      const docName = firstName ? `${firstName}_${docLabel}` : docLabel;

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

    // 3. ADD THESE NEW CALLBACKS
    window.onDocumentPreview = () => {
      setIsLoading(false); // Stop any loading spinners
      setIsApprovalOpen(true);
    };

    window.onProcessingError = (error: any) => {
      setIsLoading(false);
      console.error('Processing error:', error);
      toast.error(typeof error === 'string' ? error : 'AI Processing failed');
    };

    return () => { 
      console.log('[UploadID] Cleaning up bridge callbacks');
      window.onScanComplete = undefined; 
      window.onDocumentPreview = undefined;
      window.onProcessingError = undefined;
    };
  }, [navigate, addDocument]);

  const handleSource = (src: string) => {
    if (isAndroid && window.Android) {
      setIsLoading(true);
      setLoadingMsg(src === 'camera' ? 'Opening camera...' : 'Processing...');
      if (src === 'camera') window.Android.openScanner();
      else if (src === 'gallery') window.Android.openGallery();
      else window.Android.openFilePicker();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    setLoadingMsg('Processing...');
    const reader = new FileReader();
    reader.onload = () => {
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
        <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-center px-4">
          <h1 className="text-lg font-semibold text-foreground">Upload Document</h1>
        </header>

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

        {/* 4. ADD THE MODAL COMPONENT HERE */}
        <DocumentApprovalModal 
          isOpen={isApprovalOpen} 
          onClose={() => setIsApprovalOpen(false)} 
        />
      </div>
    </AppLayout>
  );
}
