import { SignupSlide } from "./SignupSlide";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Image } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ProfilePictureSlideProps {
  avatarUrl: string;
  username: string;
  onAvatarChange: (url: string) => void;
}

export const ProfilePictureSlide = ({
  avatarUrl,
  username,
  onAvatarChange,
}: ProfilePictureSlideProps) => {
  return (
    <SignupSlide
      title="Add a profile picture"
      description="Help others recognize you"
    >
      <div className="flex flex-col items-center gap-4">
        <UserAvatar
          src={avatarUrl}
          fallback={username?.[0]?.toUpperCase() || "?"}
          size="lg"
        />
        <div className="relative">
          <Input
            type="file"
            accept="image/*"
            className="hidden"
            id="avatar-upload"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  onAvatarChange(e.target?.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById("avatar-upload")?.click()}
          >
            <Image className="w-4 h-4 mr-2" />
            Upload Photo
          </Button>
        </div>
      </div>
    </SignupSlide>
  );
};