import { useState } from "react";
import { SignupHeader } from "@/components/SignupHeader";
import { LoginForm } from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const Login = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAllUsers = async () => {
    try {
      setIsDeleting(true);
      const { data: { users }, error: fetchError } = await supabase.auth.admin.listUsers();
      
      if (fetchError) throw fetchError;

      // Delete each user
      for (const user of users || []) {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        if (deleteError) {
          console.error(`Error deleting user ${user.id}:`, deleteError);
          throw deleteError;
        }
      }

      toast({
        title: "Success",
        description: "All users have been deleted",
      });
    } catch (error: any) {
      console.error("Error deleting users:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-white flex flex-col">
      <SignupHeader />
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <LoginForm />
        <Button 
          variant="destructive"
          className="mt-8"
          onClick={handleDeleteAllUsers}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting Users..." : "Delete All Users"}
        </Button>
      </div>
    </div>
  );
};

export default Login;