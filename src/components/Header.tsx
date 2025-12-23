import { Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import logo from '@/assets/logo.png';

export function Header() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3">
          <img src={logo} alt="PothiPatra" className="h-10 object-contain" />
        </div>
        <Link
          to="/settings"
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          aria-label={t.settings}
        >
          <Settings className="w-5 h-5 text-muted-foreground" />
        </Link>
      </div>
    </header>
  );
}
