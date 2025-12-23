import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingAddButtonProps {
  onClick: () => void;
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-40',
        'w-14 h-14 rounded-full',
        'bg-accent text-accent-foreground',
        'shadow-deep hover:shadow-lg',
        'flex items-center justify-center',
        'transition-all duration-300 hover:scale-105 active:scale-95'
      )}
      aria-label="Add document"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
}
