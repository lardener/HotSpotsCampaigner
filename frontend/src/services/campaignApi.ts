import { fetchJson, fetchVoid } from './apiClient';

export interface ContractPreview {
    employerCategory: string;
    missionType: string;
    primaryContract: boolean;
    payRate: number;
    payStep: number;
    salvageTerms: string;
    salvageStep: number;
    supportTerms: string;
    supportStep: number;
    transportTerms: string;
    transportStep: number;
    commandRights: string;
    commandStep: number;
    trackCount: number;
}

export interface CampaignProposal {
    campaign: {
        name: string;
        systemName: string;
        trackCount: number;
    };
    contracts: ContractPreview[];
    tracks: string[];
}

export interface ActiveCampaignSummary {
    id: string;
    name: string;
    systemName: string;
    trackCount: number;
    primaryEmployer: string;
    secondaryEmployer: string;
}

export interface ActiveCampaignPage {
    content: ActiveCampaignSummary[];
    totalElements: number;
    totalPages: number;
}

export interface ResolvedStep {
    payRate: string;
    salvageRights: string;
    supportRights: string;
    transportation: string;
    commandRights: string;
}

export type ResolvedSteps = Record<string, ResolvedStep>;

export interface Profile {
    email: string;
    name: string;
}

export const getActiveCampaigns = async (page: number = 0, size: number = 10): Promise<ActiveCampaignPage> => {
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

export const previewCampaign = async (params: Record<string, string | number | undefined>): Promise<CampaignProposal> => {
    const query = buildQuery(params);
    const queryString = query.toString();
    return fetchJson<CampaignProposal>(`/api/campaigns/dobless/preview${queryString ? `?${queryString}` : ''}`);
};

export const saveCampaign = async (params: Record<string, string | number | undefined>): Promise<void> => {
    const query = buildQuery(params);
    const queryString = query.toString();
    await fetchVoid(`/api/campaigns/dobless${queryString ? `?${queryString}` : ''}`, { method: 'POST' });
};
