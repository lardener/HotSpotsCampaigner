import apiClient from './apiClient';

export interface CombatUnit {
    id: string;
    commandId: string;
    detachmentId: string | null;
    model: string;
    type: string;
    tonnage: number;
    status: string;
}

export interface Pilot {
    id: string;
    commandId: string;
    detachmentId: string | null;
    name: string;
    gunnery: number;
    piloting: number;
    status: string;
}

export interface Detachment {
    id: string;
    name: string;
    contractId: string;
    mercenaryCommandId: string;
}

export interface CampaignSummary {
    id: string;
    name: string;
    systemName: string;
    trackCount: number;
    primaryEmployer: string;
    secondaryEmployer: string;
}

export interface CommandAssetsResponse {
    units: CombatUnit[];
    pilots: Pilot[];
}

export const getAssets = (commandId: string): Promise<CommandAssetsResponse> =>
    apiClient.get<CommandAssetsResponse>(`/api/commands/${commandId}/assets`);

export const getDetachments = (commandId: string): Promise<Detachment[]> =>
    apiClient.get<Detachment[]>(`/api/commands/${commandId}/detachments`);

export const assignAsset = (assetType: 'UNIT' | 'PILOT', assetId: string, detachmentId: string | null) =>
    apiClient.post(`/api/commands/assets/assign`, { assetType, assetId, detachmentId });

export const getManagedCampaigns = (): Promise<CampaignSummary[]> =>
    apiClient.get<CampaignSummary[]>(`/api/campaigns/managed`);

export const getParticipatingCampaigns = (commandId: string): Promise<CampaignSummary[]> =>
    apiClient.get<CampaignSummary[]>(`/api/campaigns/participating/${commandId}`);