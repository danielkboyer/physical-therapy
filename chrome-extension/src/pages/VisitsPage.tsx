import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@pt-app/shared-ui';
import { trpc } from '../trpc-client';
import { formatDateTime } from '../utils/date';

interface VisitsPageProps {
  searchQuery: string;
  clinicId: string;
  onVisitClick: (visitId: string) => void;
}

export default function VisitsPage({ searchQuery, clinicId, onVisitClick }: VisitsPageProps) {
  const { data: visits = [], isLoading: visitsLoading } = trpc.visit.getByClinic.useQuery({
    clinicId,
  });

  // Get all patients to show names
  const { data: patients = [], isLoading: patientsLoading } = trpc.patient.getByClinic.useQuery({
    clinicId,
  });

  // Create a patient lookup map
  const patientMap = useMemo(() => {
    return new Map(patients.map((p) => [p.id, p]));
  }, [patients]);

  // Combine visit data with patient names and filter by search
  const visitsWithPatients = useMemo(() => {
    return visits.map((visit) => {
      const patient = patientMap.get(visit.patientId);
      return {
        ...visit,
        patientName: patient
          ? `${patient.firstName} ${patient.lastName}`
          : 'Unknown Patient',
      };
    });
  }, [visits, patientMap]);

  // Filter visits based on search query
  const filteredVisits = useMemo(() => {
    if (!searchQuery) return visitsWithPatients;

    const query = searchQuery.toLowerCase();
    return visitsWithPatients.filter((visit) => {
      return visit.patientName.toLowerCase().includes(query);
    });
  }, [visitsWithPatients, searchQuery]);

  const loading = visitsLoading || patientsLoading;

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Loading visits...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visits</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage patient visits and appointments
          </p>
        </div>
      </div>

      {searchQuery && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Searching for: <span className="font-medium text-foreground">{searchQuery}</span>
              {' - '}
              {filteredVisits.length} result{filteredVisits.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Visits</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVisits.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No visits found matching your search.' : 'No visits yet.'}
            </p>
          ) : (
            <div className="space-y-2">
              {filteredVisits.map((visit) => (
                <Button
                  key={visit.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => onVisitClick(visit.id)}
                >
                  <div className="text-left flex-1">
                    <div className="font-medium">{visit.patientName}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDateTime(new Date(visit.visitDate))}
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
