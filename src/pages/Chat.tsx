import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  isOutgoing: boolean;
  timestamp: string;
  isTranslating?: boolean;
}

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [outgoingLanguage, setOutgoingLanguage] = useState("en");
  const [incomingLanguage, setIncomingLanguage] = useState("en");
  const [apiKey, setApiKey] = useState("");

  const translateMessage = async (text: string, targetLanguage: string) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate the following text to ${targetLanguage}. Only respond with the translation, nothing else.`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key to enable translations",
        variant: "destructive",
      });
      return;
    }

    // Add outgoing message
    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isOutgoing: true,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, newMessage]);

    try {
      // Translate and send response
      const translatedMessage = await translateMessage(message, incomingLanguage);
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: translatedMessage,
        isOutgoing: false,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setMessages((prev) => [...prev, response]);
      
      toast({
        title: "Message translated",
        description: `Message successfully translated to ${incomingLanguage.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Translation failed",
        description: "Failed to translate the message. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Chat Translator</h1>
        <Button onClick={() => navigate("/")} variant="outline">
          Back to Home
        </Button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          OpenAI API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your OpenAI API key"
          className="w-full p-2 border rounded-md"
        />
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
              isTranslating={message.isTranslating}
            />
          ))}
        </div>
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default Chat;