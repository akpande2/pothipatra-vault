import { cn } from '@/lib/utils';
import { User, Bot, Loader2 } from 'lucide-react';
import { ChatDocumentCard } from './ChatDocumentCard';

interface DocumentInfo {
  id?: string;
  documentType: string;
  personName: string;
  idNumber?: string;
  dob?: string;
  expiryDate?: string;
}

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  documents?: DocumentInfo[];
  isThinking?: boolean;
  onDocumentClick?: (docId?: string) => void;
}

export function ChatMessage({ 
  role, 
  content, 
  timestamp, 
  documents, 
  isThinking,
  onDocumentClick 
}: ChatMessageProps) {
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
          {isThinking ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          ) : (
            <Bot className="w-4 h-4 text-primary" />
          )}
        </div>
      )}

      {/* Message content wrapper */}
      <div className="max-w-[80%] flex flex-col gap-2">
        {/* Message bubble */}
        <div
          className={cn(
            'px-4 py-3',
            isUser
              ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
              : 'bg-muted text-foreground rounded-2xl rounded-bl-md',
            isThinking && 'animate-pulse'
          )}
        >
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>
          
          {timestamp && !isThinking && (
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

        {/* Document Cards - Below bubble for assistant only */}
        {documents && documents.length > 0 && !isUser && !isThinking && (
          <div className="space-y-2 pl-1">
            {documents.map((doc, index) => (
              <ChatDocumentCard
                key={doc.id || index}
                id={doc.id}
                documentType={doc.documentType}
                personName={doc.personName}
                idNumber={doc.idNumber}
                dob={doc.dob}
                expiryDate={doc.expiryDate}
                onClick={() => onDocumentClick?.(doc.id)}
              />
            ))}
          </div>
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
