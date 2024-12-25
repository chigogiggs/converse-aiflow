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
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [outgoingLanguage, setOutgoingLanguage] = useState("en");
  const [incomingLanguage, setIncomingLanguage] = useState("en");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      // Load user preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('preferred_language')
        .eq('user_id', session.user.id)
        .single();

      if (preferences) {
        setOutgoingLanguage(preferences.preferred_language);
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!selectedConnection) return;

    const fetchMessages = async () => {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${selectedConnection},recipient_id.eq.${selectedConnection}`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      const formattedMessages = messages.map(msg => ({
        id: msg.id,
        text: msg.translated_content || msg.content,
        isOutgoing: msg.sender_id === selectedConnection,
        timestamp: new Date(msg.created_at).toLocaleTimeString(),
      }));

      setMessages(formattedMessages);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${selectedConnection}`
        },
        (payload) => {
          const newMessage = payload.new;
          setMessages(prev => [...prev, {
            id: newMessage.id,
            text: newMessage.translated_content || newMessage.content,
            isOutgoing: false,
            timestamp: new Date(newMessage.created_at).toLocaleTimeString(),
          }]);
        }
      )
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newMessage = {
        sender_id: user.id,
        recipient_id: selectedConnection,
        content: message,
        source_language: outgoingLanguage,
        target_language: incomingLanguage,
      };

      const { error } = await supabase
        .from('messages')
        .insert([newMessage]);

      if (error) throw error;

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: message,
        isOutgoing: true,
        timestamp: new Date().toLocaleTimeString(),
      }]);

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