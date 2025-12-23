import { ReactNode } from 'react';
import { FileText, MessageSquare, Bell, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyStateType = 'documents' | 'chat-history' | 'reminders';

interface EmptyStateProps {
  type: EmptyStateType;
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
}

const emptyStateConfig: Record<EmptyStateType, {
  icon: ReactNode;
  iconBg: string;
  title: string;
  description: string;
}> = {
  'documents': {
    icon: <FileText className="w-8 h-8" />,
    iconBg: 'bg-primary/10 text-primary',
    title: 'No documents yet',
    description: 'Upload your first document to get started',
  },
  'chat-history': {
    icon: <MessageSquare className="w-8 h-8" />,
    iconBg: 'bg-blue-500/10 text-blue-500',
    title: 'No conversations yet',
    description: 'Start a chat to ask about your documents',
  },
  'reminders': {
    icon: <Bell className="w-8 h-8" />,
    iconBg: 'bg-amber-500/10 text-amber-500',
    title: 'No reminders set',
    description: 'Add reminders for document renewals',
  },
};

export function EmptyState({ type, onAction, actionLabel, className }: EmptyStateProps) {
  const config = emptyStateConfig[type];

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in",
      className
    )}>
      {/* Friendly Icon */}
      <div className={cn(
        "w-20 h-20 rounded-full flex items-center justify-center mb-6",
        config.iconBg
      )}>
        {config.icon}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {config.title}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground text-sm max-w-[260px] leading-relaxed mb-6">
        {config.description}
      </p>

      {/* Optional Action Button */}
      {onAction && actionLabel && (
        <Button onClick={onAction} className="gap-2">
          <Upload className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
