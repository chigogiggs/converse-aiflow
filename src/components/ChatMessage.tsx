import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { UserAvatar } from "./UserAvatar";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessageProps {
  message: string;
  isOutgoing: boolean;
  timestamp: string;
  isTranslating?: boolean;
  originalText?: string;
  senderId?: string;
}

export const ChatMessage = ({ 
  message, 
  isOutgoing, 
  timestamp, 
  isTranslating,
  originalText,
  senderId
}: ChatMessageProps) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const isMobile = useIsMobile();
  const [senderProfile, setSenderProfile] = useState<any>(null);

  useEffect(() => {
    const fetchSenderProfile = async () => {
      if (!senderId || isOutgoing) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', senderId)
        .single();
      
      if (profile) {
        setSenderProfile(profile);
      }
    };

    fetchSenderProfile();
  }, [senderId, isOutgoing]);

  const toggleOriginal = () => {
    if (originalText) {
      setShowOriginal(!showOriginal);
    }
  };

  return (
    <div
      className={cn(
        "flex w-full mt-2 space-x-3 max-w-md group",
        isOutgoing ? "ml-auto justify-end" : "justify-start"
      )}
    >
      {!isOutgoing && senderId && (
        <div className="flex-shrink-0">
          <UserAvatar
            src={senderProfile?.avatar_url}
            fallback={senderProfile?.display_name?.[0] || "?"}
            size="sm"
          />
        </div>
      )}
      <div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                className={cn(
                  "relative p-3 rounded-lg cursor-pointer group neo-blur",
                  isOutgoing
                    ? "bg-primary/20 text-primary-foreground rounded-br-none"
                    : "bg-secondary/20 text-secondary-foreground rounded-bl-none"
                )}
                onClick={toggleOriginal}
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
                      "h-4 w-4 absolute -right-5 top-1/2 -translate-y-1/2 transition-all duration-300",
                      isMobile ? "opacity-50" : "opacity-0 group-hover:opacity-50",
                      isOutgoing ? "text-primary/60" : "text-secondary/60"
                    )}
                  />
                )}
                {originalText && isMobile && (
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-primary/30" />
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
              <p>{isMobile ? "Tap" : "Click"} to see original message</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="text-xs text-muted-foreground leading-none mt-1 block">{timestamp}</span>
      </div>
    </div>
  );
};