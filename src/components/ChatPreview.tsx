import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessage } from "@/components/ChatMessage";

interface ChatPreviewProps {
  user1: {
    name: string;
    image: string;
    message: string;
    language: string;
  };
  user2: {
    name: string;
    image: string;
    message: string;
    language: string;
  };
}

export const ChatPreview = ({ user1, user2 }: ChatPreviewProps) => {
  return (
    <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={user1.image} />
            <AvatarFallback>{user1.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user1.name}</p>
            <p className="text-sm text-gray-500">Speaking {user1.language}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="font-medium">{user2.name}</p>
            <p className="text-sm text-gray-500">Speaking {user2.language}</p>
          </div>
          <Avatar>
            <AvatarImage src={user2.image} />
            <AvatarFallback>{user2.name[0]}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="space-y-4">
        <ChatMessage
          message={user1.message}
          isOutgoing={false}
          timestamp="2 min ago"
          messageId="preview-1"
        />
        <ChatMessage
          message={user2.message}
          isOutgoing={true}
          timestamp="Just now"
          messageId="preview-2"
        />
      </div>
    </div>
  );
};