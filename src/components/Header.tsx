import { BookOpen, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">
              PothiPatra
            </h1>
            <p className="text-xs text-muted-foreground">
              आपकी दस्तावेज़ डायरी
            </p>
          </div>
        </div>
        <Link
          to="/settings"
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Link>
      </div>
    </header>
  );
}
