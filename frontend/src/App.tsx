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
