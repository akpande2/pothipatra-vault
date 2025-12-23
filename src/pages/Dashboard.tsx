import { useLanguage } from '@/hooks/useLanguage';
import { AppLayout } from '@/components/AppLayout';
import { MessageCircle, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { t } = useLanguage();

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="px-5 py-4 border-b border-border bg-background/90 backdrop-blur-sm">
          <h1 className="text-xl font-semibold text-foreground text-center">
            {t.appName}
          </h1>
        </header>

        {/* Chat Area - Dominant */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 overflow-auto">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <MessageCircle className="w-10 h-10 text-primary stroke-[1.5]" />
          </div>
          
          <div className="text-center max-w-sm">
            <p className="text-foreground text-lg font-medium mb-4">
              Ask about your documents
            </p>
            <p className="text-muted-foreground text-base leading-relaxed">
              For example:
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-muted-foreground/80 text-base italic">
                "Show my Aadhaar"
              </p>
              <p className="text-muted-foreground/80 text-base italic">
                "Do I have a passport?"
              </p>
              <p className="text-muted-foreground/80 text-base italic">
                "When does my license expire?"
              </p>
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div className="px-4 pb-4 pt-2 border-t border-border bg-background">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Type your question..."
              className="flex-1 h-14 rounded-2xl bg-muted/50 border-0 text-base px-5"
              disabled
            />
            <Button 
              size="icon" 
              className="h-14 w-14 rounded-2xl shrink-0"
              disabled
            >
              <Send className="w-5 h-5 stroke-[1.5]" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
