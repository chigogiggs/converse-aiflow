import { useState } from "react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from "lucide-react";

export const DeleteAllDataButton = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAll = async () => {
    try {
      setIsDeleting(true);

      // Delete all data from tables in correct order
      await supabase.from('messages').delete().neq('id', '0');
      await supabase.from('connections').delete().neq('id', '0');
      await supabase.from('user_preferences').delete().neq('id', '0');
      await supabase.from('profiles').delete().neq('id', '0');

      // Delete all users from auth.users (this will cascade to profiles)
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) throw usersError;

      for (const user of users || []) {
        await supabase.auth.admin.deleteUser(user.id);
      }

      toast({
        title: "Success",
        description: "All data and users have been deleted",
      });
    } catch (error: any) {
      console.error('Error deleting data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete data",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleDeleteAll}
      disabled={isDeleting}
      className="w-full"
    >
      {isDeleting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Deleting...
        </>
      ) : (
        <>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete All Data
        </>
      )}
    </Button>
  );
};