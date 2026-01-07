import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      {/* <BottomNav /> */}
    </div>
  );
}

