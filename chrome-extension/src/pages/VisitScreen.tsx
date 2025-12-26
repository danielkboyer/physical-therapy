import { Card, CardHeader, CardTitle, CardContent, Button } from '@pt-app/shared-ui';
import { trpc } from '../trpc-client';
import { formatDateTime, formatTime } from '../utils/date';
import PageHeader from '../components/PageHeader';

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
  const { data: visit, isPending: visitPending } = trpc.visit.getById.useQuery({
    id: visitId,
  });

  const { data: patient, isPending: patientPending } = trpc.patient.getById.useQuery(
    { id: visit?.patientId || '' },
    { enabled: !!visit?.patientId }
  );

  const { data: recordings = [], isPending: recordingsPending } = trpc.recording.getByVisit.useQuery({
    visitId,
  });

  const loading = visitPending || patientPending || recordingsPending;

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Loading visit...</p>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeader title="Visit not found" onBack={onBack} />
        <p className="text-muted-foreground">Visit not found</p>
      </div>
    );
  }

  const patientName = patient
    ? `${patient.firstName} ${patient.lastName}${patient.nickName ? ` (${patient.nickName})` : ''}`
    : 'Loading...';

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title={patientName} onBack={onBack} />

      <div className="flex flex-col gap-4">
        <div>
          <p className="text-lg">
            <span className="font-semibold">Visit:</span> {formatDateTime(new Date(visit.visitDate))}
          </p>
        </div>

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
    </div>
  );
}
