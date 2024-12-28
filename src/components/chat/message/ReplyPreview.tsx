import { cn } from "@/lib/utils";

interface ReplyPreviewProps {
  senderName: string;
  text: string;
  isOutgoing: boolean;
}

export const ReplyPreview = ({ senderName, text, isOutgoing }: ReplyPreviewProps) => {
  return (
    <div className={cn(
      "text-xs text-white/50 mb-1 px-3 py-1 rounded-lg",
      isOutgoing ? "bg-primary/10" : "bg-secondary/10"
    )}>
      <span className="font-medium">{senderName}</span>
      <p className="truncate">{text}</p>
    </div>
  );
};