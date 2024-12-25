import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UserAvatarProps {
  src?: string;
  fallback: string;
  size?: "sm" | "md" | "lg";
  userId?: string;
  editable?: boolean;
}

export const UserAvatar = ({ src, fallback, size = "md", userId, editable = false }: UserAvatarProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    try {
      setIsUploading(true);

      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target?.result as string;
        
        // Update profile with base64 string
        const { data, error } = await supabase
          .from('profiles')
          .update({ avatar_url: base64String })
          .eq('id', userId)
          .select()
          .maybeSingle();

        if (error) throw error;
        
        if (!data) {
          throw new Error("Profile not found");
        }

        toast({
          title: "Success",
          description: "Profile picture updated successfully",
        });
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={src} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      
      {editable && (
        <label 
          className="absolute bottom-0 right-0 cursor-pointer bg-white rounded-full p-1 shadow-md hover:bg-gray-50 transition-colors"
          htmlFor="avatar-upload"
        >
          <input
            id="avatar-upload"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </label>
      )}
    </div>
  );
};