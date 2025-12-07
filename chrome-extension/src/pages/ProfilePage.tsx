import { ArrowLeft, User, Mail, Building, LogOut } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Avatar,
  AvatarFallback
} from '@pt-app/shared-ui';

interface ProfilePageProps {
  user: {
    id: string;
    email: string;
    name: string;
    clinicId: string;
  };
  onBack: () => void;
  onLogout: () => void;
}

export default function ProfilePage({ user, onBack, onLogout }: ProfilePageProps) {
  const userInitials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <div className="h-14 border-b bg-background flex items-center px-4 gap-3 sticky top-0 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Profile</h1>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Clinic ID</p>
                <p className="text-sm text-muted-foreground">{user.clinicId}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
