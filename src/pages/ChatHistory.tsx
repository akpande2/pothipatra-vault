import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { AppLayout } from '@/components/AppLayout';
import { Search, MessageSquare, ChevronRight, Settings, Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  getChatHistory, 
  searchChatHistory, 
  startNewChatSession,
  isAndroidBridgeAvailable,
  ChatSession as BridgeChatSession 
} from '@/hooks/useAndroidBridge';

interface DisplaySession {
  id: string;
  date: string;
  preview: string;
}

function formatSessionDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const sessionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (sessionDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (sessionDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}

function mapToDisplaySessions(sessions: BridgeChatSession[]): DisplaySession[] {
  return sessions.map(s => ({
    id: s.id,
    date: formatSessionDate(s.updatedAt || s.createdAt),
    preview: s.title || 'New conversation',
  }));
}

export default function ChatHistory() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState<DisplaySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const isAndroid = isAndroidBridgeAvailable();

  // Load sessions from Android bridge
  const loadSessions = useCallback(() => {
    if (!isAndroid) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const data = getChatHistory();
      setSessions(mapToDisplaySessions(data));
    } catch (e) {
      console.error('[ChatHistory] Failed to load sessions:', e);
    } finally {
      setIsLoading(false);
    }
  }, [isAndroid]);

  // Initial load
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Refresh when page becomes visible
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadSessions();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [loadSessions]);

  // Search with debounce
  useEffect(() => {
    if (!isAndroid) return;
    
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        const results = searchChatHistory(searchQuery);
        setSessions(mapToDisplaySessions(results));
      } else {
        loadSessions();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, isAndroid, loadSessions]);

  // Handle new chat
  const handleNewChat = () => {
    if (!isAndroid) {
      navigate('/chat/new');
      return;
    }
    
    setIsCreating(true);
    try {
      const newId = startNewChatSession();
      if (newId) {
        navigate(`/chat/${newId}`);
      } else {
        navigate('/chat/new');
      }
    } catch (e) {
      console.error('[ChatHistory] Failed to create session:', e);
      navigate('/chat/new');
    } finally {
      setIsCreating(false);
    }
  };

  // Group sessions by date
  const groupedSessions = sessions.reduce((groups, session) => {
    const date = session.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {} as Record<string, DisplaySession[]>);

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewChat}
            disabled={isCreating}
            className="w-9 h-9"
          >
            {isCreating ? (
              <Loader2 className="w-[18px] h-[18px] animate-spin" />
            ) : (
              <Plus className="w-[18px] h-[18px]" />
            )}
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            Chat History
          </h1>
          <Link
            to="/settings"
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Settings className="w-[18px] h-[18px] text-muted-foreground" />
          </Link>
        </header>

        {/* Search Bar */}
        <div className="px-4 py-3 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-border/50"
            />
          </div>
        </div>

        {/* Chat Sessions List */}
        <ScrollArea className="flex-1">
          <div className="px-4 py-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">Loading conversations...</p>
              </div>
            ) : Object.keys(groupedSessions).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(groupedSessions).map(([date, dateSessions]) => (
                  <div key={date}>
                    {/* Date Header */}
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
                      {date}
                    </p>
                    
                    {/* Sessions for this date */}
                    <div className="space-y-2">
                      {dateSessions.map((session) => (
                        <button
                          key={session.id}
                          onClick={() => navigate(`/chat/${session.id}`)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-card hover:bg-muted/50 border border-border/50 transition-colors text-left group"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <MessageSquare className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">
                              {session.preview}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No conversations yet
                </h3>
                <p className="text-muted-foreground text-sm max-w-[260px] leading-relaxed mb-6">
                  Start a chat to ask about your documents
                </p>
                <Button onClick={handleNewChat} disabled={isCreating} className="gap-2">
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Start New Chat
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </AppLayout>
  );
}
