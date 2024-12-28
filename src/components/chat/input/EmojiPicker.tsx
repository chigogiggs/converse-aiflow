import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: any) => void;
}

export const EmojiPicker = ({ onEmojiSelect }: EmojiPickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full hover:bg-gray-100 h-8 w-8 p-0"
        >
          <Smile className="h-4 w-4 text-gray-600" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 border-none" align="end">
        <Picker
          data={data}
          onEmojiSelect={onEmojiSelect}
          theme="dark"
        />
      </PopoverContent>
    </Popover>
  );
};