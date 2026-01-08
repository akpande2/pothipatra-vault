import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Search, MessageSquare, ChevronRight, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatSession {
  id: string;
  date: string;
  preview: string;
}

export default function ChatHistory() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  // Load chat history from Android on mount
  useEffect(() => {
    if (window.Android?.getChatHistory) {
      try {
        const json = window.Android.getChatHistory();
        const data = JSON.parse(json);
        setSessions(data);
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }
  }, []);

  // Filter sessions based on search
  const filteredSessions = sessions.filter((session) =>
    session.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group sessions by date
  const groupedSessions = filteredSessions.reduce((groups, session) => {
    const date = session.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {} as Record<string, ChatSession[]>);

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="h-14 border-b border-border bg-background/95 backdrop-blur-sm flex items-center justify-between px-4">
          <div className="w-9" />
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

        {/* Chat Sessions List - READ ONLY */}
        <ScrollArea className="flex-1">
          <div className="px-4 py-4">
            {Object.keys(groupedSessions).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(groupedSessions).map(([date, dateSessions]) => (
                  <div key={date}>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
                      {date}
                    </p>
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
                              {session.preview || 'New conversation'}
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
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                  <MessageSquare className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No conversations yet
                </h3>
                <p className="text-muted-foreground text-sm max-w-[260px] leading-relaxed">
                  Go to Chat tab to start a conversation
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </AppLayout>
  );
}
