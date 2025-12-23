import { useState } from 'react';
import { Profile } from '@/types/document';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';

interface AddProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; relation: Profile['relation'] }) => void;
}

export function AddProfileSheet({ open, onOpenChange, onSubmit }: AddProfileSheetProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [relation, setRelation] = useState<Profile['relation']>('other');
  const { toast } = useToast();

  const relations = [
    { value: 'self' as const, label: t.self },
    { value: 'spouse' as const, label: t.spouse },
    { value: 'child' as const, label: t.child },
    { value: 'parent' as const, label: t.parent },
    { value: 'other' as const, label: t.other },
  ];

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({
        title: t.nameRequired,
        description: t.enterMemberName,
        variant: 'destructive',
      });
      return;
    }

    onSubmit({ name: name.trim(), relation });
    setName('');
    setRelation('other');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-left text-base">{t.addFamilyMember}</SheetTitle>
        </SheetHeader>

        <div className="space-y-5 animate-fade-in">
          <div className="space-y-2">
            <Label htmlFor="profileName">{t.name}</Label>
            <Input
              id="profileName"
              placeholder={t.enterName}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t.relation}</Label>
            <div className="flex flex-wrap gap-2">
              {relations.map((rel) => (
                <button
                  key={rel.value}
                  onClick={() => setRelation(rel.value)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all',
                    relation === rel.value
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {rel.label}
                </button>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={handleSubmit}>
            {t.add}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
