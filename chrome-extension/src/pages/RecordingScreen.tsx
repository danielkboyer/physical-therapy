import { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Textarea } from '@pt-app/shared-ui';
import { ArrowLeft, Mic, Square } from 'lucide-react';
import { trpc } from '../trpc-client';

interface RecordingScreenProps {
  recordingId?: string;
  visitId: string;
  onBack: () => void;
}

export default function RecordingScreen({
  recordingId,
  visitId,
  onBack,
}: RecordingScreenProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [audioData, setAudioData] = useState<string | undefined>(undefined);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Load existing recording if recordingId is provided
  const { data: existingRecording, isLoading } = trpc.recording.getById.useQuery(
    { id: recordingId || '' },
    { enabled: !!recordingId }
  );

  const createRecordingMutation = trpc.recording.create.useMutation();
  const updateRecordingMutation = trpc.recording.update.useMutation();

  useEffect(() => {
    if (existingRecording) {
      setTranscription(existingRecording.transcription);
      setAudioData(existingRecording.audioData);
    }
  }, [existingRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setAudioData(base64Audio);

          // TODO: Send audio to transcription service
          // For now, append placeholder text
          setTranscription(prev =>
            prev + (prev ? '\n\n' : '') + '[New recording transcription will appear here]'
          );
        };

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSave = async () => {
    try {
      if (recordingId) {
        // Update existing recording
        await updateRecordingMutation.mutateAsync({
          id: recordingId,
          audioData,
          transcription,
        });
      } else {
        // Create new recording
        await createRecordingMutation.mutateAsync({
          visitId,
          audioData,
          transcription,
        });
      }
      onBack();
    } catch (error) {
      console.error('Error saving recording:', error);
      alert('Failed to save recording. Please try again.');
    }
  };

  const handleAutofillPrompt = () => {
    // TODO: Implement autofill prompt functionality
    console.log('Autofill Prompt clicked - to be implemented');
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Loading recording...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Button variant="ghost" onClick={onBack} className="w-fit">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Visit
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Recording</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {!isRecording ? (
              <Button onClick={startRecording}>
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive">
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            )}
            {isRecording && (
              <div className="flex items-center text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                Recording...
              </div>
            )}
          </div>

          <div>
            <label htmlFor="transcription" className="text-sm font-medium mb-2 block">
              Transcription
            </label>
            <Textarea
              id="transcription"
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              placeholder="Transcription will appear here... You can also type directly."
              rows={10}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAutofillPrompt} variant="outline" className="flex-1">
              Autofill Prompt
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={createRecordingMutation.isPending || updateRecordingMutation.isPending}
            >
              {createRecordingMutation.isPending || updateRecordingMutation.isPending
                ? 'Saving...'
                : 'Save Recording'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
