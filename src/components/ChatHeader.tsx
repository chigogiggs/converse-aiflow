import { Button } from "./ui/button";
import { UserAvatar } from "./UserAvatar";
import { Phone, Video, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatHeaderProps {
  recipientName: string;
  recipientAvatar?: string;
}

export const ChatHeader = ({ recipientName, recipientAvatar }: ChatHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between border-b p-4 bg-white shadow-sm animate-fade-in">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/home')}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <UserAvatar
          src={recipientAvatar}
          fallback={recipientName[0]}
          size="lg"
        />
        <div className="animate-fade-in">
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
      </div>
    </div>
  );
};