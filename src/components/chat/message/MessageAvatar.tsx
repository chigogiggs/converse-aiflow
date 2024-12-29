import { UserAvatar } from "@/components/UserAvatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface MessageAvatarProps {
  avatarUrl?: string;
  displayName?: string;
  isOutgoing: boolean;
}

export const MessageAvatar = ({ avatarUrl, displayName, isOutgoing }: MessageAvatarProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
          <UserAvatar
            src={avatarUrl}
            fallback={displayName?.[0] || "?"}
            size="sm"
          />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-center p-6">
          <img
            src={avatarUrl}
            alt={displayName || "Profile picture"}
            className="rounded-full w-64 h-64 object-cover"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};