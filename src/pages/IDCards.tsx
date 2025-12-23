import { useLanguage } from '@/hooks/useLanguage';
import { AppLayout } from '@/components/AppLayout';
import { FolderOpen } from 'lucide-react';

export default function IDCards() {
  const { t } = useLanguage();

  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-xl font-semibold text-foreground mb-2">
          {t.documents}
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          All your saved ID cards
        </p>

        {/* Placeholder Grid */}
        <div className="flex flex-col items-center justify-center py-16 bg-muted/30 rounded-2xl border border-border">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-primary stroke-[1.5]" />
          </div>
          <p className="text-muted-foreground text-center">
            ID Cards folder placeholder
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
