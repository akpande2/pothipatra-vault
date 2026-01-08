import { 
  CreditCard, 
  FileText, 
  Car, 
  Vote, 
  BookOpen,
  Cake,
  User,
  Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatDocumentCardProps {
  id?: string;
  documentType: string;
  personName: string;
  idNumber?: string;
  dob?: string;
  expiryDate?: string;
  onClick?: () => void;
}

// Get icon and color based on document type
function getDocumentStyle(type: string): { 
  icon: React.ElementType; 
  bgColor: string; 
  iconColor: string;
  borderColor: string;
} {
  const t = type.toLowerCase();
  
  if (t.includes('aadhaar')) {
    return { 
      icon: CreditCard, 
      bgColor: 'bg-orange-500/10', 
      iconColor: 'text-orange-500',
      borderColor: 'border-orange-500/20'
    };
  }
  if (t.includes('pan')) {
    return { 
      icon: CreditCard, 
      bgColor: 'bg-blue-500/10', 
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-500/20'
    };
  }
  if (t.includes('voter')) {
    return { 
      icon: Vote, 
      bgColor: 'bg-purple-500/10', 
      iconColor: 'text-purple-500',
      borderColor: 'border-purple-500/20'
    };
  }
  if (t.includes('driv') || t.includes('license') || t.includes('licence')) {
    return { 
      icon: Car, 
      bgColor: 'bg-green-500/10', 
      iconColor: 'text-green-500',
      borderColor: 'border-green-500/20'
    };
  }
  if (t.includes('passport')) {
    return { 
      icon: BookOpen, 
      bgColor: 'bg-red-500/10', 
      iconColor: 'text-red-500',
      borderColor: 'border-red-500/20'
    };
  }
  if (t.includes('ration')) {
    return { 
      icon: FileText, 
      bgColor: 'bg-amber-500/10', 
      iconColor: 'text-amber-500',
      borderColor: 'border-amber-500/20'
    };
  }
  // Default
  return { 
    icon: FileText, 
    bgColor: 'bg-muted', 
    iconColor: 'text-muted-foreground',
    borderColor: 'border-border'
  };
}

// Mask ID number to show only last 4 digits
function maskIdNumber(idNumber?: string): string {
  if (!idNumber || idNumber.length < 4) return '';
  return '•••• ' + idNumber.slice(-4);
}

// Format DOB
function formatDob(dob?: string): string {
  if (!dob) return '';
  try {
    return new Date(dob).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dob;
  }
}

export function ChatDocumentCard({ 
  documentType, 
  personName, 
  idNumber,
  dob,
  onClick 
}: ChatDocumentCardProps) {
  const { icon: Icon, bgColor, iconColor, borderColor } = getDocumentStyle(documentType);
  const maskedId = maskIdNumber(idNumber);
  const formattedDob = formatDob(dob);

  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl border cursor-pointer",
        "bg-card/80 hover:bg-card hover:shadow-sm",
        "transition-all duration-200 active:scale-[0.98]",
        borderColor
      )}
    >
      {/* Document Icon */}
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
        bgColor
      )}>
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>

      {/* Document Info */}
      <div className="flex-1 min-w-0">
        {/* Document Type */}
        <p className="font-medium text-sm text-foreground truncate">
          {documentType}
        </p>
        
        {/* Person Name */}
        {personName && (
          <div className="flex items-center gap-1.5 mt-1">
            <User className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {personName}
            </span>
          </div>
        )}
        
        {/* ID Number (masked) */}
        {maskedId && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <Hash className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground font-mono">
              {maskedId}
            </span>
          </div>
        )}

        {/* DOB */}
        {formattedDob && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <Cake className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground">
              {formattedDob}
            </span>
          </div>
        )}
      </div>

      {/* Chevron */}
      <div className="text-muted-foreground/50 shrink-0 self-center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9,18 15,12 9,6" />
        </svg>
      </div>
    </div>
  );
}
