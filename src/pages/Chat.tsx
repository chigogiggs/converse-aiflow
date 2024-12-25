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
import { Navigation } from "@/components/Navigation";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useUserPreferences } from "@/hooks/useUserPreferences";

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
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
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
                        message={message.text}
                        isOutgoing={message.isOutgoing}
                        timestamp={message.timestamp}
                        isTranslating={message.isTranslating}
                      />
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t">
                  <div className="grid grid-cols-2 gap-4 mb-4">
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
                  <div className="mb-4">
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
                  <ChatInput onSendMessage={handleSendMessage} />
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
      </div>
    </div>
  );
};

export default Chat;