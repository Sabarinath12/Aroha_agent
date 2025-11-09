import { useState, useRef } from "react";
import { Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MicrophoneButtonProps {
  onRecordingStart?: () => void;
  onRecordingStop?: (transcript: string, response: string) => void;
}

export default function MicrophoneButton({ onRecordingStart, onRecordingStop }: MicrophoneButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleToggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    } else {
      // Start recording
      if (!navigator.mediaDevices?.getUserMedia) {
        toast({
          title: "Microphone not available",
          description: "Your browser doesn't support audio recording",
          variant: "destructive",
        });
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          setIsProcessing(true);
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          
          // Send to backend for transcription
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");

          try {
            const response = await fetch("/api/transcribe", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              throw new Error("Transcription failed");
            }

            const data = await response.json();
            
            if (data.error) {
              throw new Error(data.error);
            }
            
            onRecordingStop?.(data.transcript, data.response);
            
            toast({
              title: "Conversation ended",
              description: "Voice input processed successfully",
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Failed to process voice input";
            toast({
              title: "Processing failed",
              description: errorMessage,
              variant: "destructive",
            });
          } finally {
            setIsProcessing(false);
            stream.getTracks().forEach(track => track.stop());
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
        onRecordingStart?.();
        
        toast({
          title: "Conversation started",
          description: "Speak now...",
        });
      } catch (error) {
        toast({
          title: "Microphone access denied",
          description: "Please allow microphone access",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="relative group">
        <button
          onClick={handleToggleRecording}
          disabled={isProcessing}
          data-testid="button-microphone"
          className={`relative w-20 h-20 rounded-full transition-all duration-300 cursor-pointer border-2 flex items-center justify-center ${
            isProcessing
              ? "bg-black/80 border-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.6)] animate-pulse cursor-wait"
              : isRecording 
              ? "bg-black/80 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.6)] scale-105 animate-pulse" 
              : "bg-black/70 border-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:shadow-[0_0_45px_rgba(6,182,212,0.7)] hover:scale-105 hover:bg-black/85"
          }`}
        >
          <Mic 
            className={`transition-all duration-300 ${
              isProcessing
                ? "w-8 h-8 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.9)]"
                : isRecording 
                ? "w-8 h-8 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.9)]" 
                : "w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] group-hover:drop-shadow-[0_0_12px_rgba(6,182,212,1)]"
            }`}
          />
        </button>
        
        {isRecording && (
          <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.9)]" data-testid="indicator-recording" />
        )}
        
        {isProcessing && (
          <div className="absolute top-0 right-0 w-4 h-4 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(234,179,8,0.9)]" data-testid="indicator-processing" />
        )}
      </div>
    </div>
  );
}
