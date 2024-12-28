import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Connection } from "@/integrations/supabase/types/tables";
import { toast } from "sonner";

export const useConnections = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingReceived, setPendingReceived] = useState<Connection[]>([]);
  const [pendingSent, setPendingSent] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConnections = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return;
      }

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

      if (requesterError) {
        console.error("Error fetching requester connections:", requesterError);
        throw requesterError;
      }

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

      if (recipientError) {
        console.error("Error fetching recipient connections:", recipientError);
        throw recipientError;
      }

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

      if (receivedError) {
        console.error("Error fetching received requests:", receivedError);
        throw receivedError;
      }

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

      if (sentError) {
        console.error("Error fetching sent requests:", sentError);
        throw sentError;
      }

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
      console.error("Error in fetchConnections:", error);
      toast.error("Error fetching connections");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (connectionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to accept connections");
        return;
      }

      // First verify that this connection is actually pending and belongs to the user
      const { data: connection, error: verifyError } = await supabase
        .from('connections')
        .select('*')
        .eq('id', connectionId)
        .eq('recipient_id', user.id)
        .eq('status', 'pending')
        .single();

      if (verifyError || !connection) {
        console.error("Error verifying connection:", verifyError);
        toast.error("Unable to verify connection request");
        return;
      }

      const { error: updateError } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId)
        .eq('recipient_id', user.id);

      if (updateError) {
        console.error("Error accepting connection:", updateError);
        toast.error("Error accepting connection request");
        return;
      }

      toast.success("Connection accepted");
      await fetchConnections();
    } catch (error: any) {
      console.error("Error in handleAccept:", error);
      toast.error("Error accepting connection");
    }
  };

  const handleReject = async (connectionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to reject connections");
        return;
      }

      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId)
        .eq('recipient_id', user.id);

      if (error) {
        console.error("Error rejecting connection:", error);
        toast.error("Error rejecting connection request");
        return;
      }

      toast.success("Connection rejected");
      await fetchConnections();
    } catch (error: any) {
      console.error("Error in handleReject:", error);
      toast.error("Error rejecting connection");
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
    isLoading,
  };
};
