import { ScrollArea } from "@/components/ui/scroll-area";
import { ReactNode, forwardRef } from "react";

interface ScrollableMessageAreaProps {
  children: ReactNode;
}

export const ScrollableMessageArea = forwardRef<HTMLDivElement, ScrollableMessageAreaProps>(
  ({ children }, ref) => {
    return (
      <ScrollArea className="h-full px-4 py-2" ref={ref}>
        {children}
      </ScrollArea>
    );
  }
);

ScrollableMessageArea.displayName = "ScrollableMessageArea";