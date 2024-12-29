import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image, Mic } from "lucide-react";
import { fileToBase64, audioToBase64 } from "@/utils/mediaUtils";
import { toast } from "@/hooks/use-toast";

interface MediaHandlersProps {
  onSendMessage: (message: string, type?: 'text' | 'image' | 'voice', mediaContent?: string) => void;
}

export const MediaHandlers = ({ onSendMessage }: MediaHandlersProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64Content = await fileToBase64(file);
      onSendMessage(file.name, 'image', base64Content);
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error",
        description: "Failed to process image",
        variant: "destructive",
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        setAudioChunks(chunks => [...chunks, e.data]);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const base64Content = await audioToBase64(audioBlob);
        onSendMessage('Voice message', 'voice', base64Content);
        setAudioChunks([]);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Failed to start recording",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleImageClick}
        className="rounded-full"
      >
        <Image className="h-5 w-5 text-gray-600" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        className={`rounded-full ${isRecording ? 'bg-red-100 text-red-600' : ''}`}
      >
        <Mic className="h-5 w-5 text-gray-600" />
      </Button>
    </div>
  );
};