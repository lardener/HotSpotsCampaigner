import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { App } from './App';

const { mockQuery } = vi.hoisted(() => {
  return { mockQuery: vi.fn() };
});

// Subclass ApolloClient inside mock to override only the query method
vi.mock('@apollo/client', async (importOriginal) => {
  const original = await importOriginal<any>();
  class MockApolloClient extends original.ApolloClient {
    constructor(...args: any[]) {
      super(...args);
      this.query = mockQuery as any;
    }
  }
  return {
    ...original,
    ApolloClient: MockApolloClient
  };
});

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    mockQuery.mockReturnValue(new Promise(() => { })); // Never resolves
    render(<App />);
    expect(screen.getByText('INITIALIZING NEURAL LINK...')).toBeInTheDocument();
  });

  it('renders login when unauthenticated', async () => {
    mockQuery.mockRejectedValue(new Error('Authentication required'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('FEDERATED LOGIN')).toBeInTheDocument();
    });
  });
});