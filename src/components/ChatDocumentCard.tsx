import { FileText, Calendar, User, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  const isExpired = expiryDate ? new Date(expiryDate) < new Date() : false;

  return (
    <Card className="mt-3 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden max-w-sm">
      <CardContent className="p-4">
        {/* Document Type Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground">{documentType}</span>
          </div>
          {expiryDate && (
            <Badge 
              variant={isExpired ? "destructive" : "secondary"}
              className="text-xs"
            >
              {isExpired ? "Expired" : "Valid"}
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
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
