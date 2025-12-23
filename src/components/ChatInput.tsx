import { useState } from 'react';
import { Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder = "Type your question..." }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 pb-4 pt-2 border-t border-border bg-background">
      <div className="flex items-center gap-3">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="flex-1 h-14 rounded-2xl bg-muted/50 border-0 text-base px-5"
          disabled={disabled}
        />
        <Button
          type="submit"
          size="icon"
          className="h-14 w-14 rounded-2xl shrink-0"
          disabled={disabled || !message.trim()}
        >
          <Send className="w-5 h-5 stroke-[1.5]" />
        </Button>
      </div>
    </form>
  );
}
