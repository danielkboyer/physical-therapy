import { Button } from '@pt-app/shared-ui';
import { Card, CardHeader, CardTitle, CardContent } from '@pt-app/shared-ui';

interface DashboardProps {
  user: {
    id: string;
    email: string;
    name: string;
    clinicId: string;
  };
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center pb-4 border-b">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={onLogout}>
          Sign Out
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user.name}!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your dashboard is ready! Start building your features here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
