import { useState } from 'react';
import { DocumentType, DOCUMENT_TYPES, RelationType } from '@/types/document';
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
import { useLanguage } from '@/hooks/useLanguage';
import { NewPersonDialog } from './NewPersonDialog';

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
  isPersonKnown: (name: string) => boolean;
  onNewPerson: (name: string, relation: RelationType) => void;
}

export function AddDocumentSheet({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isPersonKnown, 
  onNewPerson 
}: AddDocumentSheetProps) {
  const { t } = useLanguage();
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
  const [showNewPersonDialog, setShowNewPersonDialog] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const { toast } = useToast();

  const getDocLabel = (type: DocumentType) => {
    const labels: Record<DocumentType, string> = {
      aadhaar: t.aadhaarCard,
      pan: t.panCard,
      passport: t.passport,
      driving: t.drivingLicence,
      voter: t.voterId,
      ration: t.rationCard,
      other: t.otherDocument,
    };
    return labels[type];
  };

  const handleTypeSelect = (type: DocumentType) => {
    setSelectedType(type);
    setFormData(prev => ({
      ...prev,
      name: DOCUMENT_TYPES[type].label,
    }));
    setStep('details');
  };

  const completeSubmit = () => {
    if (!selectedType) return;

    onSubmit({
      type: selectedType,
      ...formData,
    });

    // Reset form
    resetForm();
  };

  const handleSubmit = () => {
    if (!selectedType || !formData.number || !formData.holderName) {
      toast({
        title: t.incompleteInfo,
        description: t.fillRequiredFields,
        variant: 'destructive',
      });
      return;
    }

    // Check if this person is known
    if (!isPersonKnown(formData.holderName)) {
      setPendingSubmit(true);
      setShowNewPersonDialog(true);
    } else {
      completeSubmit();
    }
  };

  const handleNewPersonConfirm = (relation: RelationType) => {
    onNewPerson(formData.holderName, relation);
    setShowNewPersonDialog(false);
    
    if (pendingSubmit) {
      completeSubmit();
      setPendingSubmit(false);
    }
  };

  const resetForm = () => {
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
    resetForm();
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
    <>
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-left text-base">
              {step === 'type' ? t.selectDocumentType : `${selectedType ? getDocLabel(selectedType) : ''} ${t.add}`}
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
                      <p className="font-medium text-sm">{getDocLabel(type)}</p>
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
                <Label htmlFor="number">{t.documentNumber} *</Label>
                <Input
                  id="number"
                  placeholder={t.enterDocumentNumber}
                  value={formData.number}
                  onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                />
              </div>

              {/* Holder Name */}
              <div className="space-y-2">
                <Label htmlFor="holderName">{t.nameOnDocument} *</Label>
                <Input
                  id="holderName"
                  placeholder={t.enterNameAsOnDocument}
                  value={formData.holderName}
                  onChange={(e) => setFormData(prev => ({ ...prev, holderName: e.target.value }))}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">{t.issueDate}</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">{t.expiryDate}</Label>
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
                <Label>{t.documentImages} ({t.optional})</Label>
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
                        <span className="text-xs text-muted-foreground">{t.front}</span>
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
                        <span className="text-xs text-muted-foreground">{t.backSide}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep('type')}>
                  <ArrowLeft className="w-4 h-4" />
                  {t.goBack}
                </Button>
                <Button className="flex-1" onClick={handleSubmit}>
                  {t.save}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <NewPersonDialog
        open={showNewPersonDialog}
        onOpenChange={(open) => {
          setShowNewPersonDialog(open);
          if (!open) {
            setPendingSubmit(false);
          }
        }}
        personName={formData.holderName}
        onConfirm={handleNewPersonConfirm}
      />
    </>
  );
}
