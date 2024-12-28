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
        className={`relative rounded-lg px-4 py-2 text-sm ${
          isOutgoing
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
        onClick={originalText ? onToggleOriginal : undefined}
      >
        {isTranslating ? (
          <div className="animate-pulse">Translating...</div>
        ) : (
          <p>{showOriginal ? originalText : message}</p>
        )}
      </div>
      {originalText && !isTranslating && (
        <div className="absolute -bottom-5 right-0 text-[10px] text-gray-500 mt-1">
          Click to {showOriginal ? "show translation" : "show original"}
        </div>
      )}
    </div>
  );
};