import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 animate-fade-in',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
          isUser
            ? 'bg-primary/10'
            : 'bg-accent/10'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary" />
        ) : (
          <Bot className="w-4 h-4 text-accent" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          'max-w-[80%] px-4 py-3 rounded-2xl',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-muted text-foreground rounded-tl-sm'
        )}
      >
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>
        {timestamp && (
          <p
            className={cn(
              'text-xs mt-1.5',
              isUser ? 'text-primary-foreground/60' : 'text-muted-foreground'
            )}
          >
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}
