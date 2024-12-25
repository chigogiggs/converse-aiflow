import { Button } from "./ui/button";
import { UserAvatar } from "./UserAvatar";
import { Settings, Phone, Video } from "lucide-react";

interface ChatHeaderProps {
  recipientName: string;
  recipientAvatar?: string;
  onSettingsClick: () => void;
}

export const ChatHeader = ({ recipientName, recipientAvatar, onSettingsClick }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between border-b p-4">
      <div className="flex items-center space-x-4">
        <UserAvatar
          src={recipientAvatar}
          fallback={recipientName[0]}
          size="lg"
        />
        <div>
          <h2 className="text-xl font-semibold">{recipientName}</h2>
          <p className="text-sm text-gray-500">Online</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon">
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Video className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onSettingsClick}>
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};