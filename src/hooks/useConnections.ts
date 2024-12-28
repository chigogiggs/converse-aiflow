import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Connection } from "@/integrations/supabase/types/tables";
import { toast } from "sonner";

export const useConnections = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingReceived, setPendingReceived] = useState<Connection[]>([]);
  const [pendingSent, setPendingSent] = useState<Connection[]>([]);

  const fetchConnections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch accepted connections where user is requester
      const { data: requesterConnections, error: requesterError } = await supabase
        .from('connections')
        .select(`
          *,
          recipient:profiles!connections_recipient_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            created_at,
            updated_at
          )
        `)
        .eq('requester_id', user.id)
        .eq('status', 'accepted');

      if (requesterError) throw requesterError;

      // Fetch accepted connections where user is recipient
      const { data: recipientConnections, error: recipientError } = await supabase
        .from('connections')
        .select(`
          *,
          requester:profiles!connections_requester_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            created_at,
            updated_at
          )
        `)
        .eq('recipient_id', user.id)
        .eq('status', 'accepted');

      if (recipientError) throw recipientError;

      // Fetch pending received requests
      const { data: receivedData, error: receivedError } = await supabase
        .from('connections')
        .select(`
          *,
          requester:profiles!connections_requester_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            created_at,
            updated_at
          )
        `)
        .eq('recipient_id', user.id)
        .eq('status', 'pending');

      if (receivedError) throw receivedError;

      // Fetch pending sent requests
      const { data: sentData, error: sentError } = await supabase
        .from('connections')
        .select(`
          *,
          recipient:profiles!connections_recipient_id_fkey (
            id,
            username,
            display_name,
            avatar_url,
            created_at,
            updated_at
          )
        `)
        .eq('requester_id', user.id)
        .eq('status', 'pending');

      if (sentError) throw sentError;

      // Process and combine connections
      const allConnections = [
        ...(requesterConnections || []).map(conn => ({
          ...conn,
          profiles: null,
          recipient: conn.recipient
        })),
        ...(recipientConnections || []).map(conn => ({
          ...conn,
          profiles: conn.requester,
          recipient: null
        }))
      ];

      const receivedConnections = (receivedData || []).map(conn => ({
        ...conn,
        profiles: conn.requester,
        recipient: null
      }));

      const sentConnections = (sentData || []).map(conn => ({
        ...conn,
        profiles: null,
        recipient: conn.recipient
      }));

      setConnections(allConnections);
      setPendingReceived(receivedConnections);
      setPendingSent(sentConnections);
    } catch (error: any) {
      toast.error("Error fetching connections");
      console.error("Error fetching connections:", error);
    }
  };

  const handleAccept = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (error) throw error;

      toast.success("Connection accepted");
      fetchConnections();
    } catch (error: any) {
      toast.error("Error accepting connection");
      console.error("Error accepting connection:", error);
    }
  };

  const handleReject = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      toast.success("Connection rejected");
      fetchConnections();
    } catch (error: any) {
      toast.error("Error rejecting connection");
      console.error("Error rejecting connection:", error);
    }
  };

  useEffect(() => {
    fetchConnections();

    // Subscribe to real-time updates for new connection requests
    const channel = supabase
      .channel('connections-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'connections',
          filter: `recipient_id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}`
        },
        (payload) => {
          console.log('New connection request:', payload);
          toast.info("New connection request");
          fetchConnections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    connections,
    pendingReceived,
    pendingSent,
    handleAccept,
    handleReject,
  };
};