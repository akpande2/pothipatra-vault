import { Upload, FolderOpen, MessageCircle, Clock } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/upload', icon: Upload, label: 'Upload' },
  { path: '/id-cards', icon: FolderOpen, label: 'Documents' },
  { path: '/dashboard', icon: MessageCircle, label: 'Chat' },
  { path: '/chat-history', icon: Clock, label: 'History' },
];

export function BottomNav() {
  const location = useLocation();

  const isItemActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-t border-border pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = isItemActive(item.path);
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full transition-all"
            >
              <div className={cn(
                "p-1 rounded-xl transition-colors",
                isActive ? "bg-primary/10" : "bg-transparent"
              )}>
                <Icon
                  className={cn(
                    "w-5 h-5",
                    isActive ? "text-primary stroke-[2.5]" : "text-muted-foreground stroke-[1.5]"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] mt-1 transition-colors",
                  isActive ? "text-primary font-bold" : "text-muted-foreground font-medium"
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
