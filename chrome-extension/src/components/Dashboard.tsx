import { useState } from 'react';
import { Input, Button, Avatar, AvatarFallback } from '@pt-app/shared-ui';
import { Search, Menu } from 'lucide-react';
import AppSidebar from './AppSidebar';
import PatientsPage from '../pages/PatientsPage';
import VisitsPage from '../pages/VisitsPage';

interface DashboardProps {
  user: {
    id: string;
    email: string;
    name: string;
    clinicId: string;
  };
  onLogout: () => void;
  onProfileClick: () => void;
}

export default function Dashboard({ user, onLogout, onProfileClick }: DashboardProps) {
  const [currentTab, setCurrentTab] = useState<'patients' | 'visits'>('patients');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const userInitials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <AppSidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6">
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search patients..."
              className="pl-8 w-full"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onProfileClick}
            aria-label="Open profile"
            className="ml-auto"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {currentTab === 'patients' && <PatientsPage searchQuery={searchQuery} />}
          {currentTab === 'visits' && <VisitsPage searchQuery={searchQuery} />}
        </main>
      </div>
    </div>
  );
}
