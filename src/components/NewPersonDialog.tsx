import { RelationType, RELATIONS } from '@/types/document';
import { useLanguage } from '@/hooks/useLanguage';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { User, Heart, Baby, Users, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewPersonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personName: string;
  onConfirm: (relation: RelationType) => void;
}

const relationIcons: Record<RelationType, React.ReactNode> = {
  self: <User className="w-5 h-5" />,
  spouse: <Heart className="w-5 h-5" />,
  child: <Baby className="w-5 h-5" />,
  parent: <Users className="w-5 h-5" />,
  sibling: <Users className="w-5 h-5" />,
  other: <UserPlus className="w-5 h-5" />,
};

export function NewPersonDialog({ open, onOpenChange, personName, onConfirm }: NewPersonDialogProps) {
  const { t, language } = useLanguage();

  const getRelationLabel = (relation: typeof RELATIONS[number]) => {
    return language === 'hi' ? relation.labelHi : relation.label;
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg text-center">
            {language === 'hi' ? 'नई पहचान' : 'New Person Detected'}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-base">
            {language === 'hi' 
              ? `यह दस्तावेज़ "${personName}" का है। यह व्यक्ति आपके क्या लगते हैं?`
              : `This document belongs to "${personName}". How is this person related to you?`
            }
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid grid-cols-2 gap-2 py-4">
          {RELATIONS.map((relation) => (
            <Button
              key={relation.value}
              variant="outline"
              className={cn(
                "h-auto py-4 flex flex-col gap-2 rounded-xl",
                "hover:bg-primary/10 hover:border-primary/50"
              )}
              onClick={() => onConfirm(relation.value)}
            >
              <span className="text-muted-foreground">
                {relationIcons[relation.value]}
              </span>
              <span className="text-sm font-medium">
                {getRelationLabel(relation)}
              </span>
            </Button>
          ))}
        </div>

        <AlertDialogFooter>
          <Button 
            variant="ghost" 
            className="w-full" 
            onClick={() => onOpenChange(false)}
          >
            {t.cancel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
