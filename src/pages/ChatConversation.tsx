import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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

// Mock conversation data for UI demo
const mockConversations: Record<string, { title: string; messages: Message[] }> = {
  '1': {
    title: 'Today',
    messages: [
      { id: '1', role: 'user', content: 'Show my Aadhaar card', timestamp: '10:30 AM' },
      { 
        id: '2', 
        role: 'assistant', 
        content: "Here's the Aadhaar card I found:", 
        timestamp: '10:30 AM',
        documents: [{ documentType: 'Aadhaar Card', personName: 'Rahul Sharma' }]
      },
    ],
  },
  '2': {
    title: 'Today',
    messages: [
      { id: '1', role: 'user', content: 'What documents do I have?', timestamp: '09:15 AM' },
      { 
        id: '2', 
        role: 'assistant', 
        content: 'I found multiple documents.', 
        timestamp: '09:15 AM',
        documents: [
          { documentType: 'Aadhaar Card', personName: 'Rahul Sharma' },
          { documentType: 'PAN Card', personName: 'Rahul Sharma' },
          { documentType: 'Passport', personName: 'Rahul Sharma', expiryDate: '2028-05-15' },
        ]
      },
    ],
  },
  '3': {
    title: 'Yesterday',
    messages: [
      { id: '1', role: 'user', content: 'Show my PAN card details', timestamp: '3:45 PM' },
      { 
        id: '2', 
        role: 'assistant', 
        content: "Here's your PAN card:", 
        timestamp: '3:45 PM',
        documents: [{ documentType: 'PAN Card', personName: 'Rahul Sharma' }]
      },
    ],
  },
  '4': {
    title: 'Yesterday',
    messages: [
      { id: '1', role: 'user', content: 'When does my passport expire?', timestamp: '2:20 PM' },
      { 
        id: '2', 
        role: 'assistant', 
        content: 'Your passport expires on 15 May 2028. Here are the details:', 
        timestamp: '2:20 PM',
        documents: [{ documentType: 'Passport', personName: 'Rahul Sharma', expiryDate: '2028-05-15' }]
      },
    ],
  },
  '5': {
    title: '20 Dec 2024',
    messages: [
      { id: '1', role: 'user', content: 'Find documents for Rahul', timestamp: '11:00 AM' },
      { 
        id: '2', 
        role: 'assistant', 
        content: 'I found multiple documents for Rahul.', 
        timestamp: '11:00 AM',
        documents: [
          { documentType: 'Aadhaar Card', personName: 'Rahul Sharma' },
          { documentType: 'PAN Card', personName: 'Rahul Sharma' },
        ]
      },
    ],
  },
  '6': {
    title: '18 Dec 2024',
    messages: [
      { id: '1', role: 'user', content: 'Upload driving license', timestamp: '4:30 PM' },
      { id: '2', role: 'assistant', content: "I don't see this document yet. You can upload it.", timestamp: '4:30 PM' },
    ],
  },
};

export default function ChatConversation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const conversation = id ? mockConversations[id] : null;
  const messages = conversation?.messages || [];

  const handleBack = () => {
    navigate('/chat-history');
  };

  const handleSendMessage = (content: string) => {
    // UI only - no functionality
    console.log('Message sent:', content);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header with Back Button */}
        <header className="px-4 py-4 border-b border-border bg-background/90 backdrop-blur-sm flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 text-center pr-10">
            <h1 className="text-lg font-semibold text-foreground">
              {conversation?.title || 'Conversation'}
            </h1>
          </div>
        </header>

        {/* Message Area */}
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

        {/* Chat Input */}
        <ChatInput onSend={handleSendMessage} placeholder="Continue the conversation…" />
      </div>
    </AppLayout>
  );
}
