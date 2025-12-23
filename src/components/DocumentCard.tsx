import { Document, DOCUMENT_TYPES } from '@/types/document';
import { cn } from '@/lib/utils';
import { Eye, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DocumentCardProps {
  document: Document;
  onView: (document: Document) => void;
  onEdit: (document: Document) => void;
  onDelete: (document: Document) => void;
}

export function DocumentCard({ document, onView, onEdit, onDelete }: DocumentCardProps) {
  const docType = DOCUMENT_TYPES[document.type];

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
      aria-label={`View ${docType.label}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{docType.icon}</span>
          <div>
            <span className="text-sm font-medium opacity-95">{docType.label}</span>
            <p className="text-xs opacity-70">{docType.labelHi}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-full hover:bg-primary-foreground/20 transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(document); }}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(document); }}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => { e.stopPropagation(); onDelete(document); }}
              className="text-destructive focus:text-destructive"
            >
              Delete
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
