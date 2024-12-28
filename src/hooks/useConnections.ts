import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Connection, Profile } from "@/integrations/supabase/types/tables";
import { toast } from "sonner";

// Type guard to check if an object is a valid Profile
const isValidProfile = (profile: any): profile is Profile => {
  return (
    profile &&
    typeof profile.id === 'string' &&
    typeof profile.username === 'string' &&
    typeof profile.display_name === 'string'
  );
};

// Type guard to check if an object is a valid Connection with profiles
const isValidConnection = (connection: any): connection is Connection => {
  return (
    connection &&
    typeof connection.id === 'string' &&
    typeof connection.requester_id === 'string' &&
    typeof connection.recipient_id === 'string' &&
    typeof connection.status === 'string' &&
    isValidProfile(connection.profiles)
  );
};

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
          recipient:profiles!connections_profiles_recipient_fk(*)
        `)
        .eq('requester_id', user.id)
        .eq('status', 'accepted');

      if (requesterError) throw requesterError;

      // Fetch accepted connections where user is recipient
      const { data: recipientConnections, error: recipientError } = await supabase
        .from('connections')
        .select(`
          *,
          profiles:profiles!connections_profiles_requester_fk(*)
        `)
        .eq('recipient_id', user.id)
        .eq('status', 'accepted');

      if (recipientError) throw recipientError;

      // Process and combine connections
      const validRequesterConnections = (requesterConnections || [])
        .filter(conn => conn.recipient)
        .map(conn => ({
          ...conn,
          profiles: conn.recipient
        }))
        .filter(isValidConnection);

      const validRecipientConnections = (recipientConnections || [])
        .filter(isValidConnection);

      const allConnections = [...validRequesterConnections, ...validRecipientConnections];

      // Fetch pending received requests
      const { data: receivedData, error: receivedError } = await supabase
        .from('connections')
        .select(`
          *,
          profiles:profiles!connections_profiles_requester_fk(*)
        `)
        .eq('recipient_id', user.id)
        .eq('status', 'pending');

      if (receivedError) throw receivedError;

      // Fetch pending sent requests
      const { data: sentData, error: sentError } = await supabase
        .from('connections')
        .select(`
          *,
          profiles:profiles!connections_profiles_recipient_fk(*)
        `)
        .eq('requester_id', user.id)
        .eq('status', 'pending');

      if (sentError) throw sentError;

      setConnections(allConnections);
      setPendingReceived((receivedData || []).filter(isValidConnection));
      setPendingSent((sentData || []).filter(isValidConnection));
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