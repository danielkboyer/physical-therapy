import { useState, useEffect } from 'react';
import { Input, Button, Avatar, AvatarFallback } from '@pt-app/shared-ui';
import { Search, Menu } from 'lucide-react';
import AppSidebar from './AppSidebar';
import PatientsPage from '../pages/PatientsPage';
import VisitsPage from '../pages/VisitsPage';
import PatientProfilePage from '../pages/PatientProfilePage';
import VisitScreen from '../pages/VisitScreen';
import RecordingScreen from '../pages/RecordingScreen';
import IntegrationsPage from '../pages/IntegrationsPage';

export type DashboardView =
  | { type: 'patients' }
  | { type: 'visits' }
  | { type: 'integrations' }
  | { type: 'patient-profile'; patientId: string }
  | { type: 'visit'; visitId: string }
  | { type: 'recording'; visitId: string; recordingId?: string };

export interface DashboardState {
  currentView: DashboardView;
  currentTab: 'patients' | 'visits' | 'integrations';
  searchQuery: string;
}

interface DashboardProps {
  user: {
    id: string;
    email: string;
    name: string;
    clinicId: string;
  };
  onLogout: () => void;
  onProfileClick: (state: DashboardState) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  initialState?: DashboardState;
}

export default function Dashboard({ user, onProfileClick, sidebarOpen, setSidebarOpen, initialState }: DashboardProps) {
  const [currentView, setCurrentView] = useState<DashboardView>(
    initialState?.currentView || { type: 'patients' }
  );
  const [currentTab, setCurrentTab] = useState<'patients' | 'visits' | 'integrations'>(
    initialState?.currentTab || 'patients'
  );
  const [searchQuery, setSearchQuery] = useState(initialState?.searchQuery || '');

  // Update state when initialState changes
  useEffect(() => {
    if (initialState) {
      setCurrentView(initialState.currentView);
      setCurrentTab(initialState.currentTab);
      setSearchQuery(initialState.searchQuery);
    }
  }, [initialState]);

  const userInitials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleTabChange = (tab: 'patients' | 'visits' | 'integrations') => {
    setCurrentTab(tab);
    setCurrentView({ type: tab });
  };

  const handlePatientClick = (patientId: string) => {
    setCurrentView({ type: 'patient-profile', patientId });
  };

  const handleVisitClick = (visitId: string) => {
    setCurrentView({ type: 'visit', visitId });
  };

  const handleRecordingClick = (recordingId: string, visitId: string) => {
    setCurrentView({ type: 'recording', visitId, recordingId });
  };

  const handleBackToPatients = () => {
    setCurrentView({ type: 'patients' });
    setCurrentTab('patients');
  };

  const handleBackToVisits = () => {
    setCurrentView({ type: 'visits' });
    setCurrentTab('visits');
  };

  const handleNavigateToIntegrations = () => {
    setCurrentView({ type: 'integrations' });
    setCurrentTab('integrations');
  };

  const renderContent = () => {
    switch (currentView.type) {
      case 'patients':
        return (
          <PatientsPage
            searchQuery={searchQuery}
            clinicId={user.clinicId}
            onPatientClick={handlePatientClick}
            onNavigateToIntegrations={handleNavigateToIntegrations}
          />
        );
      case 'visits':
        return (
          <VisitsPage
            searchQuery={searchQuery}
            clinicId={user.clinicId}
            onVisitClick={handleVisitClick}
            onNavigateToIntegrations={handleNavigateToIntegrations}
          />
        );
      case 'integrations':
        return <IntegrationsPage clinicId={user.clinicId} />;
      case 'patient-profile':
        return (
          <PatientProfilePage
            patientId={currentView.patientId}
            clinicId={user.clinicId}
            onBack={handleBackToPatients}
            onVisitClick={handleVisitClick}
          />
        );
      case 'visit':
        return (
          <VisitScreen
            visitId={currentView.visitId}
            onBack={handleBackToVisits}
            onRecordingClick={(recordingId) => handleRecordingClick(recordingId, currentView.visitId)}
          />
        );
      case 'recording':
        return (
          <RecordingScreen
            visitId={currentView.visitId}
            recordingId={currentView.recordingId}
            onBack={() => handleVisitClick(currentView.visitId)}
          />
        );
    }
  };

  const showHeaderAndSidebar = currentView.type === 'patients' || currentView.type === 'visits' || currentView.type === 'integrations';

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      {showHeaderAndSidebar && (
        <AppSidebar
          currentTab={currentTab}
          onTabChange={handleTabChange}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        {showHeaderAndSidebar && (
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
                placeholder="Search patients or visits..."
                className="pl-8 w-full"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onProfileClick({ currentView, currentTab, searchQuery })}
              aria-label="Open profile"
              className="ml-auto"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </header>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
