import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Heart } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function About() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="px-4 py-4 border-b border-border bg-background/90 backdrop-blur-sm flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 text-center pr-10">
            <h1 className="text-lg font-semibold text-foreground">
              {language === 'hi' ? 'PothiPatra के बारे में' : 'About PothiPatra'}
            </h1>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="px-5 py-8 max-w-lg mx-auto">
            {/* App Logo & Name */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-1">
                {t.appName}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t.version}
              </p>
            </div>

            {/* Description */}
            <div className="p-4 rounded-xl bg-card border border-border mb-6">
              <p className="text-sm text-muted-foreground leading-relaxed text-center">
                {t.appDescription}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-8">
              <h3 className="text-sm font-medium text-foreground mb-3">
                {language === 'hi' ? 'मुख्य विशेषताएं' : 'Key Features'}
              </h3>
              {[
                language === 'hi' ? 'सभी पहचान दस्तावेज़ों को सुरक्षित रूप से संग्रहीत करें' : 'Securely store all identity documents',
                language === 'hi' ? 'अपने दस्तावेज़ों के बारे में सवाल पूछें' : 'Ask questions about your documents',
                language === 'hi' ? 'समाप्ति तिथि अनुस्मारक प्राप्त करें' : 'Get expiry date reminders',
                language === 'hi' ? 'परिवार के दस्तावेज़ व्यवस्थित करें' : 'Organize family documents',
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <p className="text-sm text-foreground">{feature}</p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="text-center pt-4 border-t border-border">
              <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm">
                <span>{language === 'hi' ? 'प्यार से बनाया गया' : 'Made with'}</span>
                <Heart className="w-4 h-4 text-destructive fill-destructive" />
                <span>{language === 'hi' ? 'भारत में' : 'in India'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
