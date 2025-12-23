import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/hooks/useStore';
import { useToast } from '@/hooks/use-toast';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { Profile, RELATIONS } from '@/types/document';
import { ChevronLeft, Users, Trash2, BookOpen, Lock, Info } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Settings = () => {
  const { profiles, deleteProfile } = useStore();
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);
  const { toast } = useToast();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRelationLabel = (relation: Profile['relation']) => {
    const rel = RELATIONS.find((r) => r.value === relation);
    return rel?.labelHi || relation;
  };

  const handleDeleteProfile = () => {
    if (profileToDelete) {
      try {
        deleteProfile(profileToDelete.id);
        toast({
          title: 'सदस्य हटाया गया',
          description: `${profileToDelete.name} और उनके दस्तावेज़ हटा दिए गए`,
        });
      } catch {
        toast({
          title: 'नहीं हटा सकते',
          description: 'कम से कम एक सदस्य होना चाहिए',
          variant: 'destructive',
        });
      }
      setProfileToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-3 px-5 py-4">
          <Link
            to="/"
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors -ml-2"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">सेटिंग्स</h1>
        </div>
      </header>

      <main className="px-5 py-6 space-y-8">
        {/* Profiles Section */}
        <section>
          <h2 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-wide">
            <Users className="w-4 h-4" />
            परिवार के सदस्य
          </h2>
          <div className="space-y-2">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {getRelationLabel(profile.relation)}
                    </p>
                  </div>
                </div>
                {profiles.length > 1 && (
                  <button
                    onClick={() => setProfileToDelete(profile)}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-destructive/10 transition-colors"
                    aria-label={`Delete ${profile.name}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {4 - profiles.length} और सदस्य जोड़ सकते हैं
          </p>
        </section>

        {/* Security Section */}
        <section>
          <h2 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-wide">
            <Lock className="w-4 h-4" />
            सुरक्षा
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">ऐप लॉक</p>
                  <p className="text-xs text-muted-foreground">जल्द आ रहा है</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section>
          <h2 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-wide">
            <Info className="w-4 h-4" />
            जानकारी
          </h2>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">PothiPatra</h3>
                <p className="text-xs text-muted-foreground">संस्करण 1.0.0 Beta</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              आपकी व्यक्तिगत दस्तावेज़ डायरी। अपने महत्वपूर्ण पहचान पत्र और दस्तावेज़ों को सुरक्षित, व्यवस्थित और हमेशा अपनी पहुंच में रखें।
            </p>
          </div>
        </section>
      </main>

      <DeleteConfirmDialog
        open={!!profileToDelete}
        onOpenChange={(open) => !open && setProfileToDelete(null)}
        onConfirm={handleDeleteProfile}
        title="सदस्य हटाएं?"
        description={`क्या आप ${profileToDelete?.name} को हटाना चाहते हैं? उनके सभी दस्तावेज़ भी हट जाएंगे।`}
      />
    </div>
  );
};

export default Settings;
