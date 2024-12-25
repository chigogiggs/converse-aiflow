import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { useToast } from "@/hooks/use-toast";
import { ConnectionsList } from "@/components/ConnectionsList";
import { ChatHeader } from "@/components/ChatHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Message {
  id: string;
  text: string;
  isOutgoing: boolean;
  timestamp: string;
  isTranslating?: boolean;
  originalText?: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
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

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        console.error("Auth error:", error);
        toast({
          title: "Authentication Required",
          description: "Please log in to continue",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }
    };

    checkAuth();
  }, [navigate, toast]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!selectedConnection) return;

    const channel = supabase.channel('typing_indicator')
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId === selectedConnection) {
          setIsTyping(true);
          // Clear typing indicator after 2 seconds
          setTimeout(() => setIsTyping(false), 2000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConnection]);

  const handleSendMessage = async (message: string) => {
    if (!selectedConnection) {
      toast({
        title: "No recipient selected",
        description: "Please select a connection to start chatting",
        variant: "destructive",
      });
      return;
    }

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
    if (!selectedConnection) return;

    await supabase.channel('typing_indicator')
      .send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: selectedConnection }
      });
  };

  return (
    <PageLayout showBackButton={false}>
      <div className="grid grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
        {/* Sidebar */}
        <div className="col-span-1 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Connections</h2>
          </div>
          <ConnectionsList onSelectConnection={setSelectedConnection} />
        </div>

        {/* Chat Area */}
        <div className="col-span-3 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
          {selectedConnection ? (
            <>
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
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Select a Connection</h3>
                <p className="text-gray-500">Choose a connection to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default Chat;