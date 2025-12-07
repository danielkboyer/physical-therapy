import { Card, CardHeader, CardTitle, CardContent, Button } from '@pt-app/shared-ui';
import { ArrowLeft } from 'lucide-react';
import { trpc } from '../trpc-client';
import { formatDateTime, formatTime } from '../utils/date';

interface VisitScreenProps {
  visitId: string;
  onBack: () => void;
  onRecordingClick: (recordingId: string) => void;
}

export default function VisitScreen({
  visitId,
  onBack,
  onRecordingClick,
}: VisitScreenProps) {
  const { data: visit, isLoading: visitLoading } = trpc.visit.getById.useQuery({
    id: visitId,
  });

  const { data: patient, isLoading: patientLoading } = trpc.patient.getById.useQuery(
    { id: visit?.patientId || '' },
    { enabled: !!visit?.patientId }
  );

  const { data: recordings = [], isLoading: recordingsLoading } = trpc.recording.getByVisit.useQuery({
    visitId,
  });

  const loading = visitLoading || patientLoading || recordingsLoading;

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Loading visit...</p>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <Button variant="ghost" onClick={onBack} className="w-fit">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <p className="text-muted-foreground">Visit not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Button variant="ghost" onClick={onBack} className="w-fit">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Visit Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {patient && (
              <div>
                <p className="text-sm text-muted-foreground">Patient</p>
                <p className="font-medium">
                  {patient.firstName} {patient.lastName}
                  {patient.nickName && ` (${patient.nickName})`}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Date & Time</p>
              <p className="font-medium">{formatDateTime(new Date(visit.visitDate))}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recordings</CardTitle>
        </CardHeader>
        <CardContent>
          {recordings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recordings yet. Click a recording button to start.
            </p>
          ) : (
            <div className="space-y-2">
              {recordings.map((recording, index) => (
                <Button
                  key={recording.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onRecordingClick(recording.id)}
                >
                  <div className="text-left">
                    <div className="font-medium">Recording {index + 1}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatTime(new Date(recording.createdAt))}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
