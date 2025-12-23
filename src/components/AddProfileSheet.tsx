import { useState } from 'react';
import { RELATIONS, Profile } from '@/types/document';
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

interface AddProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; relation: Profile['relation'] }) => void;
}

export function AddProfileSheet({ open, onOpenChange, onSubmit }: AddProfileSheetProps) {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState<Profile['relation']>('other');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({
        title: 'नाम आवश्यक है',
        description: 'कृपया परिवार के सदस्य का नाम दर्ज करें',
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
          <SheetTitle className="text-left text-base">परिवार का सदस्य जोड़ें</SheetTitle>
        </SheetHeader>

        <div className="space-y-5 animate-fade-in">
          <div className="space-y-2">
            <Label htmlFor="profileName">नाम</Label>
            <Input
              id="profileName"
              placeholder="नाम दर्ज करें"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>संबंध</Label>
            <div className="flex flex-wrap gap-2">
              {RELATIONS.map((rel) => (
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
                  {rel.labelHi}
                </button>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={handleSubmit}>
            जोड़ें
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
