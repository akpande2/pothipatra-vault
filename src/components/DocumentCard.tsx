import { Document, DOCUMENT_TYPES, KnownPerson, RELATIONS } from '@/types/document';
import { cn } from '@/lib/utils';
import { MoreVertical, Eye, Calendar, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/hooks/useLanguage';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface DocumentCardProps {
  document: Document;
  onView: (document: Document) => void;
  onEdit: (document: Document) => void;
  onDelete: (document: Document) => void;
  knownPerson?: KnownPerson;
}

export function DocumentCard({ document, onView, onEdit, onDelete, knownPerson }: DocumentCardProps) {
  const { t, language } = useLanguage();
  const docType = DOCUMENT_TYPES[document.type];

  const getDocLabel = () => {
    return language === 'hi' ? docType.labelHi : docType.label;
  };

  const getRelationLabel = () => {
    if (!knownPerson) return null;
    const relation = RELATIONS.find(r => r.value === knownPerson.relation);
    return relation ? (language === 'hi' ? relation.labelHi : relation.label) : null;
  };

  const formatUploadDate = () => {
    try {
      const date = new Date(document.createdAt);
      return format(date, 'dd MMM yyyy');
    } catch {
      return '';
    }
  };

  // Check if document is expiring soon (within 90 days) or expired
  const getExpiryStatus = () => {
    if (!document.expiryDate) return null;
    
    const expiry = new Date(document.expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 90) return 'expiring';
    return null;
  };

  const expiryStatus = getExpiryStatus();
  const relationLabel = getRelationLabel();

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl bg-background border border-border',
        'hover:border-primary/30 hover:bg-muted/30 transition-colors cursor-pointer',
        expiryStatus === 'expiring' && 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40',
        expiryStatus === 'expired' && 'bg-destructive/5 border-destructive/20 hover:border-destructive/40'
      )}
      onClick={() => onView(document)}
      role="button"
      tabIndex={0}
      aria-label={`${t.viewDetails} ${getDocLabel()}`}
    >
      {/* Icon */}
      <div className={cn(
        'w-11 h-11 rounded-lg flex items-center justify-center shrink-0',
        'bg-primary/10'
      )}>
        <span className="text-xl">{docType.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-foreground text-sm truncate">
            {getDocLabel()}
          </p>
          {relationLabel && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">
              {relationLabel}
            </span>
          )}
          {expiryStatus === 'expiring' && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1">
              <Clock className="w-3 h-3" />
              Expiring Soon
            </Badge>
          )}
          {expiryStatus === 'expired' && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-destructive/10 text-destructive border-destructive/30">
              Expired
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {document.holderName}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <Calendar className="w-3 h-3 text-muted-foreground/60" />
          <span className="text-xs text-muted-foreground/60">
            {formatUploadDate()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger
          onClick={(e) => e.stopPropagation()}
          className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0"
          aria-label="More options"
        >
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover border border-border z-50">
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
  );
}
