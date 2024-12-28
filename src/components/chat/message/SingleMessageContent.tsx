import { cn } from "@/lib/utils";

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
        onClick={originalText ? onToggleOriginal : undefined}
        className={cn(
          "relative rounded-lg px-4 py-2 text-sm cursor-pointer",
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
        <span
          className={cn(
            "text-[10px] text-gray-500 mt-1",
            isOutgoing ? "text-left" : "text-right"
          )}
        >
          Click to {showOriginal ? "show translation" : "show original"}
        </span>
      )}
    </div>
  );
};