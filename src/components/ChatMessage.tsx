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
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Avatar - only for assistant */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          'max-w-[75%] px-4 py-3',
          isUser
            ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
            : 'bg-muted text-foreground rounded-2xl rounded-bl-md'
        )}
      >
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>
        {timestamp && (
          <p
            className={cn(
              'text-[11px] mt-2 opacity-70',
              isUser ? 'text-right' : 'text-left'
            )}
          >
            {timestamp}
          </p>
        )}
      </div>

      {/* Avatar - only for user */}
      {isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-muted">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
