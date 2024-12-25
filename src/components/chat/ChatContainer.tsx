import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatHeader } from "@/components/ChatHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Settings2, Search, Pin, Smile } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LanguageSelector } from "@/components/LanguageSelector";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      <ChatHeader
        recipientName="Chat"
        onSettingsClick={() => {}}
      />
      
      <div className="flex items-center gap-2 p-2 border-b">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings2 className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Chat Settings</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4">
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
              <div>
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
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {pinnedMessages.length > 0 && (
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
      )}

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
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
              <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => togglePinMessage(message.id)}
                      >
                        <Pin className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {pinnedMessages.includes(message.id) ? 'Unpin message' : 'Pin message'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="text-sm text-gray-500 italic flex items-center gap-2">
              <Smile className="h-4 w-4 animate-bounce" />
              Typing in {outgoingLanguage}...
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex justify-between items-center mb-4">
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
