import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageSquare, Edit2, Trash2 } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isOutgoing: boolean;
  timestamp: string;
  isTranslating?: boolean;
  originalText?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ChatMessage = ({ 
  message, 
  isOutgoing, 
  timestamp, 
  isTranslating,
  originalText,
  onEdit,
  onDelete
}: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full mt-2 space-x-3 max-w-md group",
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
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Show Original
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{originalText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <div className="absolute bottom-full right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 mb-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 bg-white shadow-sm hover:bg-gray-50"
                onClick={onEdit}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 bg-white shadow-sm hover:bg-gray-50"
                onClick={onDelete}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-500 leading-none">{timestamp}</span>
      </div>
    </div>
  );
};