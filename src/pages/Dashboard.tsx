import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { AppLayout } from '@/components/AppLayout';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { ChatEmptyState } from '@/components/ChatEmptyState';
import { ScrollArea } from '@/components/ui/scroll-area';
import logo from '@/assets/logo.png';

interface DocumentInfo {
  documentType: string;
  personName: string;
  expiryDate?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  documents?: DocumentInfo[];
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

    // Add temporary "checking" response
    const checkingMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: "Checking your documents…",
      timestamp,
    };

    setMessages((prev) => [...prev, userMessage, checkingMessage]);

    // Simulate assistant response with document cards (UI demo)
    const lowerContent = content.toLowerCase();
    const hasAadhaar = lowerContent.includes('aadhaar');
    const hasAll = lowerContent.includes('all') || lowerContent.includes('documents');
    
    setTimeout(() => {
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === checkingMessage.id
            ? { 
                ...msg, 
                content: hasAll
                  ? "I found multiple documents."
                  : hasAadhaar 
                    ? "Here's the Aadhaar card I found:" 
                    : "I don't see this document yet. You can upload it.",
                documents: hasAll
                  ? [
                      { documentType: "Aadhaar Card", personName: "Rahul Sharma" },
                      { documentType: "PAN Card", personName: "Rahul Sharma" },
                      { documentType: "Driving Licence", personName: "Rahul Sharma", expiryDate: "2025-02-15" },
                      { documentType: "Passport", personName: "Rahul Sharma", expiryDate: "2028-05-15" }
                    ]
                  : hasAadhaar 
                    ? [{ documentType: "Aadhaar Card", personName: "Rahul Sharma" }]
                    : undefined
              }
            : msg
        )
      );
    }, 1200);
  };

  const hasMessages = messages.length > 0;

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header with Logo */}
        <header className="px-5 py-3 border-b border-border bg-background/90 backdrop-blur-sm flex items-center justify-center">
          <img 
            src={logo} 
            alt="PothiPatra" 
            className="h-8 w-auto opacity-90"
          />
        </header>

        {/* Large Scrollable Message Area */}
        {hasMessages ? (
          <ScrollArea className="flex-1">
            <div className="px-4 py-8 min-h-full">
              <div className="space-y-6 max-w-2xl mx-auto">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    timestamp={message.timestamp}
                    documents={message.documents}
                  />
                ))}
              </div>
            </div>
          </ScrollArea>
        ) : (
          <ChatEmptyState onExampleClick={handleSendMessage} />
        )}

        {/* Chat Input */}
        <ChatInput onSend={handleSendMessage} placeholder="Ask about your documents…" />
      </div>
    </AppLayout>
  );
}
