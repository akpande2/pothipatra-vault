import { useState } from 'react';
import { DocumentType, DOCUMENT_TYPES } from '@/types/document';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronRight, Camera, X, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddDocumentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    type: DocumentType;
    name: string;
    number: string;
    holderName: string;
    expiryDate?: string;
    issueDate?: string;
    frontImage?: string;
    backImage?: string;
  }) => void;
}

export function AddDocumentSheet({ open, onOpenChange, onSubmit }: AddDocumentSheetProps) {
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    holderName: '',
    expiryDate: '',
    issueDate: '',
    frontImage: '',
    backImage: '',
  });
  const { toast } = useToast();

  const handleTypeSelect = (type: DocumentType) => {
    setSelectedType(type);
    setFormData(prev => ({
      ...prev,
      name: DOCUMENT_TYPES[type].label,
    }));
    setStep('details');
  };

  const handleSubmit = () => {
    if (!selectedType || !formData.number || !formData.holderName) {
      toast({
        title: 'जानकारी अधूरी है',
        description: 'कृपया सभी आवश्यक जानकारी भरें',
        variant: 'destructive',
      });
      return;
    }

    onSubmit({
      type: selectedType,
      ...formData,
    });

    // Reset form
    setStep('type');
    setSelectedType(null);
    setFormData({
      name: '',
      number: '',
      holderName: '',
      expiryDate: '',
      issueDate: '',
      frontImage: '',
      backImage: '',
    });
    onOpenChange(false);
  };

  const handleClose = () => {
    setStep('type');
    setSelectedType(null);
    setFormData({
      name: '',
      number: '',
      holderName: '',
      expiryDate: '',
      issueDate: '',
      frontImage: '',
      backImage: '',
    });
    onOpenChange(false);
  };

  const handleImageUpload = (field: 'frontImage' | 'backImage') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setFormData(prev => ({
            ...prev,
            [field]: reader.result as string,
          }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-left text-base">
            {step === 'type' ? 'दस्तावेज़ का प्रकार चुनें' : `${selectedType ? DOCUMENT_TYPES[selectedType].labelHi : ''} जोड़ें`}
          </SheetTitle>
        </SheetHeader>

        {step === 'type' ? (
          <div className="grid grid-cols-1 gap-2 stagger-children">
            {(Object.entries(DOCUMENT_TYPES) as [DocumentType, typeof DOCUMENT_TYPES[DocumentType]][]).map(
              ([type, info]) => (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl border border-border',
                    'hover:border-accent/50 hover:bg-accent/5 transition-all duration-200',
                    'text-left group'
                  )}
                >
                  <span className="text-2xl">{info.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{info.label}</p>
                    <p className="text-xs text-muted-foreground">{info.labelHi}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                </button>
              )
            )}
          </div>
        ) : (
          <div className="space-y-5 animate-fade-in">
            {/* Document Number */}
            <div className="space-y-2">
              <Label htmlFor="number">दस्तावेज़ संख्या *</Label>
              <Input
                id="number"
                placeholder="दस्तावेज़ नंबर दर्ज करें"
                value={formData.number}
                onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
              />
            </div>

            {/* Holder Name */}
            <div className="space-y-2">
              <Label htmlFor="holderName">दस्तावेज़ पर नाम *</Label>
              <Input
                id="holderName"
                placeholder="जैसा दस्तावेज़ पर लिखा है"
                value={formData.holderName}
                onChange={(e) => setFormData(prev => ({ ...prev, holderName: e.target.value }))}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="issueDate">जारी करने की तिथि</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">समाप्ति तिथि</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Image Uploads */}
            <div className="space-y-2">
              <Label>दस्तावेज़ की फोटो (वैकल्पिक)</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleImageUpload('frontImage')}
                  className={cn(
                    'aspect-[3/2] rounded-xl border-2 border-dashed border-border',
                    'flex flex-col items-center justify-center gap-1.5',
                    'hover:border-accent/50 hover:bg-accent/5 transition-all',
                    'relative overflow-hidden'
                  )}
                >
                  {formData.frontImage ? (
                    <>
                      <img
                        src={formData.frontImage}
                        alt="Front"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, frontImage: '' }));
                        }}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                        aria-label="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">सामने</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleImageUpload('backImage')}
                  className={cn(
                    'aspect-[3/2] rounded-xl border-2 border-dashed border-border',
                    'flex flex-col items-center justify-center gap-1.5',
                    'hover:border-accent/50 hover:bg-accent/5 transition-all',
                    'relative overflow-hidden'
                  )}
                >
                  {formData.backImage ? (
                    <>
                      <img
                        src={formData.backImage}
                        alt="Back"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, backImage: '' }));
                        }}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                        aria-label="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">पीछे</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep('type')}>
                <ArrowLeft className="w-4 h-4" />
                वापस
              </Button>
              <Button className="flex-1" onClick={handleSubmit}>
                सहेजें
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
