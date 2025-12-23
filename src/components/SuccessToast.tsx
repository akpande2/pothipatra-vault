import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';

interface SuccessToastOptions {
  title?: string;
  description?: string;
}

export function showSuccessToast({ 
  title = "Document saved successfully",
  description 
}: SuccessToastOptions = {}) {
  toast.custom(
    (t) => (
      <div className="flex items-center gap-3 px-4 py-3 bg-card border border-green-500/20 rounded-xl shadow-lg animate-fade-in">
        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
          <CheckCircle className="w-5 h-5 text-green-500 animate-check-bounce" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
    ),
    {
      duration: 2500,
      position: 'bottom-center',
    }
  );
}
