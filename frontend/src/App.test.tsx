import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { App } from './App';

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should render login button when not authenticated', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false } as unknown as Response);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/login with google/i)).toBeInTheDocument();
    });
  });

  it('should render welcome message when authenticated', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ email: 'commander@merc.net', name: 'Commander' })
    } as unknown as Response);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/IDENTITY VERIFIED/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /welcome commander to the mercenary life/i })).toBeInTheDocument();
    });
  });

  it('should call the backend logout endpoint when logout is clicked', async () => {
    const profileResponse = { ok: true, json: () => Promise.resolve({ email: 'commander@merc.net', name: 'Commander' }) } as unknown as Response;
    const logoutResponse = { ok: true } as unknown as Response;
    const fetchMock = vi.fn(async (input: RequestInfo) => {
      return input.toString().includes('/api/logout') ? logoutResponse : profileResponse;
    }) as unknown as typeof fetch;

    global.fetch = fetchMock;

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/api/logout', expect.objectContaining({ method: 'POST', credentials: 'include' }));
    });
  });
});
