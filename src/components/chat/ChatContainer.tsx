import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatHeader } from "@/components/ChatHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";
import { ChatSettings } from "./ChatSettings";
import { ChatSearch } from "./ChatSearch";
import { PinnedMessages } from "./PinnedMessages";

interface Message {
  id: string;
  text: string;
  isOutgoing: boolean;
  timestamp: string;
  isTranslating?: boolean;
  originalText?: string;
  isPinned?: boolean;
  isEdited?: boolean;
}

export const ChatContainer = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<string[]>([]);
  const [outgoingLanguage, setOutgoingLanguage] = useState("en");
  const [incomingLanguage, setIncomingLanguage] = useState("en");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Subscribe to typing indicators
  useEffect(() => {
    const channel = supabase.channel('typing_indicator')
      .on('broadcast', { event: 'typing' }, () => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key in settings to enable translations",
        variant: "destructive",
      });
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isOutgoing: true,
      timestamp: new Date().toLocaleTimeString(),
      isTranslating: true,
    };

    setMessages(prev => [...prev, newMessage]);

    try {
      const { data: translatedMessage, error } = await supabase.functions.invoke('translate-message', {
        body: { text, sourceLanguage: outgoingLanguage, targetLanguage: incomingLanguage }
      });

      if (error) throw error;

      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id 
          ? { 
              ...msg, 
              text: translatedMessage.translatedText,
              originalText: text,
              isTranslating: false 
            }
          : msg
      ));

      toast({
        title: "Message sent",
        description: "Your message has been translated and sent",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTyping = async () => {
    await supabase.channel('typing_indicator')
      .send({
        type: 'broadcast',
        event: 'typing',
        payload: { language: outgoingLanguage }
      });
  };

  const togglePinMessage = (messageId: string) => {
    setPinnedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const filteredMessages = messages.filter(message =>
    message.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (message.originalText?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)] bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      <ChatHeader
        recipientName="Chat"
        onSettingsClick={() => {}}
      />
      
      <div className="flex items-center gap-2 p-2 border-b dark:border-gray-800">
        <ChatSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <ChatSettings
          outgoingLanguage={outgoingLanguage}
          incomingLanguage={incomingLanguage}
          apiKey={apiKey}
          setOutgoingLanguage={setOutgoingLanguage}
          setIncomingLanguage={setIncomingLanguage}
          setApiKey={setApiKey}
        />
      </div>

      {pinnedMessages.length > 0 && (
        <PinnedMessages messages={messages} pinnedMessages={pinnedMessages} />
      )}

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <div key={message.id} className="group relative">
              <ChatMessage
                message={showOriginal && message.originalText ? message.originalText : message.text}
                isOutgoing={message.isOutgoing}
                timestamp={message.timestamp}
                isTranslating={message.isTranslating}
                originalText={message.originalText}
              />
            </div>
          ))}
          {isTyping && (
            <div className="text-sm text-gray-500 dark:text-gray-400 italic flex items-center gap-2">
              <Smile className="h-4 w-4 animate-bounce" />
              Typing in {outgoingLanguage}...
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t dark:border-gray-800">
        <div className="flex justify-between items-center p-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOriginal(!showOriginal)}
          >
            {showOriginal ? "Show Translated" : "Show Original"}
          </Button>
        </div>
        <ChatInput 
          onSendMessage={handleSendMessage} 
          onTyping={handleTyping}
        />
      </div>
    </div>
  );
};