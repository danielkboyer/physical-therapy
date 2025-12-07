import { Card, CardHeader, CardTitle, CardContent } from '@pt-app/shared-ui';

interface VisitsPageProps {
  searchQuery: string;
}

export default function VisitsPage({ searchQuery }: VisitsPageProps) {
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
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Visit Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Visit tracking features will appear here.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Upcoming patient appointments will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
