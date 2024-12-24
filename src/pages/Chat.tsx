import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  text: string;
  isOutgoing: boolean;
  timestamp: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [outgoingLanguage, setOutgoingLanguage] = useState("en");
  const [incomingLanguage, setIncomingLanguage] = useState("en");

  const handleSendMessage = async (message: string) => {
    // Add outgoing message
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isOutgoing: true,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, newMessage]);

    // Simulate receiving a response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: `Response to: ${message}`,
        isOutgoing: false,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, response]);
      
      toast({
        title: "Message translated",
        description: `Message successfully translated to ${incomingLanguage.toUpperCase()}`,
      });
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Chat Translator</h1>
        <Button onClick={() => navigate("/")} variant="outline">
          Back to Home
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <LanguageSelector
          value={outgoingLanguage}
          onChange={setOutgoingLanguage}
          label="Your message language"
        />
        <LanguageSelector
          value={incomingLanguage}
          onChange={setIncomingLanguage}
          label="Translate incoming messages to"
        />
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.text}
              isOutgoing={message.isOutgoing}
              timestamp={message.timestamp}
            />
          ))}
        </div>
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default Chat;