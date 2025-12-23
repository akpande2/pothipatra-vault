import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell } from 'lucide-react';

export default function Reminders() {
  const navigate = useNavigate();

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
              Reminders
            </h1>
          </div>
        </header>

        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
            <Bell className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No reminders set
          </h3>
          <p className="text-muted-foreground text-sm max-w-[260px] leading-relaxed">
            Add reminders for document renewals
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
