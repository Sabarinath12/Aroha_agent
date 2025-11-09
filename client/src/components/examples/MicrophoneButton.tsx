import MicrophoneButton from '../MicrophoneButton';

export default function MicrophoneButtonExample() {
  return (
    <div className="h-screen bg-background relative">
      <MicrophoneButton 
        onRecordingStart={() => {
          console.log('Recording started');
        }}
        onRecordingStop={(transcript) => {
          console.log('Recording stopped. Transcript:', transcript);
        }}
      />
    </div>
  );
}
