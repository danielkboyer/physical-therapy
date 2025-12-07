import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Input, Button, Label } from '@pt-app/shared-ui';
import { ArrowLeft, Save } from 'lucide-react';
import { trpc } from '../trpc-client';
import { formatDateTime } from '../utils/date';

interface PatientProfilePageProps {
  patientId: string;
  clinicId: string;
  onBack: () => void;
  onVisitClick: (visitId: string) => void;
}

export default function PatientProfilePage({
  patientId,
  onBack,
  onVisitClick,
}: PatientProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickName, setNickName] = useState('');

  // Use tRPC React Query hooks for automatic loading states and caching
  const { data: patient, isLoading: patientLoading, refetch: refetchPatient } = trpc.patient.getById.useQuery({
    id: patientId,
  });

  const { data: visits = [], isLoading: visitsLoading } = trpc.visit.getByPatient.useQuery({
    patientId,
  });

  // Update form fields when patient data loads
  if (patient && !isEditing && !firstName && !lastName) {
    setFirstName(patient.firstName);
    setLastName(patient.lastName);
    setNickName(patient.nickName || '');
  }

  const updatePatientMutation = trpc.patient.update.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      refetchPatient();
    },
  });

  const handleSave = async () => {
    updatePatientMutation.mutate({
      id: patientId,
      firstName,
      lastName,
      nickName: nickName || undefined,
    });
  };

  const loading = patientLoading || visitsLoading;

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Loading patient...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <Button variant="ghost" onClick={onBack} className="w-fit">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patients
        </Button>
        <p className="text-muted-foreground">Patient not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Button variant="ghost" onClick={onBack} className="w-fit">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Patients
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Patient Information</CardTitle>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} size="sm">
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm" disabled={updatePatientMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updatePatientMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setFirstName(patient.firstName);
                  setLastName(patient.lastName);
                  setNickName(patient.nickName || '');
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nickName">Nickname</Label>
              <Input
                id="nickName"
                value={nickName}
                onChange={(e) => setNickName(e.target.value)}
                disabled={!isEditing}
                placeholder="Optional"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visits</CardTitle>
        </CardHeader>
        <CardContent>
          {visits.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Navigate to a visit in prompt to start a recording
            </p>
          ) : (
            <div className="space-y-2">
              {visits.map((visit) => (
                <Button
                  key={visit.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onVisitClick(visit.id)}
                >
                  <div className="text-left">
                    <div className="font-medium">{formatDateTime(new Date(visit.visitDate))}</div>
                  </div>
                </Button>
              ))}
              <p className="text-sm text-muted-foreground mt-4">
                Navigate to a visit in prompt to start a recording
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
