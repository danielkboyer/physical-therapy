import { Card, CardHeader, CardTitle, CardContent } from '@pt-app/shared-ui';
import { Calendar } from 'lucide-react';
import { trpc } from '../trpc-client';
import { formatDateTime } from '../utils/date';
import PageHeader from '../components/PageHeader';

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
      <div className="flex flex-1 flex-col">
        <PageHeader title="Patient not found" onBack={onBack} />
        <p className="text-muted-foreground">Patient not found</p>
      </div>
    );
  }

  const patientName = `${patient.firstName} ${patient.lastName}${patient.nickName ? ` (${patient.nickName})` : ''}`;

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title={patientName} onBack={onBack} />

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
