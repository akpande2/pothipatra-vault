import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/hooks/useStore';
import { useToast } from '@/hooks/use-toast';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { Profile, RELATIONS } from '@/types/document';
import { ChevronLeft, User, Trash2, Shield, Lock, Info } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

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
    return RELATIONS.find((r) => r.value === relation)?.label || relation;
  };

  const handleDeleteProfile = () => {
    if (profileToDelete) {
      try {
        deleteProfile(profileToDelete.id);
        toast({
          title: 'Profile deleted',
          description: `${profileToDelete.name}'s profile and documents have been removed`,
        });
      } catch {
        toast({
          title: 'Cannot delete',
          description: 'At least one profile is required',
          variant: 'destructive',
        });
      }
      setProfileToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 px-5 py-4">
          <Link
            to="/"
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors -ml-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </header>

      <main className="px-5 py-6 space-y-8">
        {/* Profiles Section */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Family Profiles
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
                    <p className="font-medium">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {getRelationLabel(profile.relation)}
                    </p>
                  </div>
                </div>
                {profiles.length > 1 && (
                  <button
                    onClick={() => setProfileToDelete(profile)}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {4 - profiles.length} profile slots remaining
          </p>
        </section>

        {/* Security Section */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">App Lock</p>
                  <p className="text-xs text-muted-foreground">Coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            About
          </h2>
          <div className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">PothiPatra</h3>
                <p className="text-xs text-muted-foreground">Version 1.0.0 Beta</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your personal digital vault for Indian ID cards and official documents. 
              Keep your important documents safe, organized, and always accessible.
            </p>
          </div>
        </section>
      </main>

      <DeleteConfirmDialog
        open={!!profileToDelete}
        onOpenChange={(open) => !open && setProfileToDelete(null)}
        onConfirm={handleDeleteProfile}
        title="Delete Profile"
        description={`Are you sure you want to delete ${profileToDelete?.name}'s profile? All documents under this profile will also be deleted.`}
      />
    </div>
  );
};

export default Settings;
