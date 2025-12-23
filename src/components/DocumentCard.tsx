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
        'relative rounded-2xl p-5 text-white shadow-card transition-all duration-300',
        'hover:shadow-elevated hover:scale-[1.02] cursor-pointer',
        'min-h-[140px] flex flex-col justify-between',
        docType.color
      )}
      onClick={() => onView(document)}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{docType.icon}</span>
          <span className="text-sm font-medium opacity-90">{docType.label}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
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
      <div className="mt-4">
        <p className="text-lg font-semibold tracking-wide">
          {document.number}
        </p>
        <p className="text-sm opacity-80 mt-1">{document.holderName}</p>
      </div>

      {/* Decorative pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
        <svg viewBox="0 0 100 100" fill="currentColor">
          <circle cx="80" cy="20" r="40" />
          <circle cx="90" cy="60" r="20" />
        </svg>
      </div>
    </div>
  );
}
