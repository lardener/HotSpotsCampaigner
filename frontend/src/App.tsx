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
  const [authError] = useState<string | null>(null);

  // Active Campaigns Viewer State
  const [activeCampaigns, setActiveCampaigns] = useState<campaignApi.ActiveCampaignSummary[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [listLoading, setListLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setPage(0);
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const initApp = async () => {
      let campaignList: campaignApi.ActiveCampaignPage | null = null;
      try {
        const profile = await campaignApi.getProfile().catch(() => null);
        setUser(profile);
      } catch (error) {
        setUser(null);
      }

      try {
        campaignList = await campaignApi.getActiveCampaigns(0, 5);
        setActiveCampaigns(campaignList.content);
        setTotalPages(campaignList.totalPages);
      } catch (error) {
        console.error('Failed to load active campaigns on startup', error);
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  useEffect(() => {
    const fetchPage = async () => {
      setListLoading(true);
      try {
        const campaignList = await campaignApi.getActiveCampaigns(page, 5);
        setActiveCampaigns(campaignList.content);
        setTotalPages(campaignList.totalPages);
      } catch (err) {
        console.error("Failed to fetch campaigns", err);
      } finally {
        setListLoading(false);
      }
    };
    if (!loading) fetchPage();
  }, [page, loading, refreshTrigger]);

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

  const ActiveCampaignsList = () => (
    <section className="dashboard-section">
      <h2 className="section-title">ACTIVE CAMPAIGNS</h2>
      {listLoading ? (
        <p>Loading Intelligence...</p>
      ) : (
        <div className="campaign-summary-list">
          {activeCampaigns.length > 0 ? (
            activeCampaigns.map((c) => {
              const displayName = c.name ? c.name.toUpperCase() : 'UNKNOWN CAMPAIGN';
              const systemName = c.systemName || 'Unknown System';
              const trackCount = c.trackCount ?? 0;
              const primaryEmployer = c.primaryEmployer || 'Unknown';
              const secondaryEmployer = c.secondaryEmployer || 'Unknown';
              return (
                <div key={c.id} className="summary-item" style={{ marginBottom: '12px' }}>
                  <div style={{ fontWeight: 'bold', color: '#c00' }}>{displayName}</div>
                  <div style={{ fontSize: '0.9em', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
                    <span><strong>SYSTEM:</strong> {systemName}</span>
                    <span><strong>TRACKS:</strong> {trackCount}</span>
                    <span><strong>PRIMARY:</strong> {primaryEmployer}</span>
                    <span><strong>SECONDARY:</strong> {secondaryEmployer}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No active deployments detected in the sector.</p>
          )}
        </div>
      )}
      <div className="pagination-controls" style={{ marginTop: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="login-button" style={{ padding: '4px 12px' }}>PREV</button>
        <span style={{ fontSize: '0.8em' }}>SECTOR {page + 1} OF {totalPages || 1}</span>
        <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="login-button" style={{ padding: '4px 12px' }}>NEXT</button>
      </div>
    </section>
  );

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
              <ActiveCampaignsList />
              <RandomCampaignGenerator user={user} onSaveSuccess={handleRefresh} />
            </>
          ) : (
            <div className="unauthenticated-dashboard">
              {authError && <div className="error-message" style={{ marginBottom: '16px' }}>{authError}</div>}
              <ActiveCampaignsList />
              <section className="dashboard-section">
                <h2 className="section-title">CAMPAIGN GENERATOR</h2>
                <RandomCampaignGenerator onSaveSuccess={handleRefresh} />
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}