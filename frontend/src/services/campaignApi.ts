import { fetchJson, fetchVoid } from './apiClient';
import {
    ActiveCampaignPage,
    CampaignProposal,
    ResolvedSteps,
    Profile
} from '../types/global.d';
import { PREVIEW_CAMPAIGN_RAW } from '../types/operations';

export const getActiveCampaigns = async (page: number = 0, size: number = 5): Promise<ActiveCampaignPage> => {
    const query = new URLSearchParams({ page: String(page), size: String(size) });
    return fetchJson<ActiveCampaignPage>(`/api/campaigns/active?${query.toString()}`);
};

export const getMissions = async (): Promise<{ primary: string[], opponent: string[] }> => {
    return fetchJson<{ primary: string[], opponent: string[] }>('/api/campaigns/metadata/missions');
};

export const getTrackTypes = async (): Promise<string[]> => {
    return fetchJson<string[]>('/api/campaigns/metadata/track-types');
};

export const getResolvedSteps = async (): Promise<ResolvedSteps> => {
    return fetchJson<ResolvedSteps>('/api/campaigns/metadata/resolved-steps');
};

export const getProfile = async (): Promise<Profile> => {
    return fetchJson<Profile>('/api/user/profile');
};

export const logout = async (): Promise<void> => {
    await fetchVoid('/api/logout', { method: 'POST' });
};

export const generateTracks = async (mission: string, commandRights: string, count: number): Promise<string[]> => {
    const query = new URLSearchParams({ mission, commandRights, count: String(count) });
    return fetchJson<string[]>(`/api/campaigns/metadata/generate-tracks?${query.toString()}`);
};

const buildQuery = (params: Record<string, string | number | undefined>): URLSearchParams => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            query.set(key, String(value));
        }
    });
    return query;
};

export const previewCampaign = async (input: Record<string, string | number | undefined>): Promise<CampaignProposal> => {
    const response = await fetchJson<{ data: { publicPreviewCampaign: CampaignProposal } }>('/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: PREVIEW_CAMPAIGN_RAW,
            variables: { input }
        })
    });

    if (!response.data || !response.data.publicPreviewCampaign) {
        throw new Error('GraphQL error: Failed to fetch campaign preview.');
    }

    return response.data.publicPreviewCampaign;
};

export const saveCampaign = async (params: Record<string, string | number | undefined>): Promise<void> => {
    const query = buildQuery(params);
    const queryString = query.toString();
    await fetchVoid(`/api/campaigns/dobless${queryString ? `?${queryString}` : ''}`, { method: 'POST' });
};
