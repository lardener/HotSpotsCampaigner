import { useState, useEffect } from 'react';
import { ApolloClient, InMemoryCache, HttpLink, split, gql } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { ApolloProvider } from '@apollo/client/react';
import { createClient } from 'graphql-ws';
import { MainDashboard } from './components/MainDashboard';
import * as campaignApi from './services/campaignApi';
import './styles/index.css';

const httpLink = new HttpLink({
  uri: 'http://localhost:8080/graphql',
  // Critical for OAuth2/Session cookie support
  credentials: 'include',
});

const wsLink = new GraphQLWsLink(createClient({
  url: 'ws://localhost:8080/graphql',
}));

// 1. Initialize split link to handle both HTTP and WebSocket transports
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

interface UserProfileData {
  userProfile: {
    id: string;
    name: string;
    email: string;
  } | null;
}

const GET_USER_PROFILE = gql`
  query GetUserProfile {
    userProfile {
      id
      name
      email
    }
  }
`;

export function App() {
  const [user, setUser] = useState<{ name: string; id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dynamic Tactical Favicon Injection
    const link = (document.querySelector("link[rel*='icon']") || document.createElement('link')) as HTMLLinkElement;
    link.type = 'image/svg+xml';
    link.rel = 'shortcut icon';

    // Styled Amber Hex-Crosshair Icon
    const faviconSvg = `
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
        <rect width='100' height='100' fill='#050705'/>
        <polygon points='50,10 85,30 85,70 50,90 15,70 15,30' fill='none' stroke='#ffb000' stroke-width='8'/>
        <circle cx='50' cy='50' r='18' fill='none' stroke='#ffb000' stroke-width='4'/>
        <path d='M50 20 L50 80 M20 50 L80 50' stroke='#ffb000' stroke-width='4'/>
      </svg>
    `.trim();

    link.href = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`;
    document.getElementsByTagName('head')[0].appendChild(link);
    document.title = "HSC-TACTICAL // CAMPAIGNER";

    // Check for an existing session on mount
    client.query<UserProfileData>({ query: GET_USER_PROFILE, fetchPolicy: 'network-only' })
      .then(result => {
        const profile = result.data?.userProfile;
        if (profile) {
          // Use the internal UUID (id) as the user identifier
          setUser({ name: profile.name, id: profile.id });
        } else {
          setUser(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await campaignApi.logout();
    } catch (err) {
      console.error("Logout sequence failed:", err);
    }
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="loading-intel" style={{ textAlign: 'center', marginTop: '20%' }}>
        <svg width="80" height="80" viewBox="0 0 100 100" style={{ marginBottom: '24px' }}>
          <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="none" stroke="var(--terminal-amber)" strokeWidth="6" />
          <circle cx="50" cy="50" r="18" fill="none" stroke="var(--terminal-amber)" strokeWidth="3" />
          <path d="M50 20 L50 80 M20 50 L80 50" stroke="var(--terminal-amber)" strokeWidth="3" />
        </svg>
        <h2>INITIALIZING NEURAL LINK...</h2>
        <p className="terminal-text">SYNCHRONIZING WITH COMSTAR RELAY</p>
      </div>
    );
  }

  return (
    // 3. Provide the client to your component tree
    <ApolloProvider client={client}>
      <MainDashboard user={user} onLogout={handleLogout} />
    </ApolloProvider>
  );
}
