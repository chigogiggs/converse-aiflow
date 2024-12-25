import { Pin } from "lucide-react";

interface PinnedMessagesProps {
  messages: Array<{
    id: string;
    text: string;
  }>;
  pinnedMessages: string[];
}

export const PinnedMessages = ({ messages, pinnedMessages }: PinnedMessagesProps) => {
  if (pinnedMessages.length === 0) return null;

  return (
    <div className="p-2 bg-gray-50 border-b">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Pinned Messages</h3>
      <div className="space-y-2">
        {messages
          .filter(msg => pinnedMessages.includes(msg.id))
          .map(msg => (
            <div key={msg.id} className="text-sm text-gray-600 flex items-center gap-2">
              <Pin className="h-3 w-3" />
              <span>{msg.text}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
};