import { Card, CardHeader, CardTitle, CardContent, Button } from '@pt-app/shared-ui';
import { ArrowLeft, Calendar } from 'lucide-react';
import { trpc } from '../trpc-client';
import { formatDateTime } from '../utils/date';

interface PatientVisitsPageProps {
  patientId: string;
  clinicId: string;
  onBack: () => void;
  onVisitClick: (visitId: string, patientId: string) => void;
}

export default function PatientVisitsPage({
  patientId,
  onBack,
  onVisitClick,
}: PatientVisitsPageProps) {
  // Fetch patient data
  const { data: patient, isPending: patientPending } = trpc.patient.getById.useQuery({
    id: patientId,
  });

  // Fetch visits for this patient
  const { data: visits = [], isPending: visitsPending } = trpc.visit.getByPatient.useQuery({
    patientId,
  });

  const loading = patientPending || visitsPending;

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Loading visits...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <Button variant="ghost" onClick={onBack} className="w-fit">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Visits
        </Button>
        <p className="text-muted-foreground">Patient not found</p>
      </div>
    );
  }

  const displayName = patient.nickName || patient.firstName;

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} className="w-fit">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Visits
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {displayName} {patient.lastName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {visits.length} {visits.length === 1 ? 'visit' : 'visits'}
          </p>
        </div>
      </div>

      {/* Visits list */}
      {visits.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No visits found for this patient</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {visits.map((visit) => (
            <Card
              key={visit.id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onVisitClick(visit.id, patientId)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDateTime(visit.visitDate)}
                  </CardTitle>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
