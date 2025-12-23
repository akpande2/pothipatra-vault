import { Profile, RELATIONS } from '@/types/document';
import { cn } from '@/lib/utils';
import { Plus, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {profiles.map((profile) => (
        <button
          key={profile.id}
          onClick={() => onSelect(profile.id)}
          className={cn(
            'flex flex-col items-center gap-1.5 min-w-[72px] p-2 rounded-xl transition-all duration-200',
            activeProfileId === profile.id
              ? 'bg-primary/10'
              : 'hover:bg-muted'
          )}
        >
          <Avatar
            className={cn(
              'w-12 h-12 border-2 transition-all duration-200',
              activeProfileId === profile.id
                ? 'border-accent shadow-md'
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
                'text-xs font-medium truncate max-w-[64px]',
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
          className="flex flex-col items-center gap-1.5 min-w-[72px] p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
            <Plus className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">Add</p>
        </button>
      )}
    </div>
  );
}
