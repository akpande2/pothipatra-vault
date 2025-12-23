import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { AppLayout } from '@/components/AppLayout';
import { Camera, Image, FileText, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type UploadStep = 'source' | 'preview';

export default function UploadID() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState<UploadStep>('source');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleSourceSelect = (source: 'camera' | 'gallery' | 'files') => {
    if (source === 'camera') {
      cameraInputRef.current?.click();
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
        setStep('preview');
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleCancel = () => {
    setCapturedImage(null);
    setStep('source');
  };

  const handleSaveDocument = () => {
    // Navigate to dashboard with the image data
    // In a real app, we'd pass this through state management
    navigate('/dashboard', { 
      state: { 
        newDocument: true, 
        imageData: capturedImage 
      } 
    });
  };

  const sources = [
    { 
      id: 'camera' as const, 
      icon: Camera, 
      label: language === 'hi' ? 'कैमरा' : 'Camera',
      description: language === 'hi' ? 'फोटो लें' : 'Take a photo'
    },
    { 
      id: 'gallery' as const, 
      icon: Image, 
      label: language === 'hi' ? 'गैलरी' : 'Gallery',
      description: language === 'hi' ? 'गैलरी से चुनें' : 'Choose from gallery'
    },
    { 
      id: 'files' as const, 
      icon: FileText, 
      label: language === 'hi' ? 'फाइल्स' : 'Files',
      description: language === 'hi' ? 'फाइल से चुनें' : 'Choose from files'
    },
  ];

  return (
    <AppLayout>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {step === 'source' ? (
        <div className="flex flex-col h-full p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-foreground mb-2">
              {t.addDocument}
            </h1>
            <p className="text-muted-foreground text-base">
              {language === 'hi' 
                ? 'अपना दस्तावेज़ कैसे अपलोड करना चाहते हैं?'
                : 'How would you like to upload your document?'
              }
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
                    'flex items-center gap-4 p-5 rounded-2xl border border-border',
                    'bg-card hover:bg-muted/50 hover:border-primary/30',
                    'transition-all duration-200 text-left group'
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
          <div className="p-6 border-t border-border bg-background">
            <p className="text-center text-muted-foreground text-base mb-6">
              {language === 'hi' 
                ? 'यह वह दस्तावेज़ है जो PothiPatra में सहेजा जाएगा'
                : 'This is the version that will be saved in PothiPatra'
              }
            </p>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 h-14 gap-2 text-base rounded-xl"
                onClick={handleCancel}
              >
                <X className="w-5 h-5" />
                {t.cancel}
              </Button>
              <Button 
                className="flex-1 h-14 gap-2 text-base rounded-xl"
                onClick={handleSaveDocument}
              >
                <Check className="w-5 h-5" />
                {language === 'hi' ? 'दस्तावेज़ सहेजें' : 'Save Document'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
