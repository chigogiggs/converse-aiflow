import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarUploader } from "./AvatarUploader";

interface UserAvatarProps {
  src?: string;
  fallback: string;
  size?: "sm" | "md" | "lg";
  userId?: string;
  editable?: boolean;
}

export const UserAvatar = ({ 
  src, 
  fallback, 
  size = "md", 
  userId, 
  editable = false 
}: UserAvatarProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };

  const handleUploadSuccess = () => {
    window.location.reload();
  };

  return (
    <div className="relative">
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={src} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      
      {editable && userId && (
        <AvatarUploader 
          userId={userId} 
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};