import { Document, DOCUMENT_TYPES } from '@/types/document';
import { cn } from '@/lib/utils';
import { Eye, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/hooks/useLanguage';

interface DocumentCardProps {
  document: Document;
  onView: (document: Document) => void;
  onEdit: (document: Document) => void;
  onDelete: (document: Document) => void;
}

export function DocumentCard({ document, onView, onEdit, onDelete }: DocumentCardProps) {
  const { t, language } = useLanguage();
  const docType = DOCUMENT_TYPES[document.type];

  const getDocLabel = () => {
    const labels: Record<string, string> = {
      aadhaar: t.aadhaarCard,
      pan: t.panCard,
      passport: t.passport,
      driving: t.drivingLicence,
      voter: t.voterId,
      ration: t.rationCard,
      other: t.otherDocument,
    };
    return labels[document.type] || docType.label;
  };

  return (
    <div
      className={cn(
        'relative rounded-xl p-5 text-primary-foreground shadow-card transition-all duration-200',
        'hover:shadow-elevated cursor-pointer',
        'min-h-[130px] flex flex-col justify-between',
        docType.color
      )}
      onClick={() => onView(document)}
      role="button"
      tabIndex={0}
      aria-label={`${t.viewDetails} ${getDocLabel()}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{docType.icon}</span>
          <span className="text-sm font-medium opacity-95">{getDocLabel()}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-full hover:bg-primary-foreground/20 transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(document); }}>
              <Eye className="w-4 h-4 mr-2" />
              {t.viewDetails}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(document); }}>
              {t.edit}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onDelete(document); }}
              className="text-destructive focus:text-destructive"
            >
              {t.delete}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="mt-3">
        <p className="text-lg font-semibold tracking-wide">
          {document.number}
        </p>
        <p className="text-sm opacity-85 mt-0.5">{document.holderName}</p>
      </div>
    </div>
  );
}
