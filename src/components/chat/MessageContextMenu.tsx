import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { MessageCircleReply, Trash2, Star, Pin, Copy } from "lucide-react";
import { Message } from "@/types/message.types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

interface MessageContextMenuProps {
  children: React.ReactNode;
  message: Message;
  onReply: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onPin: (messageId: string) => void;
  onStar: (messageId: string) => void;
}

export const MessageContextMenu = ({
  children,
  message,
  onReply,
  onDelete,
  onPin,
  onStar,
}: MessageContextMenuProps) => {
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      toast({
        title: "Copied to clipboard",
        description: "Message text has been copied",
      });
    } catch (error) {
      console.error('Error copying text:', error);
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive",
      });
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger className="block">
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-[#1A1F2C] border-[#7E69AB]/20">
        <ContextMenuItem
          className="flex items-center gap-2 text-[#C8C8C9] hover:bg-[#403E43] cursor-pointer"
          onClick={() => onReply(message)}
        >
          <MessageCircleReply className="h-4 w-4" />
          Reply
        </ContextMenuItem>
        <ContextMenuItem
          className="flex items-center gap-2 text-[#C8C8C9] hover:bg-[#403E43] cursor-pointer"
          onClick={handleCopy}
        >
          <Copy className="h-4 w-4" />
          Copy
        </ContextMenuItem>
        <ContextMenuItem
          className="flex items-center gap-2 text-[#C8C8C9] hover:bg-[#403E43] cursor-pointer"
          onClick={() => onPin(message.id)}
        >
          <Pin className="h-4 w-4" />
          Pin
        </ContextMenuItem>
        <ContextMenuItem
          className="flex items-center gap-2 text-[#C8C8C9] hover:bg-[#403E43] cursor-pointer"
          onClick={() => onStar(message.id)}
        >
          <Star className="h-4 w-4" />
          Star
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};