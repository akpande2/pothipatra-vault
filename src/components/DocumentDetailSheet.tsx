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
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl overflow-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-left flex items-center gap-2">
            <span className="text-2xl">{docType.icon}</span>
            {docType.label}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 animate-fade-in">
          {/* Card Preview */}
          <div
            className={cn(
              'rounded-2xl p-6 text-white shadow-card',
              docType.color
            )}
          >
            <p className="text-2xl font-semibold tracking-wider mb-2">
              {document.number}
            </p>
            <p className="text-lg opacity-90">{document.holderName}</p>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Details</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <Hash className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Document Number</p>
                  <p className="font-medium">{document.number}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Name on Document</p>
                  <p className="font-medium">{document.holderName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Issue Date</p>
                    <p className="font-medium text-sm">{formatDate(document.issueDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Expiry Date</p>
                    <p className="font-medium text-sm">{formatDate(document.expiryDate)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          {(document.frontImage || document.backImage) && (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <FileImage className="w-5 h-5" />
                Document Images
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {document.frontImage && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Front</p>
                    <img
                      src={document.frontImage}
                      alt="Front"
                      className="w-full aspect-[3/2] object-cover rounded-xl border border-border"
                    />
                  </div>
                )}
                {document.backImage && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Back</p>
                    <img
                      src={document.backImage}
                      alt="Back"
                      className="w-full aspect-[3/2] object-cover rounded-xl border border-border"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Added on {formatDate(document.createdAt)}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
