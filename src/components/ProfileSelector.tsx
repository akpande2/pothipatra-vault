import { Profile } from '@/types/document';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/hooks/useLanguage';

interface ProfileSelectorProps {
  profiles: Profile[];
  activeProfileId: string;
  onSelect: (profileId: string) => void;
  onAddProfile: () => void;
  canAddMore: boolean;
}

export function ProfileSelector({
  profiles,
  activeProfileId,
  onSelect,
  onAddProfile,
  canAddMore,
}: ProfileSelectorProps) {
  const { t } = useLanguage();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRelationLabel = (relation: Profile['relation']) => {
    const labels: Record<string, string> = {
      self: t.self,
      spouse: t.spouse,
      child: t.child,
      parent: t.parent,
      other: t.other,
    };
    return labels[relation] || relation;
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {profiles.map((profile) => (
        <button
          key={profile.id}
          onClick={() => onSelect(profile.id)}
          className={cn(
            'flex flex-col items-center gap-1.5 min-w-[68px] p-2 rounded-xl transition-all duration-200',
            activeProfileId === profile.id
              ? 'bg-accent/10'
              : 'hover:bg-muted'
          )}
          aria-label={`Select ${profile.name}`}
          aria-pressed={activeProfileId === profile.id}
        >
          <Avatar
            className={cn(
              'w-11 h-11 border-2 transition-all duration-200',
              activeProfileId === profile.id
                ? 'border-accent'
                : 'border-transparent'
            )}
          >
            <AvatarFallback
              className={cn(
                'text-sm font-medium transition-colors duration-200',
                activeProfileId === profile.id
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p
              className={cn(
                'text-xs font-medium truncate max-w-[60px]',
                activeProfileId === profile.id
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {profile.name}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {getRelationLabel(profile.relation)}
            </p>
          </div>
        </button>
      ))}

      {canAddMore && (
        <button
          onClick={onAddProfile}
          className="flex flex-col items-center gap-1.5 min-w-[68px] p-2 rounded-xl hover:bg-muted transition-colors"
          aria-label={t.addFamilyMember}
        >
          <div className="w-11 h-11 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
            <Plus className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-[10px] text-muted-foreground">{t.add}</p>
        </button>
      )}
    </div>
  );
}
