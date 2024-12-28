import { useEffect, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { MessageCircleReply, Trash2, Star, Pin } from "lucide-react";
import { Message } from "@/types/message.types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const checkOwnership = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsOwner(user?.id === message.senderId);
    };
    checkOwnership();
  }, [message.senderId]);

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', message.id);

      if (error) throw error;
      onDelete(message.id);
      
      toast({
        title: "Message deleted",
        description: "The message has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete the message.",
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
        {isOwner && (
          <ContextMenuItem
            className="flex items-center gap-2 text-[#C8C8C9] hover:bg-[#403E43] cursor-pointer"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </ContextMenuItem>
        )}
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