import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { ChevronLeft, ChevronRight, BookOpen, Globe, Check, Shield, Bell, Info } from 'lucide-react';
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

  const menuItems = [
    {
      id: 'notifications',
      icon: Bell,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      title: language === 'hi' ? 'सूचनाएं' : 'Notifications',
      subtitle: language === 'hi' ? 'अनुस्मारक और अलर्ट प्रबंधित करें' : 'Manage reminders & alerts',
      route: '/notifications',
    },
    {
      id: 'privacy',
      icon: Shield,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      title: language === 'hi' ? 'गोपनीयता और विश्वास' : 'Privacy & Trust',
      subtitle: language === 'hi' ? 'हम आपके डेटा की सुरक्षा कैसे करते हैं' : 'How we protect your data',
      route: '/privacy',
    },
    {
      id: 'about',
      icon: Info,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      title: language === 'hi' ? 'PothiPatra के बारे में' : 'About PothiPatra',
      subtitle: language === 'hi' ? 'संस्करण और ऐप जानकारी' : 'Version & app information',
      route: '/about',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-5 py-4">
          <Link
            to="/dashboard"
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors -ml-2"
            aria-label={t.goBack}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">{t.settings}</h1>
        </div>
      </header>

      <main className="px-5 py-6 space-y-6">
        {/* Language Selector */}
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
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.route)}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", item.iconBg)}>
                  <item.icon className={cn("w-5 h-5", item.iconColor)} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* App Info Footer */}
        <div className="pt-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">{t.appName}</p>
          <p className="text-xs text-muted-foreground mt-1">{t.version}</p>
        </div>
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
