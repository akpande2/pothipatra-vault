import { useLanguage } from '@/hooks/useLanguage';
import { AppLayout } from '@/components/AppLayout';
import { Clock } from 'lucide-react';

export default function ChatHistory() {
  const { t } = useLanguage();

  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-xl font-semibold text-foreground mb-2">
          Chat History
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Your previous conversations
        </p>

        {/* History Placeholder */}
        <div className="flex flex-col items-center justify-center py-16 bg-muted/30 rounded-2xl border border-border">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-primary stroke-[1.5]" />
          </div>
          <p className="text-muted-foreground text-center">
            Chat history placeholder
          </p>
          <p className="text-muted-foreground/60 text-center text-sm mt-2">
            Your past queries will appear here
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
