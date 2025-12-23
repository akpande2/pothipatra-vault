import { Upload, FolderOpen, MessageCircle, Clock } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/upload', icon: Upload, label: 'Upload' },
  { path: '/id-cards', icon: FolderOpen, label: 'Documents' },
  { path: '/', icon: MessageCircle, label: 'Chat', isMain: true, altPath: '/dashboard' },
  { path: '/chat-history', icon: Clock, label: 'History' },
];

export function BottomNav() {
  const location = useLocation();

  const isItemActive = (item: typeof navItems[0]) => {
    if (item.altPath) {
      return location.pathname === item.path || location.pathname === item.altPath;
    }
    return location.pathname === item.path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom">
      <div className="flex items-end justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = isItemActive(item);
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
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  <Icon className="w-7 h-7 stroke-[1.5]" />
                </div>
                <span className={cn(
                  "text-xs mt-1 transition-colors",
                  isActive ? "text-foreground font-semibold" : "text-muted-foreground/60 font-medium"
                )}>
                  {item.label}
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
                  "w-6 h-6 transition-all duration-200",
                  isActive 
                    ? "text-foreground stroke-[2]" 
                    : "text-muted-foreground/50 stroke-[1.5]"
                )}
              />
              <span className={cn(
                "text-xs mt-1 transition-colors",
                isActive 
                  ? "text-foreground font-semibold" 
                  : "text-muted-foreground/50 font-medium"
              )}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
