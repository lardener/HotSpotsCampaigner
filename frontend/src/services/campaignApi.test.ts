import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as campaignApi from './campaignApi';

describe('campaignApi', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('fetches missions from the backend', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(['Expedition', 'Raid']),
        } as unknown as Response);
        vi.stubGlobal('fetch', fetchMock);

        const missions = await campaignApi.getMissions();

        expect(missions).toEqual(['Expedition', 'Raid']);
        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:8080/api/campaigns/metadata/missions',
            expect.objectContaining({ credentials: 'include' })
        );
    });

    it('fetches resolved steps and returns the result', async () => {
        const resolvedSteps = { '1': { payRate: '100%', salvageRights: 'None', supportRights: 'None', transportation: 'None', commandRights: 'None' } };
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(resolvedSteps),
        } as unknown as Response);
        vi.stubGlobal('fetch', fetchMock);

        const result = await campaignApi.getResolvedSteps();

        expect(result).toEqual(resolvedSteps);
        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:8080/api/campaigns/metadata/resolved-steps',
            expect.objectContaining({ credentials: 'include' })
        );
    });

    it('builds query params and previews a campaign', async () => {
        const proposal = {
            campaign: { name: 'DOBLESS OP: TEST', systemName: 'Alyina', lengthInMonths: 6, trackCount: 3 },
            contracts: [
                {
                    employerCategory: 'Alyina: Corporate (Local)',
                    missionType: 'Expedition',
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
                    trackCount: 3,
                },
            ],
            tracks: ['Track A'],
        };
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ data: { publicPreviewCampaign: proposal } }),
        } as unknown as Response);
        vi.stubGlobal('fetch', fetchMock);

        const result = await campaignApi.previewCampaign({ mission: 'Expedition' });

        expect(result).toEqual(proposal);
        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:8080/graphql',
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"mission":"Expedition"'),
                credentials: 'include'
            })
        );
    });

    it('sends a POST request when saving a campaign', async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true } as Response);
        vi.stubGlobal('fetch', fetchMock);

        await campaignApi.saveCampaign({ mission: 'Raid', lengthInMonths: 4 });

        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:8080/api/campaigns/dobless?mission=Raid&lengthInMonths=4',
            expect.objectContaining({ method: 'POST', credentials: 'include' })
        );
    });

    it('calls logout endpoint with POST', async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true } as Response);
        vi.stubGlobal('fetch', fetchMock);

        await campaignApi.logout();

        expect(fetchMock).toHaveBeenCalledWith(
            'http://localhost:8080/api/logout',
            expect.objectContaining({ method: 'POST', credentials: 'include' })
        );
    });
});
