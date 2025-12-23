import { useLanguage } from '@/hooks/useLanguage';

export default function Dashboard() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-semibold text-foreground mb-4">
        {t.appName}
      </h1>
      <p className="text-muted-foreground text-center">
        Main dashboard (chat-focused) placeholder
      </p>
    </div>
  );
}
