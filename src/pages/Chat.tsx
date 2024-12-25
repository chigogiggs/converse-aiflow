import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/PageLayout";
import { ChatContainer } from "@/components/chat/ChatContainer";

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);

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

      // Set a default connection for testing
      setSelectedConnection(session.user.id);
    };

    checkAuth();
  }, [navigate, toast]);

  if (!selectedConnection) {
    return (
      <PageLayout showBackButton={false}>
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Loading chat...</h3>
            <p className="text-gray-500">Please wait while we set up your chat</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showBackButton={false}>
      <div className="h-[calc(100vh-12rem)]">
        <ChatContainer selectedConnection={selectedConnection} />
      </div>
    </PageLayout>
  );
};

export default Chat;