import { useState } from 'react';
import { Document, DOCUMENT_TYPES } from '@/types/document';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { Download, Pencil, Trash2, X, Check } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface DocumentDetailSheetProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRename?: (id: string, newName: string) => void;
  onDelete?: (id: string) => void;
}

export function DocumentDetailSheet({ 
  document, 
  open, 
  onOpenChange,
  onRename,
  onDelete 
}: DocumentDetailSheetProps) {
  const { t, language } = useLanguage();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!document) return null;

  const docType = DOCUMENT_TYPES[document.type];

  const getDocLabel = () => {
    return language === 'hi' ? docType.labelHi : docType.label;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch {
      return '';
    }
  };

  const handleStartRename = () => {
    setNewName(document.name || getDocLabel());
    setIsRenaming(true);
  };

  const handleConfirmRename = () => {
    if (newName.trim() && onRename) {
      onRename(document.id, newName.trim());
    }
    setIsRenaming(false);
  };

  const handleCancelRename = () => {
    setIsRenaming(false);
    setNewName('');
  };

  const handleDownload = () => {
    // Download the front image if available
    const imageUrl = document.frontImage || document.backImage;
    if (imageUrl) {
      const link = window.document.createElement('a');
      link.href = imageUrl;
      link.download = `${document.name || getDocLabel()}.jpg`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(document.id);
    }
    setShowDeleteConfirm(false);
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] rounded-t-3xl p-0 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-border bg-background">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{docType.icon}</span>
                {isRenaming ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="h-8 text-base font-medium w-40"
                      autoFocus
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleConfirmRename}>
                      <Check className="h-4 w-4 text-primary" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelRename}>
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-base font-semibold text-foreground">
                    {document.name || getDocLabel()}
                  </span>
                )}
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 -mr-2"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground pl-7">
              {document.holderName}
              {formatDate(document.createdAt) && (
                <span className="text-muted-foreground/60"> • {formatDate(document.createdAt)}</span>
              )}
            </p>
          </div>

          {/* Document Preview */}
          <div className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center p-4">
            {document.frontImage ? (
              <img
                src={document.frontImage}
                alt={getDocLabel()}
                className="max-w-full max-h-full object-contain rounded-xl shadow-lg"
              />
            ) : (
              <div className={cn(
                'w-full max-w-sm aspect-[1.6/1] rounded-2xl p-6 flex flex-col justify-between',
                'text-primary-foreground shadow-elevated',
                docType.color
              )}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{docType.icon}</span>
                  <span className="font-medium opacity-90">{getDocLabel()}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-wider mb-1">
                    {document.number || '•••• •••• ••••'}
                  </p>
                  <p className="text-base opacity-85">{document.holderName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Back Image if available */}
          {document.backImage && (
            <div className="px-4 py-3 bg-muted/30 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">
                {language === 'hi' ? 'पीछे का हिस्सा' : 'Back Side'}
              </p>
              <img
                src={document.backImage}
                alt="Back side"
                className="w-full max-h-32 object-contain rounded-lg"
              />
            </div>
          )}

          {/* Actions */}
          <div className="p-4 border-t border-border bg-background">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 gap-2 rounded-xl"
                onClick={handleDownload}
                disabled={!document.frontImage && !document.backImage}
              >
                <Download className="h-4 w-4" />
                {language === 'hi' ? 'डाउनलोड' : 'Download'}
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12 gap-2 rounded-xl"
                onClick={handleStartRename}
              >
                <Pencil className="h-4 w-4" />
                {language === 'hi' ? 'नाम बदलें' : 'Rename'}
              </Button>
              <Button
                variant="outline"
                className="h-12 w-12 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="rounded-2xl max-w-[320px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">
              {language === 'hi' ? 'दस्तावेज़ हटाएं?' : 'Delete Document?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              {language === 'hi' 
                ? 'यह क्रिया पूर्ववत नहीं की जा सकती।'
                : 'This action cannot be undone.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="flex-1 rounded-xl">{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="flex-1 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
