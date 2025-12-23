import { useLanguage } from '@/hooks/useLanguage';
import { AppLayout } from '@/components/AppLayout';
import { MessageCircle } from 'lucide-react';

export default function Dashboard() {
  const { t } = useLanguage();

  return (
    <AppLayout>
      <div className="flex flex-col h-full p-6">
        {/* Header */}
        <div className="text-center py-4 mb-4">
          <h1 className="text-xl font-semibold text-foreground">
            {t.appName}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t.appTagline}
          </p>
        </div>

        {/* Chat Area Placeholder */}
        <div className="flex-1 flex flex-col items-center justify-center bg-muted/30 rounded-2xl border border-border p-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-primary stroke-[1.5]" />
          </div>
          <p className="text-muted-foreground text-center text-lg">
            Chat interface placeholder
          </p>
          <p className="text-muted-foreground/60 text-center text-sm mt-2">
            Ask questions about your documents
          </p>
        </div>

        {/* Input Area Placeholder */}
        <div className="mt-4 p-4 bg-card rounded-2xl border border-border">
          <div className="h-12 bg-muted/50 rounded-xl flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Type a message...</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
