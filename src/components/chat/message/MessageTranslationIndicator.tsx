import { cn } from "@/lib/utils";

interface MessageTranslationIndicatorProps {
  isOutgoing: boolean;
  showOriginal: boolean;
  onClick: () => void;
}

export const MessageTranslationIndicator = ({
  isOutgoing,
  showOriginal,
  onClick
}: MessageTranslationIndicatorProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "text-[10px] text-gray-500 mt-1 cursor-pointer",
        isOutgoing ? "text-left" : "text-right"
      )}
    >
      Click to {showOriginal ? "show translation" : "show original"}
    </div>
  );
};