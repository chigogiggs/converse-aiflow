import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Mic } from "lucide-react";

interface ChatInputActionsProps {
  onImageClick: () => void;
  onVoiceMessage?: () => void;
}

export const ChatInputActions = ({ onImageClick, onVoiceMessage }: ChatInputActionsProps) => {
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="rounded-full hover:bg-gray-100 h-8 w-8"
        onClick={onImageClick}
      >
        <ImageIcon className="h-4 w-4 text-gray-600" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="rounded-full hover:bg-gray-100 h-8 w-8"
        onClick={onVoiceMessage}
      >
        <Mic className="h-4 w-4 text-gray-600" />
      </Button>
    </div>
  );
};