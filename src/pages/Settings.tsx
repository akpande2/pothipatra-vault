import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { ChevronLeft, BookOpen, Lock, Info, Globe, Check, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const Settings = () => {
  const { t, language, setLanguage, languages } = useLanguage();
  const navigate = useNavigate();
  const [languageSheetOpen, setLanguageSheetOpen] = useState(false);

  const currentLanguage = languages.find(l => l.code === language);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-5 py-4">
          <Link
            to="/"
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors -ml-2"
            aria-label={t.goBack}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">{t.settings}</h1>
        </div>
      </header>

      <main className="px-5 py-6 space-y-8">
        {/* Language Section */}
        <section>
          <h2 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-wide">
            <Globe className="w-4 h-4" />
            {t.language}
          </h2>
          <button
            onClick={() => setLanguageSheetOpen(true)}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-accent" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">{currentLanguage?.nativeName}</p>
                <p className="text-xs text-muted-foreground">{currentLanguage?.name}</p>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
          </button>
        </section>

        {/* Security Section */}
        <section>
          <h2 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-wide">
            <Lock className="w-4 h-4" />
            {t.security}
          </h2>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/privacy')}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">Privacy & Trust</p>
                  <p className="text-xs text-muted-foreground">How we protect your data</p>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
            </button>
            <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">{t.appLock}</p>
                  <p className="text-xs text-muted-foreground">{t.comingSoon}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section>
          <h2 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-wide">
            <Info className="w-4 h-4" />
            {t.about}
          </h2>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">{t.appName}</h3>
                <p className="text-xs text-muted-foreground">{t.version}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.appDescription}
            </p>
          </div>
        </section>
      </main>

      {/* Language Selection Sheet */}
      <Sheet open={languageSheetOpen} onOpenChange={setLanguageSheetOpen}>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-left text-base">{t.selectLanguage}</SheetTitle>
          </SheetHeader>
          <div className="space-y-1 overflow-auto">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setLanguageSheetOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between p-4 rounded-xl transition-colors',
                  language === lang.code
                    ? 'bg-accent/10 border border-accent/30'
                    : 'hover:bg-muted'
                )}
              >
                <div className="text-left">
                  <p className="font-medium text-sm">{lang.nativeName}</p>
                  <p className="text-xs text-muted-foreground">{lang.name}</p>
                </div>
                {language === lang.code && (
                  <Check className="w-5 h-5 text-accent" />
                )}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Settings;
