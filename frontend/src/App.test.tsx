/*
 * HotSpots Campaigner - Battletech Mercenaries campaign management SaaS.
 * Copyright (C) 2026 Jose Ferrer
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
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