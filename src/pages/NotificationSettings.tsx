import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Bell, Calendar, Shield, Info } from 'lucide-react';

export default function NotificationSettings() {
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
              Notification Settings
            </h1>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="px-5 py-6 max-w-lg mx-auto">
            {/* Info Banner */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10 mb-6">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Stay informed about your documents. We'll only notify you about important updates.
              </p>
            </div>

            {/* Notification Options */}
            <div className="space-y-4">
              {/* Expiry Reminders */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground">
                      Expiry reminders
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Get notified before documents expire
                    </p>
                  </div>
                </div>
                <Switch defaultChecked className="shrink-0 ml-3" />
              </div>

              {/* Important Alerts */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-foreground">
                      Important alerts
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Critical updates about your documents
                    </p>
                  </div>
                </div>
                <Switch defaultChecked className="shrink-0 ml-3" />
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border/30">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You can change these settings anytime. We respect your preferences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
