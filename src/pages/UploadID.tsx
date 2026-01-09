import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useStore } from '@/hooks/useStore';
import { AppLayout } from '@/components/AppLayout';

export default function UploadID() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addDocument } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  
  const isAndroid = typeof window !== 'undefined' && !!window.Android;

  const handleSource = (src: string) => {
    if (isAndroid && window.Android) {
      setIsLoading(true);
      setLoadingMsg(src === 'camera' ? 'Opening camera...' : 'Processing...');
      
      // Just call Android methods - DocumentApprovalModal handles the response
      if (src === 'camera') window.Android.openScanner();
      else if (src === 'gallery') window.Android.openGallery();
      else window.Android.openFilePicker();
      
      // Stop loading after a short delay (modal will handle the rest)
      setTimeout(() => setIsLoading(false), 2000);
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
      navigate('/documents');
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
        
        {/* NO MODAL HERE - It's in App.tsx */}
      </div>
    </AppLayout>
  );
}
