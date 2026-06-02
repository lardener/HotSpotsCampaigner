import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { App } from './App';
import * as campaignApi from './services/campaignApi';

vi.mock('./services/campaignApi', () => ({
  getProfile: vi.fn(),
  getActiveCampaigns: vi.fn(),
  getMissions: vi.fn(),
  getTrackTypes: vi.fn(),
  getResolvedSteps: vi.fn()
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (campaignApi.getMissions as any).mockResolvedValue({ primary: [], opponent: [] });
    (campaignApi.getTrackTypes as any).mockResolvedValue([]);
    (campaignApi.getResolvedSteps as any).mockResolvedValue({});
  });

  it('shows loading state initially', () => {
    (campaignApi.getProfile as any).mockReturnValue(new Promise(() => { })); // Never resolves
    render(<App />);
    expect(screen.getByText('INITIALIZING NEURAL LINK...')).toBeInTheDocument();
  });

  it('renders login when unauthenticated', async () => {
    (campaignApi.getProfile as any).mockRejectedValue(new Error('401'));
    (campaignApi.getActiveCampaigns as any).mockResolvedValue({ content: [], totalPages: 0 });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('FEDERATED LOGIN')).toBeInTheDocument();
    });
  });
});