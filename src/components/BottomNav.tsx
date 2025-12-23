import { Upload, FolderOpen, MessageCircle, Clock } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/upload', icon: Upload, labelKey: 'addDocument' },
  { path: '/id-cards', icon: FolderOpen, labelKey: 'documents' },
  { path: '/dashboard', icon: MessageCircle, labelKey: 'appName', isMain: true },
  { path: '/chat-history', icon: Clock, labelKey: 'appName' },
];

export function BottomNav() {
  const { t } = useLanguage();
  const location = useLocation();

  const getLabel = (key: string) => {
    if (key === 'addDocument') return t.addDocument;
    if (key === 'documents') return t.documents;
    return key === 'appName' ? 'Chat' : 'History';
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom">
      <div className="flex items-end justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center -mt-6"
              >
                <div
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center shadow-elevated transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground scale-105"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  <Icon className="w-7 h-7 stroke-[1.5]" />
                </div>
                <span className={cn(
                  "text-xs mt-1 font-medium",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  Chat
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center py-2 px-3"
            >
              <Icon
                className={cn(
                  "w-6 h-6 stroke-[1.5] transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span className={cn(
                "text-xs mt-1",
                isActive ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {item.path === '/upload' ? 'Upload' : item.path === '/id-cards' ? 'Documents' : 'History'}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
