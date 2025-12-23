import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { AppLayout } from '@/components/AppLayout';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { ChatEmptyState } from '@/components/ChatEmptyState';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function Dashboard() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = (content: string) => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp,
    };

    // Simulate assistant response (UI only)
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: "I don't see this document yet. You can upload it using the Documents section.",
      timestamp,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
  };

  const hasMessages = messages.length > 0;

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="px-5 py-4 border-b border-border bg-background/90 backdrop-blur-sm">
          <h1 className="text-xl font-semibold text-foreground text-center">
            {t.appName}
          </h1>
        </header>

        {/* Chat Area */}
        {hasMessages ? (
          <ScrollArea className="flex-1 px-4 py-6">
            <div className="space-y-4 max-w-2xl mx-auto">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <ChatEmptyState onExampleClick={handleSendMessage} />
        )}

        {/* Chat Input */}
        <ChatInput onSend={handleSendMessage} />
      </div>
    </AppLayout>
  );
}
