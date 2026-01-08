import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { ChatEmptyState } from '@/components/ChatEmptyState';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
  getChatMessages,
  startNewChatSession,
  sendChatMessage,
  isAndroidBridgeAvailable,
  ChatResponse,
  ChatMessage as BridgeChatMessage,
} from '@/hooks/useAndroidBridge';

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
  isThinking?: boolean;
}

const SUGGESTION_CHIPS = [
  'Show all my documents',
  'What is my Aadhaar number?',
  'When does my passport expire?',
  'Find documents for myself',
  'Show my PAN card',
];

const RESPONSE_TIMEOUT = 30000; // 30 seconds

export default function ChatConversation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(id === 'new' ? null : id || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWaitingResponse, setIsWaitingResponse] = useState(false);

  const isAndroid = isAndroidBridgeAvailable();

  // Format timestamp
  const formatTime = () => {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  // Load messages or create new session
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      if (id === 'new') {
        // Create new session
        if (isAndroid) {
          const newId = startNewChatSession();
          if (newId) {
            setSessionId(newId);
            navigate(`/chat/${newId}`, { replace: true });
          }
        }
        setMessages([]);
      } else if (id && isAndroid) {
        // Load existing messages
        try {
          const existingMessages = getChatMessages(id);
          const mapped = existingMessages.map((m: BridgeChatMessage) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.timestamp).toLocaleTimeString('en-IN', { 
              hour: '2-digit', minute: '2-digit', hour12: true 
            }),
          }));
          setMessages(mapped);
        } catch (e) {
          console.error('[ChatConversation] Failed to load messages:', e);
        }
      }

      setIsLoading(false);
    };

    init();
  }, [id, isAndroid, navigate]);

  // Set up onChatResponse callback
  useEffect(() => {
    window.onChatResponse = (response: ChatResponse) => {
      console.log('[ChatConversation] onChatResponse:', response);

      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setIsWaitingResponse(false);

      // Remove thinking indicator and add real response
      setMessages(prev => {
        const withoutThinking = prev.filter(m => !m.isThinking);
        
        const documents: DocumentInfo[] = (response.documents || []).map(doc => ({
          id: doc.id,
          documentType: doc.type || doc.name,
          personName: (doc as any).holderName || (doc as any).personName || '',
          idNumber: (doc as any).number || (doc as any).idNumber || '',
          dob: (doc as any).dob,
          expiryDate: (doc as any).expiryDate,
        }));

        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.message,
          timestamp: formatTime(),
          documents: documents.length > 0 ? documents : undefined,
        };

        return [...withoutThinking, assistantMsg];
      });

      scrollToBottom();
    };

    return () => {
      window.onChatResponse = undefined;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [scrollToBottom]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleBack = () => {
    navigate('/chat-history');
  };

  const handleSendMessage = (content: string) => {
    // Add user message immediately
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: formatTime(),
    };

    // Add thinking indicator
    const thinkingMsg: Message = {
      id: `thinking-${Date.now()}`,
      role: 'assistant',
      content: 'Thinking...',
      timestamp: formatTime(),
      isThinking: true,
    };

    setMessages(prev => [...prev, userMsg, thinkingMsg]);
    setIsWaitingResponse(true);
    scrollToBottom();

    // Send to Android
    if (isAndroid) {
      const sent = sendChatMessage(content);
      if (!sent) {
        // Fallback if bridge not available
        setMessages(prev => prev.filter(m => !m.isThinking));
        setIsWaitingResponse(false);
      } else {
        // Set timeout fallback
        timeoutRef.current = setTimeout(() => {
          console.warn('[ChatConversation] Response timeout');
          setMessages(prev => {
            const withoutThinking = prev.filter(m => !m.isThinking);
            return [...withoutThinking, {
              id: `timeout-${Date.now()}`,
              role: 'assistant',
              content: 'Sorry, I took too long to respond. Please try again.',
              timestamp: formatTime(),
            }];
          });
          setIsWaitingResponse(false);
        }, RESPONSE_TIMEOUT);
      }
    } else {
      // Web fallback - just echo
      setTimeout(() => {
        setMessages(prev => {
          const withoutThinking = prev.filter(m => !m.isThinking);
          return [...withoutThinking, {
            id: `echo-${Date.now()}`,
            role: 'assistant',
            content: `I received: "${content}". (Android bridge not available)`,
            timestamp: formatTime(),
          }];
        });
        setIsWaitingResponse(false);
      }, 1000);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleDocumentClick = (docId?: string) => {
    if (docId) {
      navigate(`/dashboard?doc=${docId}`);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
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
              {isAndroid ? 'AI Assistant' : 'Chat'}
            </h1>
          </div>
        </header>

        {/* Message Area */}
        <ScrollArea className="flex-1">
          <div className="px-4 py-8 min-h-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <ChatEmptyState
                suggestions={SUGGESTION_CHIPS}
                onSuggestionClick={handleSuggestionClick}
              />
            ) : (
              <div className="space-y-6 max-w-2xl mx-auto">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    timestamp={message.timestamp}
                    documents={message.documents}
                    isThinking={message.isThinking}
                    onDocumentClick={handleDocumentClick}
                  />
                ))}
                <div ref={scrollRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <ChatInput 
          onSend={handleSendMessage} 
          placeholder="Ask about your documents…" 
          disabled={isWaitingResponse}
        />
      </div>
    </AppLayout>
  );
}
