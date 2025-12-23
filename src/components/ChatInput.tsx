import { useState } from 'react';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = "Ask about your documents…\nExample: Show my Aadhaar" }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 pb-6 pt-3 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="flex items-center gap-3 max-w-2xl mx-auto">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="flex-1 h-12 rounded-full bg-muted/50 border-border/50 text-base px-5 focus-visible:ring-1 focus-visible:ring-primary/30"
          disabled={disabled}
        />
        <Button
          type="submit"
          size="icon"
          className="h-12 w-12 rounded-full shrink-0 shadow-sm"
          disabled={disabled || !message.trim()}
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </form>
  );
}
