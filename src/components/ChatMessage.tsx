import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatMessageProps {
  message: string;
  isOutgoing: boolean;
  timestamp: string;
  isTranslating?: boolean;
  originalText?: string;
}

export const ChatMessage = ({ 
  message, 
  isOutgoing, 
  timestamp, 
  isTranslating,
  originalText 
}: ChatMessageProps) => {
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
          {isTranslating && (
            <span className="text-xs opacity-70">Translating...</span>
          )}
          {originalText && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    Show Original
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{originalText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <span className="text-xs text-gray-500 leading-none">{timestamp}</span>
      </div>
    </div>
  );
};