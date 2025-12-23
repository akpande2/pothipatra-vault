import { FileText, Calendar, User, Eye, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChatDocumentCardProps {
  documentType: string;
  personName: string;
  expiryDate?: string;
  onView?: () => void;
}

export function ChatDocumentCard({ 
  documentType, 
  personName, 
  expiryDate,
  onView 
}: ChatDocumentCardProps) {
  // Check expiry status
  const getExpiryStatus = () => {
    if (!expiryDate) return null;
    
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 90) return 'expiring';
    return 'valid';
  };

  const expiryStatus = getExpiryStatus();

  return (
    <Card className={cn(
      "mt-3 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden max-w-sm",
      expiryStatus === 'expiring' && "bg-amber-500/5 border-amber-500/20",
      expiryStatus === 'expired' && "bg-destructive/5 border-destructive/20"
    )}>
      <CardContent className="p-4">
        {/* Document Type Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground">{documentType}</span>
          </div>
          {expiryStatus === 'expiring' && (
            <Badge 
              variant="outline"
              className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1"
            >
              <Clock className="w-3 h-3" />
              Expiring Soon
            </Badge>
          )}
          {expiryStatus === 'expired' && (
            <Badge 
              variant="outline"
              className="text-xs bg-destructive/10 text-destructive border-destructive/30"
            >
              Expired
            </Badge>
          )}
          {expiryStatus === 'valid' && (
            <Badge 
              variant="secondary"
              className="text-xs"
            >
              Valid
            </Badge>
          )}
        </div>

        {/* Document Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span>{personName}</span>
          </div>
          
          {expiryDate && (
            <div className={cn(
              "flex items-center gap-2 text-sm",
              expiryStatus === 'expiring' ? "text-amber-600" : 
              expiryStatus === 'expired' ? "text-destructive" : "text-muted-foreground"
            )}>
              <Calendar className="h-3.5 w-3.5" />
              <span>Expires: {new Date(expiryDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}</span>
            </div>
          )}
        </div>

        {/* View Button */}
        <Button 
          onClick={onView}
          variant="outline" 
          size="sm" 
          className="w-full gap-2"
        >
          <Eye className="h-4 w-4" />
          View Document
        </Button>
      </CardContent>
    </Card>
  );
}
