import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell, Calendar, Clock, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ExpiryItem {
  id: string;
  documentType: string;
  personName: string;
  expiryDate: string;
  icon: string;
}

// Mock data for UI demo
const mockExpiries: ExpiryItem[] = [
  {
    id: '1',
    documentType: 'Driving Licence',
    personName: 'Rahul Sharma',
    expiryDate: '2025-02-15',
    icon: '🚗',
  },
  {
    id: '2',
    documentType: 'Passport',
    personName: 'Priya Sharma',
    expiryDate: '2025-04-20',
    icon: '📘',
  },
  {
    id: '3',
    documentType: 'Driving Licence',
    personName: 'Amit Sharma',
    expiryDate: '2025-06-10',
    icon: '🚗',
  },
  {
    id: '4',
    documentType: 'Passport',
    personName: 'Rahul Sharma',
    expiryDate: '2028-05-15',
    icon: '📘',
  },
];

// Helper to calculate days until expiry
const getDaysUntilExpiry = (expiryDate: string) => {
  const expiry = new Date(expiryDate);
  const now = new Date();
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

// Helper to format expiry date
const formatExpiryDate = (expiryDate: string) => {
  return new Date(expiryDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Get status based on days until expiry
const getExpiryStatus = (days: number) => {
  if (days < 0) return 'expired';
  if (days <= 30) return 'critical';
  if (days <= 90) return 'warning';
  return 'safe';
};

export default function Reminders() {
  const navigate = useNavigate();

  // Sort by expiry date (soonest first)
  const sortedExpiries = [...mockExpiries].sort(
    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  );

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="px-4 py-4 border-b border-border bg-background/90 backdrop-blur-sm flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 text-center pr-10">
            <h1 className="text-lg font-semibold text-foreground">
              Upcoming Expiries
            </h1>
          </div>
        </header>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {sortedExpiries.length > 0 ? (
              sortedExpiries.map((item) => {
                const daysUntil = getDaysUntilExpiry(item.expiryDate);
                const status = getExpiryStatus(daysUntil);

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border transition-colors",
                      status === 'expired' && "bg-destructive/5 border-destructive/20",
                      status === 'critical' && "bg-destructive/5 border-destructive/20",
                      status === 'warning' && "bg-amber-500/5 border-amber-500/20",
                      status === 'safe' && "bg-card border-border"
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      status === 'expired' || status === 'critical' 
                        ? "bg-destructive/10" 
                        : status === 'warning' 
                          ? "bg-amber-500/10" 
                          : "bg-primary/10"
                    )}>
                      <span className="text-2xl">{item.icon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground text-sm">
                          {item.documentType}
                        </p>
                        {status === 'critical' && (
                          <Badge 
                            variant="outline" 
                            className="text-[10px] px-1.5 py-0 h-5 bg-destructive/10 text-destructive border-destructive/30 gap-1"
                          >
                            <Clock className="w-3 h-3" />
                            {daysUntil} days left
                          </Badge>
                        )}
                        {status === 'warning' && (
                          <Badge 
                            variant="outline" 
                            className="text-[10px] px-1.5 py-0 h-5 bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1"
                          >
                            <Clock className="w-3 h-3" />
                            Expiring Soon
                          </Badge>
                        )}
                        {status === 'expired' && (
                          <Badge 
                            variant="outline" 
                            className="text-[10px] px-1.5 py-0 h-5 bg-destructive/10 text-destructive border-destructive/30"
                          >
                            Expired
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.personName}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Calendar className={cn(
                          "w-3.5 h-3.5",
                          status === 'expired' || status === 'critical' 
                            ? "text-destructive" 
                            : status === 'warning' 
                              ? "text-amber-600" 
                              : "text-muted-foreground"
                        )} />
                        <span className={cn(
                          "text-xs",
                          status === 'expired' || status === 'critical' 
                            ? "text-destructive" 
                            : status === 'warning' 
                              ? "text-amber-600" 
                              : "text-muted-foreground"
                        )}>
                          {status === 'expired' ? 'Expired on ' : 'Expires '}{formatExpiryDate(item.expiryDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
                  <Bell className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No upcoming expiries
                </h3>
                <p className="text-muted-foreground text-sm max-w-[260px] leading-relaxed">
                  Documents with expiry dates will appear here
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </AppLayout>
  );
}
