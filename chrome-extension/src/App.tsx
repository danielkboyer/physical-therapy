import { useState, useEffect } from 'react';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard, { type DashboardState } from './components/Dashboard';
import ProfilePage from './pages/ProfilePage';

type View = 'signup' | 'login' | 'dashboard' | 'profile';

interface StoredUser {
  id: string;
  email: string;
  name: string;
  clinicId: string;
}

function App() {
  const [currentView, setCurrentView] = useState<View>('signup');
  const [user, setUser] = useState<StoredUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savedDashboardState, setSavedDashboardState] = useState<DashboardState | undefined>(undefined);

  useEffect(() => {
    // Check if user is logged in
    chrome.storage.local.get(['user', 'isLoggedIn'], (result) => {
      if (result.isLoggedIn && result.user) {
        setUser(result.user as StoredUser);
        setCurrentView('dashboard');
      } else {
        setCurrentView('login');
      }
    });
  }, []);

  const handleLoginSuccess = (userData: StoredUser) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleSignupSuccess = () => {
    setCurrentView('login');
  };

  const handleLogout = () => {
    chrome.storage.local.remove(['user', 'isLoggedIn'], () => {
      setUser(null);
      setCurrentView('login');
      setSavedDashboardState(undefined);
    });
  };

  const handleProfileClick = (state: DashboardState) => {
    setSavedDashboardState(state);
    setCurrentView('profile');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  return (
    <>
      {currentView === 'signup' && (
        <Signup
          onSuccess={handleSignupSuccess}
          onSwitchToLogin={() => setCurrentView('login')}
        />
      )}
      {currentView === 'login' && (
        <Login
          onSuccess={handleLoginSuccess}
          onSwitchToSignup={() => setCurrentView('signup')}
        />
      )}
      {currentView === 'dashboard' && user && (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          onProfileClick={handleProfileClick}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          initialState={savedDashboardState}
        />
      )}
      {currentView === 'profile' && user && (
        <ProfilePage
          user={user}
          onBack={handleBackToDashboard}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

export default App;
