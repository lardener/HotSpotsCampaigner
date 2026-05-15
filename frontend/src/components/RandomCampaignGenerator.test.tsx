import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RandomCampaignGenerator } from './RandomCampaignGenerator';
import * as campaignApi from '../services/campaignApi';

vi.mock('../services/campaignApi', () => ({
    getMissions: vi.fn(),
    getTrackTypes: vi.fn(),
    getResolvedSteps: vi.fn(),
    previewCampaign: vi.fn(),
    saveCampaign: vi.fn(),
    generateTracks: vi.fn()
}));

describe('RandomCampaignGenerator', () => {
    const mockMissions = { primary: ['Raid'], opponent: ['Garrison'] };
    const mockTrackTypes = ['Assault', 'Battle'];
    const mockSteps = { 7: { payRate: '100%', salvageRights: 'None', supportRights: 'None', transportation: 'None', commandRights: 'None' } };

    beforeEach(() => {
        vi.clearAllMocks();
        (campaignApi.getMissions as any).mockResolvedValue(mockMissions);
        (campaignApi.getTrackTypes as any).mockResolvedValue(mockTrackTypes);
        (campaignApi.getResolvedSteps as any).mockResolvedValue(mockSteps);
    });

    it('loads metadata on mount', async () => {
        render(<RandomCampaignGenerator />);
        await waitFor(() => {
            expect(campaignApi.getMissions).toHaveBeenCalled();
        });
    });

    it('generates a preview when clicking the button', async () => {
        const mockProposal = {
            campaign: { name: 'OP: TEST', systemName: 'Solaris', trackCount: 2 },
            contracts: [
                {
                    primaryContract: true,
                    employerCategory: 'House: Davion',
                    missionType: 'Raid',
                    payRate: 1.0, payStep: 7, salvageTerms: 'None', salvageStep: 7,
                    supportTerms: 'None', supportStep: 7, transportTerms: 'None', transportStep: 7,
                    commandRights: 'None', commandStep: 7, trackCount: 2
                },
                {
                    primaryContract: false,
                    employerCategory: 'House: Kurita',
                    missionType: 'Garrison',
                    payRate: 1.0, payStep: 7, salvageTerms: 'None', salvageStep: 7,
                    supportTerms: 'None', supportStep: 7, transportTerms: 'None', transportStep: 7,
                    commandRights: 'None', commandStep: 7, trackCount: 2
                }
            ],
            tracks: ['Assault', 'Battle']
        };

        (campaignApi.previewCampaign as any).mockResolvedValue(mockProposal);

        render(<RandomCampaignGenerator user={{ name: 'Commander' }} />);

        const btn = screen.getByText('GENERATE CONTRACT OFFERS');
        fireEvent.click(btn);

        await waitFor(() => {
            expect(screen.getByText(/DOBLESS INTEL: OP: TEST/)).toBeInTheDocument();
        });
    });

    it('displays authentication required message when user is missing', async () => {
        (campaignApi.previewCampaign as any).mockResolvedValue({ campaign: {}, contracts: [], tracks: [] });
        render(<RandomCampaignGenerator />);

        fireEvent.click(screen.getByText('GENERATE CONTRACT OFFERS'));

        await waitFor(() => {
            expect(screen.getByText('AUTHENTICATION REQUIRED TO PERSIST CAMPAIGN DATA')).toBeInTheDocument();
        });
    });
});