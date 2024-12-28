import { UserAvatar } from "@/components/UserAvatar";

interface MessageAvatarProps {
  avatarUrl?: string;
  displayName?: string;
  isOutgoing: boolean;
}

export const MessageAvatar = ({ avatarUrl, displayName, isOutgoing }: MessageAvatarProps) => {
  return (
    <div className="flex-shrink-0">
      <UserAvatar
        src={avatarUrl}
        fallback={displayName?.[0] || "?"}
        size="sm"
      />
    </div>
  );
};