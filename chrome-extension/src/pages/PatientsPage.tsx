import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@pt-app/shared-ui';
import { trpc } from '../trpc-client';

interface PatientsPageProps {
  searchQuery: string;
  clinicId: string;
  onPatientClick: (patientId: string) => void;
}

export default function PatientsPage({ searchQuery, clinicId, onPatientClick }: PatientsPageProps) {
  const { data: patients = [], isLoading } = trpc.patient.getByClinic.useQuery({
    clinicId,
  });

  // Filter patients based on search query
  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;

    const query = searchQuery.toLowerCase();
    return patients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const nickName = patient.nickName?.toLowerCase() || '';
      return fullName.includes(query) || nickName.includes(query);
    });
  }, [patients, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Loading patients...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your patient records and information
          </p>
        </div>
      </div>

      {searchQuery && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Searching for: <span className="font-medium text-foreground">{searchQuery}</span>
              {' - '}
              {filteredPatients.length} result{filteredPatients.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Patient List</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No patients found matching your search.' : 'No patients yet.'}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredPatients.map((patient) => (
                <Button
                  key={patient.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onPatientClick(patient.id)}
                >
                  <div className="text-left">
                    <div className="font-medium">
                      {patient.lastName}, {patient.firstName}
                      {patient.nickName && ` (${patient.nickName})`}
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
