import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface DocumentInfo {
  id?: string;
  documentType: string;
  personName: string;
  idNumber?: string;
  dob?: string;
  expiryDate?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  documents?: DocumentInfo[];
}

export default function ChatConversation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState<string>(id || 'new');

  // Load existing messages if session exists
  useEffect(() => {
    if (id && id !== 'new' && window.Android?.getChatMessages) {
      try {
        const json = window.Android.getChatMessages(id);
        const data = JSON.parse(json);
        // Convert timestamp to string format
        const formatted = data.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        }));
        setMessages(formatted);
      } catch (e) {
        console.error('Failed to load messages:', e);
      }
    } else if (id === 'new' && window.Android?.startNewChatSession) {
      const newId = window.Android.startNewChatSession();
      if (newId) {
        setSessionId(newId);
      }
    }
  }, [id]);

  // Set up response callback
  useEffect(() => {
    window.onChatResponse = (response: any) => {
      console.log('[CHAT] Response received:', response);
      
      const assistantMsg: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        documents: response.documents?.map((doc: any) => ({
          id: doc.id,
          documentType: doc.documentType,
          personName: doc.personName,
          idNumber: doc.idNumber,
          dob: doc.dob,
          isValid: doc.isValid
        }))
      };
      
      setMessages(prev => [...prev, assistantMsg]);
      setIsSending(false);
      if (response.askingRelationship && response.pendingPersonName) {
        console.log('[CHAT] Asking relationship for:', response.pendingPersonName);
      }
    };

    return () => {
      window.onChatResponse = undefined;
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleBack = () => {
    navigate('/chat-history');
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim() || isSending) return;

    // Add user message
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsSending(true);

    // Send to Android
    if (window.Android?.sendChatMessage) {
      console.log('[CHAT] Sending to Android:', content);
      window.Android.sendChatMessage(content.trim());
    } else {
      // Fallback for non-Android
      setIsSending(false);
      const fallbackMsg: Message = {
        id: `msg_${Date.now()}_fallback`,
        role: 'assistant',
        content: 'Chat is only available in the Android app.',
        timestamp: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="px-4 py-4 border-b border-border bg-background/90 backdrop-blur-sm flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBack} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 text-center pr-10">
            <h1 className="text-lg font-semibold text-foreground">Chat</h1>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="px-4 py-6 min-h-full">
            <div className="space-y-4 max-w-2xl mx-auto">
              {messages.length === 0 && !isSending && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="mb-4">Ask me about your documents</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Show all documents', 'What is my Aadhaar number?'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSendMessage(suggestion)}
                        className="px-3 py-2 text-sm bg-muted rounded-full hover:bg-muted/80"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                  documents={message.documents}
                />
              ))}
              
              {isSending && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              )}
              
              <div ref={scrollRef} />
            </div>
          </div>
        </ScrollArea>

        {/* Input */}
        <ChatInput onSend={handleSendMessage} placeholder="Ask about your documents..." />
      </div>
    </AppLayout>
  );
}
