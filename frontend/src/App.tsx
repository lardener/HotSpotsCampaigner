import { useEffect, useState } from 'react';
import * as campaignApi from './services/campaignApi';
import { MainDashboard } from './components/MainDashboard';
import './styles/index.css';

interface UserProfile {
  name: string;
  id: string; // Using email or unique ID for the command context
}

export function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        const profile = await campaignApi.getProfile();
        // Map the profile to include an ID if it's missing, using email as the unique key
        setUser({
          name: profile.name,
          id: profile.email || (profile as any).id || 'unknown'
        });
      } catch (error) {
        console.log("Not authenticated or server unreachable.");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, []);

  const handleLogout = async () => {
    try {
      await campaignApi.logout();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback for session expiry
      window.location.href = '/';
    }
  };

  if (loading) {
    return <div className="loading-container terminal-text">ESTABLISHING TACTICAL UPLINK...</div>;
  }

  return <MainDashboard user={user} onLogout={handleLogout} />;
}