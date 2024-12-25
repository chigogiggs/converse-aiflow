import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatHeader } from "@/components/ChatHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LanguageSelector } from "@/components/LanguageSelector";

interface ChatContainerProps {
  selectedConnection: string;
}

export const ChatContainer = ({ selectedConnection }: ChatContainerProps) => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  
  const { messages, sendMessage } = useChatMessages(selectedConnection);
  const { 
    outgoingLanguage, 
    setOutgoingLanguage, 
    incomingLanguage, 
    setIncomingLanguage 
  } = useUserPreferences();

  // Subscribe to typing indicators
  useEffect(() => {
    if (!selectedConnection) return;

    const channel = supabase.channel('typing_indicator')
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId === selectedConnection) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 2000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConnection]);

  const handleSendMessage = async (message: string) => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key to enable translations",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendMessage(message, apiKey);
      toast({
        title: "Message sent",
        description: "Your message has been sent and will be translated",
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
        payload: { userId: selectedConnection }
      });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      <ChatHeader
        recipientName="John Doe"
        onSettingsClick={() => {}}
      />
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={showOriginal && message.originalText ? message.originalText : message.text}
              isOutgoing={message.isOutgoing}
              timestamp={message.timestamp}
              isTranslating={message.isTranslating}
            />
          ))}
          {isTyping && (
            <div className="text-sm text-gray-500 italic">
              User is typing...
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
        <ChatInput 
          onSendMessage={handleSendMessage} 
          onTyping={handleTyping}
        />
      </div>
    </div>
  );
};