import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@pt-app/shared-ui';

interface PatientsPageProps {
  searchQuery: string;
}

export default function PatientsPage({ searchQuery }: PatientsPageProps) {
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
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Patient List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Patient management features will appear here.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Recent patient updates and activity will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
