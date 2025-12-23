import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';

interface EmptyStateProps {
  onAddDocument: () => void;
}

export function EmptyState({ onAddDocument }: EmptyStateProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-5">
        <FileText className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        {t.noDocuments}
      </h3>
      <p className="text-muted-foreground text-sm max-w-[240px] mb-6">
        {t.addFirstDocument}
      </p>
      <Button onClick={onAddDocument} className="gap-2">
        <Plus className="w-4 h-4" />
        {t.addDocument}
      </Button>
    </div>
  );
}
