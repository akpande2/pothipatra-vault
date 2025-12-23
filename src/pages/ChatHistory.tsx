import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { AppLayout } from '@/components/AppLayout';
import { Search, MessageSquare, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatSession {
  id: string;
  date: string;
  preview: string;
}

// Mock data for UI demo
const mockSessions: ChatSession[] = [
  {
    id: '1',
    date: 'Today',
    preview: 'Show my Aadhaar card',
  },
  {
    id: '2',
    date: 'Today',
    preview: 'What documents do I have?',
  },
  {
    id: '3',
    date: 'Yesterday',
    preview: 'Show my PAN card details',
  },
  {
    id: '4',
    date: 'Yesterday',
    preview: 'When does my passport expire?',
  },
  {
    id: '5',
    date: '20 Dec 2024',
    preview: 'Find documents for Rahul',
  },
  {
    id: '6',
    date: '18 Dec 2024',
    preview: 'Upload driving license',
  },
];

export default function ChatHistory() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter sessions based on search (UI only)
  const filteredSessions = mockSessions.filter((session) =>
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
        <header className="px-5 py-4 border-b border-border bg-background/90 backdrop-blur-sm">
          <h1 className="text-xl font-semibold text-foreground text-center">
            Chat History
          </h1>
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
            {Object.keys(groupedSessions).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(groupedSessions).map(([date, sessions]) => (
                  <div key={date}>
                    {/* Date Header */}
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-1">
                      {date}
                    </p>
                    
                    {/* Sessions for this date */}
                    <div className="space-y-2">
                      {sessions.map((session) => (
                        <button
                          key={session.id}
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
              <div className="flex flex-col items-center justify-center py-16">
                <p className="text-muted-foreground text-center">
                  No conversations found
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </AppLayout>
  );
}
