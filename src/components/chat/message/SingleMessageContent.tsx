import { cn } from "@/lib/utils";
import { MessageTranslationIndicator } from "./MessageTranslationIndicator";

interface SingleMessageContentProps {
  message: string;
  originalText?: string;
  isOutgoing: boolean;
  isTranslating?: boolean;
  onToggleOriginal: () => void;
  showOriginal: boolean;
}

export const SingleMessageContent = ({
  message,
  originalText,
  isOutgoing,
  isTranslating,
  onToggleOriginal,
  showOriginal
}: SingleMessageContentProps) => {
  return (
    <div className="relative">
      <div
        className={cn(
          "relative rounded-lg px-4 py-2 text-sm",
          isOutgoing
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {isTranslating ? (
          <div className="animate-pulse">Translating...</div>
        ) : (
          <p>{showOriginal ? originalText : message}</p>
        )}
      </div>
      {originalText && !isTranslating && (
        <MessageTranslationIndicator
          isOutgoing={isOutgoing}
          showOriginal={showOriginal}
          onClick={onToggleOriginal}
        />
      )}
    </div>
  );
};