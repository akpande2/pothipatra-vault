import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export function AppLayout({ children, showNav = true }: AppLayoutProps) {
  return (
    // "h-screen" is safer for WebViews than "min-h-screen" to prevent bounce issues
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-20"> 
        {/* pb-20 ensures content isn't hidden behind the BottomNav */}
        {children}
      </main>
      
      {/* Conditionally show navigation if showNav is true */}
      {showNav && <BottomNav />}
    </div>
  );
}
