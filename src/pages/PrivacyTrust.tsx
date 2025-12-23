import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Lock, Eye, CheckCircle } from 'lucide-react';

const trustPoints = [
  {
    icon: Shield,
    title: 'Your documents stay on your device',
    description: 'All uploaded documents are stored locally on your device. We do not upload or store your files on external servers.',
  },
  {
    icon: Lock,
    title: 'We do not share your data',
    description: 'Your personal information and documents are never shared with third parties. Your privacy is our priority.',
  },
  {
    icon: Eye,
    title: 'You control what you upload',
    description: 'You decide which documents to add and can remove them at any time. Full control remains with you.',
  },
];

export default function PrivacyTrust() {
  const navigate = useNavigate();

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
              Privacy & Trust
            </h1>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="px-5 py-8 max-w-lg mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Your Privacy Matters
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                PothiPatra is designed with your privacy and security at its core.
              </p>
            </div>

            {/* Trust Points */}
            <div className="space-y-6">
              {trustPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-2xl bg-card border border-border/50"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <point.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground mb-1">
                      {point.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Note */}
            <div className="mt-10 p-4 rounded-xl bg-muted/50 border border-border/30">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We are committed to maintaining the highest standards of data protection and user privacy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
