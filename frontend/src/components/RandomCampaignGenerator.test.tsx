import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { RandomCampaignGenerator } from './RandomCampaignGenerator';
import * as campaignApi from '../services/campaignApi';

describe('RandomCampaignGenerator', () => {
    const mockProposal: campaignApi.CampaignProposal = {
        campaign: {
            name: 'DOBLESS OP: RAID [Alyina]',
            systemName: 'Alyina',
            lengthInMonths: 6,
            trackCount: 2,
        },
        contracts: [
            {
                employerCategory: 'Alyina: Corporate (Local)',
                missionType: 'Raid',
                primaryContract: true,
                payRate: 1,
                payStep: 1,
                salvageTerms: 'None',
                salvageStep: 1,
                supportTerms: 'None',
                supportStep: 1,
                transportTerms: 'None',
                transportStep: 1,
                commandRights: 'None',
                commandStep: 1,
                lengthInMonths: 6,
                trackCount: 2,
            },
            {
                employerCategory: 'Alyina: Noble (Local)',
                missionType: 'Raid',
                primaryContract: false,
                payRate: 0.75,
                payStep: 1,
                salvageTerms: 'None',
                salvageStep: 1,
                supportTerms: 'None',
                supportStep: 1,
                transportTerms: 'None',
                transportStep: 1,
                commandRights: 'None',
                commandStep: 1,
                lengthInMonths: 6,
                trackCount: 2,
            },
        ],
        tracks: ['High Pass', 'River Crossing'],
    };

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('loads metadata and renders the generator', async () => {
        vi.spyOn(campaignApi, 'getMissions').mockResolvedValue(['Raid']);
        vi.spyOn(campaignApi, 'getTrackTypes').mockResolvedValue(['High Pass', 'River Crossing']);
        vi.spyOn(campaignApi, 'getResolvedSteps').mockResolvedValue({ '1': { payRate: '100%', salvageRights: 'None', supportRights: 'None', transportation: 'None', commandRights: 'None' } });

        render(<RandomCampaignGenerator />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /generate contract offers/i })).toBeInTheDocument();
        });
    });

    it('shows an error message when metadata load fails', async () => {
        vi.spyOn(campaignApi, 'getMissions').mockRejectedValue(new Error('Network failure'));
        vi.spyOn(campaignApi, 'getTrackTypes').mockResolvedValue([]);
        vi.spyOn(campaignApi, 'getResolvedSteps').mockResolvedValue({});

        render(<RandomCampaignGenerator />);

        await waitFor(() => {
            expect(screen.getByText(/failed to load campaign metadata/i)).toBeInTheDocument();
        });
    });

    it('generates a campaign preview when preview button is clicked', async () => {
        vi.spyOn(campaignApi, 'getMissions').mockResolvedValue(['Raid']);
        vi.spyOn(campaignApi, 'getTrackTypes').mockResolvedValue(['High Pass', 'River Crossing']);
        vi.spyOn(campaignApi, 'getResolvedSteps').mockResolvedValue({ '1': { payRate: '100%', salvageRights: 'None', supportRights: 'None', transportation: 'None', commandRights: 'None' } });
        const previewMock = vi.spyOn(campaignApi, 'previewCampaign').mockResolvedValue(mockProposal);

        render(<RandomCampaignGenerator />);

        await waitFor(() => expect(screen.getByRole('button', { name: /generate contract offers/i })).toBeEnabled());

        fireEvent.click(screen.getByRole('button', { name: /generate contract offers/i }));

        await waitFor(() => {
            expect(previewMock).toHaveBeenCalled();
            expect(screen.getByText(/dobless intel/i)).toBeInTheDocument();
            expect(screen.getByText(/primary contract offer/i)).toBeInTheDocument();
        });
    });

    it('displays an error message when preview fails', async () => {
        vi.spyOn(campaignApi, 'getMissions').mockResolvedValue(['Raid']);
        vi.spyOn(campaignApi, 'getTrackTypes').mockResolvedValue(['High Pass', 'River Crossing']);
        vi.spyOn(campaignApi, 'getResolvedSteps').mockResolvedValue({ '1': { payRate: '100%', salvageRights: 'None', supportRights: 'None', transportation: 'None', commandRights: 'None' } });
        vi.spyOn(campaignApi, 'previewCampaign').mockRejectedValue(new Error('Server error'));

        render(<RandomCampaignGenerator />);

        await waitFor(() => expect(screen.getByRole('button', { name: /generate contract offers/i })).toBeEnabled());
        fireEvent.click(screen.getByRole('button', { name: /generate contract offers/i }));

        await waitFor(() => {
            expect(screen.getByText(/failed to generate campaign preview/i)).toBeInTheDocument();
        });
    });
});
