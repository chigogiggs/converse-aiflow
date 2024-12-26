import { useState } from "react";
import { Connection } from "@/integrations/supabase/types/tables";

export const useConnections = () => {
  const [connections] = useState<Connection[]>([]);
  const [pendingReceived] = useState<Connection[]>([]);
  const [pendingSent] = useState<Connection[]>([]);

  const handleAccept = async (connectionId: string) => {
    console.log('Connection accept disabled - no database');
  };

  const handleReject = async (connectionId: string) => {
    console.log('Connection reject disabled - no database');
  };

  return {
    connections,
    pendingReceived,
    pendingSent,
    handleAccept,
    handleReject,
  };
};