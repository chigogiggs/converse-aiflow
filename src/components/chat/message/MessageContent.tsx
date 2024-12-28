import { cn } from "@/lib/utils";
import { Languages } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MessageContentProps {
  message: string;
  originalText?: string;
  isOutgoing: boolean;
  isTranslating?: boolean;
  onToggleOriginal: () => void;
  showOriginal: boolean;
}

export const MessageContent = ({ 
  message, 
  originalText, 
  isOutgoing, 
  isTranslating,
  onToggleOriginal,
  showOriginal
}: MessageContentProps) => {
  const isMobile = useIsMobile();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={cn(
              "relative p-3 rounded-lg cursor-pointer group neo-blur",
              isOutgoing
                ? "bg-primary/20 text-white rounded-br-none"
                : "bg-secondary/20 text-white rounded-bl-none"
            )}
            onClick={onToggleOriginal}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            layout
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={showOriginal ? 'original' : 'translated'}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-sm"
              >
                {showOriginal ? originalText : message}
              </motion.p>
            </AnimatePresence>
            {originalText && (
              <Languages 
                className={cn(
                  "h-4 w-4 absolute top-1/2 -translate-y-1/2 transition-all duration-300",
                  isMobile ? "opacity-50" : "opacity-0 group-hover:opacity-50",
                  isOutgoing ? "-left-5 text-primary/60" : "-right-5 text-secondary/60"
                )}
              />
            )}
            {originalText && isMobile && (
              <div className={cn(
                "absolute top-1/2 -translate-y-1/2 w-1 h-8 rounded-full",
                isOutgoing ? "-left-2 bg-primary/30" : "-right-2 bg-secondary/30"
              )} />
            )}
            {isTranslating && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs opacity-70"
              >
                Translating...
              </motion.span>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent className="bg-popover text-popover-foreground border-border/50">
          <p>
            {showOriginal 
              ? `${isMobile ? "Tap" : "Click"} to see translated message`
              : `${isMobile ? "Tap" : "Click"} to see original message`
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};