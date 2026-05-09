import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('should render login button when not authenticated', () => {
    render(<App />);
    const loginButton = screen.queryByText(/login with google/i);
    expect(loginButton).toBeTruthy();
  });

  it('should render welcome message when authenticated', async () => {
    // Mock the global fetch to simulate a successful profile retrieval
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ email: 'commander@merc.net', name: 'Commander' })
    });

    render(<App />);

    // Wait for the authenticated state to be reflected in the UI
    await waitFor(() => {
      expect(screen.getByText(/Commander/i)).toBeInTheDocument();
      expect(screen.getByText(/IDENTITY VERIFIED/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });
  });
});
