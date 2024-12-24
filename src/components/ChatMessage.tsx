import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isOutgoing: boolean;
  timestamp: string;
}

export const ChatMessage = ({ message, isOutgoing, timestamp }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full mt-2 space-x-3 max-w-md",
        isOutgoing ? "ml-auto justify-end" : "justify-start"
      )}
    >
      <div>
        <div
          className={cn(
            "relative p-3 rounded-lg",
            isOutgoing
              ? "bg-indigo-600 text-white rounded-br-none"
              : "bg-gray-100 text-gray-800 rounded-bl-none"
          )}
        >
          <p className="text-sm">{message}</p>
        </div>
        <span className="text-xs text-gray-500 leading-none">{timestamp}</span>
      </div>
    </div>
  );
};