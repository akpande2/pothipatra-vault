import { MessageCircle } from 'lucide-react';

interface ChatEmptyStateProps {
  onExampleClick?: (question: string) => void;
}

const exampleQuestions = [
  "Show my Aadhaar",
  "Do I have a passport?",
  "When does my license expire?",
];

export function ChatEmptyState({ onExampleClick }: ChatEmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <MessageCircle className="w-10 h-10 text-primary stroke-[1.5]" />
      </div>

      <div className="text-center max-w-sm">
        <p className="text-foreground text-lg font-medium mb-2">
          Ask about your documents
        </p>
        <p className="text-muted-foreground text-sm mb-6">
          I can help you find and understand your stored documents
        </p>

        <div className="space-y-2">
          {exampleQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => onExampleClick?.(question)}
              className="w-full px-4 py-3 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground text-left text-sm transition-colors duration-200"
            >
              "{question}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
