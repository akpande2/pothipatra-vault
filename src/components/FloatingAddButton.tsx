import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';

interface FloatingAddButtonProps {
  onClick: () => void;
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  const { t } = useLanguage();

  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-40',
        'w-14 h-14 rounded-full',
        'bg-accent text-accent-foreground',
        'shadow-elevated',
        'flex items-center justify-center',
        'transition-all duration-200 hover:shadow-deep active:scale-95'
      )}
      aria-label={t.addDocument}
    >
      <Plus className="w-6 h-6" />
    </button>
  );
}
