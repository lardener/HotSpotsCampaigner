import { useEffect, useState } from 'react';
import { Login } from './components/Login';
import { Welcome } from './components/Welcome';
import * as campaignApi from './services/campaignApi';
import './styles/index.css';
import { RandomCampaignGenerator } from './components/RandomCampaignGenerator';
import './styles/login.css';
import './styles/welcome.css';

interface UserProfile {
  email: string;
  name: string;
}

export function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await campaignApi.getProfile();
        setUser(data);
      } catch (error) {
        setUser(null);
        setAuthError('Unable to verify session at this time.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await campaignApi.logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-title-group">
          <h1 className="app-title">HOTSPOTS CAMPAIGNER</h1>
          <span className="app-subtitle">Mercenary Tactical Network</span>
        </div>
        <div className="user-auth-section">
          {user ? (
            <div className="user-indicator">
              <span className="user-tag">IDENTITY VERIFIED</span>
              <span className="user-name">{user.name}</span>
              <button onClick={handleLogout} className="login-button logout-button">Logout</button>
            </div>
          ) : (
            <Login />
          )}
        </div>
      </header>

      <main className="main-content">
        <div className="main-panel">
          {user ? (
            <>
              <Welcome userName={user.name} />
              <RandomCampaignGenerator user={user} />
            </>
          ) : (
            <div className="unauthenticated-dashboard">
              {authError && <div className="error-message" style={{ marginBottom: '16px' }}>{authError}</div>}
              <section className="dashboard-section">
                <h2 className="section-title">ACTIVE CAMPAIGNS</h2>
                <div className="campaign-summary-list">
                  <div className="summary-item">OPERATION: BULLDOG [SECURE DATA - LOGIN TO VIEW]</div>
                  <div className="summary-item">LUTHEN STRIKE [SECURE DATA - LOGIN TO VIEW]</div>
                </div>
              </section>
              <section className="dashboard-section">
                <h2 className="section-title">CAMPAIGN GENERATOR</h2>
                <RandomCampaignGenerator />
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}