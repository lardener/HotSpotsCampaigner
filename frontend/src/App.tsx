import { useEffect, useState } from 'react';
import { Login } from './components/Login';
import { Welcome } from './components/Welcome';
import './styles/index.css';
import './styles/login.css';
import './styles/welcome.css';

interface UserProfile {
  email: string;
  name: string;
}

export function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the user is already logged in by fetching their profile
    fetch('http://localhost:8080/api/user/profile', {
      credentials: 'include'
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then((data: UserProfile) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const handleLoginRedirect = () => {
    // Point to the backend server port to initiate the OAuth flow
    window.location.href = 'http://localhost:8080/login/oauth2/authorization/google';
  };

  const handleLogout = async () => {
    try {
      // Send a POST request to the backend's logout endpoint for the reactive security stack.
      const res = await fetch('http://localhost:8080/api/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (res.ok) {
        // Reload to clear the SPA state and return to the unauthenticated view.
        window.location.href = '/';
      } else {
        console.error('Logout failed with status:', res.status);
      }
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
            <Welcome userName={user.name} />
          ) : (
            <div className="unauthenticated-dashboard">
              <section className="dashboard-section">
                <h2 className="section-title">ACTIVE CAMPAIGNS</h2>
                <div className="campaign-summary-list">
                  <div className="summary-item">OPERATION: BULLDOG [SECURE DATA - LOGIN TO VIEW]</div>
                  <div className="summary-item">LUTHEN STRIKE [SECURE DATA - LOGIN TO VIEW]</div>
                </div>
              </section>
              <section className="dashboard-section">
                <h2 className="section-title">CAMPAIGN GENERATOR</h2>
                <p className="restricted-text">Generator offline/limited. Login required for persistence and full unit database access.</p>
                <button onClick={handleLoginRedirect} className="login-button">INITIALIZE SIMULATION</button>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}