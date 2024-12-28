import { cn } from "@/lib/utils";

interface MessageTranslationIndicatorProps {
  isOutgoing: boolean;
  showOriginal: boolean;
}

export const MessageTranslationIndicator = ({
  isOutgoing,
  showOriginal
}: MessageTranslationIndicatorProps) => {
  return (
    <div
      className={cn(
        "text-[10px] text-gray-500 mt-1",
        isOutgoing ? "text-left" : "text-right"
      )}
    >
      {showOriginal ? "show translation" : "show original"}
    </div>
  );
};