import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddDocument: () => void;
}

export function EmptyState({ onAddDocument }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <FileText className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No documents yet
      </h3>
      <p className="text-muted-foreground text-sm max-w-[260px] mb-6">
        Start by adding your first ID document to keep it safe and accessible
      </p>
      <Button onClick={onAddDocument} className="gap-2">
        <Plus className="w-4 h-4" />
        Add Document
      </Button>
    </div>
  );
}
