import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";

interface AvatarUploaderProps {
  userId: string;
  onSuccess?: () => void;
}

export const AvatarUploader = ({ userId, onSuccess }: AvatarUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { createOrUpdateProfile } = useProfile();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target?.result as string;
        
        try {
          await createOrUpdateProfile(userId, base64String);
          
          toast({
            title: "Success",
            description: "Profile picture updated successfully",
          });

          onSuccess?.();
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message || "Failed to update profile picture",
            variant: "destructive",
          });
        }
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
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
  );
};