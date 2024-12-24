import { Hero } from "@/components/Hero";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  text: string;
  isOutgoing: boolean;
  timestamp: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputLanguage, setInputLanguage] = useState("en");
  const [outputLanguage, setOutputLanguage] = useState("es");
  const { toast } = useToast();

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isOutgoing: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Simulate translation delay
    setTimeout(() => {
      const translatedMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `[Translated] ${text}`,
        isOutgoing: false,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, translatedMessage]);
      
      toast({
        title: "Message translated",
        description: `Successfully translated to ${outputLanguage.toUpperCase()}`,
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4">
        <Hero />
        
        <div className="max-w-4xl mx-auto mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <LanguageSelector
              value={inputLanguage}
              onChange={setInputLanguage}
              label="I speak"
            />
            <LanguageSelector
              value={outputLanguage}
              onChange={setOutputLanguage}
              label="Translate to"
            />
          </div>
          
          <div className="h-[500px] overflow-y-auto p-4 space-y-4">
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
    </div>
  );
};

export default Index;