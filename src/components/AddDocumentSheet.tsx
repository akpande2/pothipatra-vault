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
import { ChevronRight, Camera, X } from 'lucide-react';
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
        title: 'Missing information',
        description: 'Please fill in all required fields',
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
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-left">
            {step === 'type' ? 'Select Document Type' : `Add ${selectedType ? DOCUMENT_TYPES[selectedType].label : ''}`}
          </SheetTitle>
        </SheetHeader>

        {step === 'type' ? (
          <div className="grid grid-cols-2 gap-3 stagger-children">
            {(Object.entries(DOCUMENT_TYPES) as [DocumentType, typeof DOCUMENT_TYPES[DocumentType]][]).map(
              ([type, info]) => (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl border border-border',
                    'hover:border-accent hover:bg-accent/5 transition-all duration-200',
                    'text-left group'
                  )}
                >
                  <span className="text-2xl">{info.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{info.label}</p>
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
              <Label htmlFor="number">Document Number *</Label>
              <Input
                id="number"
                placeholder="Enter document number"
                value={formData.number}
                onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
              />
            </div>

            {/* Holder Name */}
            <div className="space-y-2">
              <Label htmlFor="holderName">Name on Document *</Label>
              <Input
                id="holderName"
                placeholder="Enter name as on document"
                value={formData.holderName}
                onChange={(e) => setFormData(prev => ({ ...prev, holderName: e.target.value }))}
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
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
              <Label>Document Images (Optional)</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleImageUpload('frontImage')}
                  className={cn(
                    'aspect-[3/2] rounded-xl border-2 border-dashed border-border',
                    'flex flex-col items-center justify-center gap-2',
                    'hover:border-accent hover:bg-accent/5 transition-all',
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
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Front</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleImageUpload('backImage')}
                  className={cn(
                    'aspect-[3/2] rounded-xl border-2 border-dashed border-border',
                    'flex flex-col items-center justify-center gap-2',
                    'hover:border-accent hover:bg-accent/5 transition-all',
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
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Back</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep('type')}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleSubmit}>
                Save Document
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
