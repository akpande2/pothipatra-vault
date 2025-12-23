import { Document, DOCUMENT_TYPES } from '@/types/document';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { format } from 'date-fns';
import { Calendar, Hash, User, FileImage } from 'lucide-react';

interface DocumentDetailSheetProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentDetailSheet({ document, open, onOpenChange }: DocumentDetailSheetProps) {
  if (!document) return null;

  const docType = DOCUMENT_TYPES[document.type];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl overflow-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-left flex items-center gap-2 text-base">
            <span className="text-xl">{docType.icon}</span>
            <div>
              <span>{docType.label}</span>
              <p className="text-xs text-muted-foreground font-normal">{docType.labelHi}</p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5 animate-fade-in">
          {/* Card Preview */}
          <div
            className={cn(
              'rounded-xl p-5 text-primary-foreground shadow-card',
              docType.color
            )}
          >
            <p className="text-xl font-semibold tracking-wider mb-1">
              {document.number}
            </p>
            <p className="text-base opacity-90">{document.holderName}</p>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <h3 className="font-medium text-foreground text-sm">विवरण</h3>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">दस्तावेज़ संख्या</p>
                  <p className="font-medium text-sm">{document.number}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">दस्तावेज़ पर नाम</p>
                  <p className="font-medium text-sm">{document.holderName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">जारी तिथि</p>
                    <p className="font-medium text-xs">{formatDate(document.issueDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">समाप्ति तिथि</p>
                    <p className="font-medium text-xs">{formatDate(document.expiryDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          {(document.frontImage || document.backImage) && (
            <div className="space-y-3">
              <h3 className="font-medium text-foreground text-sm flex items-center gap-2">
                <FileImage className="w-4 h-4" />
                दस्तावेज़ की फोटो
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {document.frontImage && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">सामने</p>
                    <img
                      src={document.frontImage}
                      alt="Front"
                      className="w-full aspect-[3/2] object-cover rounded-lg border border-border"
                    />
                  </div>
                )}
                {document.backImage && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">पीछे</p>
                    <img
                      src={document.backImage}
                      alt="Back"
                      className="w-full aspect-[3/2] object-cover rounded-lg border border-border"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {formatDate(document.createdAt)} को जोड़ा गया
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
