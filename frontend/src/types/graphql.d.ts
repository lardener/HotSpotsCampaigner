// ==================== GraphQL Query Response Types ====================
// This file contains all Query and Mutation response interfaces for consistency

import {
    CombatUnit,
    Pilot,
    Detachment,
    Command,
    CampaignDetail,
    MercenaryCommand,
    ProposedTrack,
    TrackDetail,
    CampaignInvite,
    PublicCampaignMetadataMinimal,
    PublicCampaignMetadataWithRules,
    Contract,
    CampaignFaction,
    Proposal,
    LedgerEntryInput,
    LedgerEntry,
    RepairRulesInput,
    ResolvedStepValues,
    ActiveCampaignSummary,
    UserAccount,
    GQLResponse,
} from './global.d';

// ==================== Campaign Queries ====================

export type ActiveCampaignsData = GQLResponse<'publicActiveCampaigns', ActiveCampaignSummary[]>;
export type PreviewData = GQLResponse<'publicPreviewCampaign', Proposal>; // Returns a Proposal object
export type GenerateTracksData = GQLResponse<'generateTracks', ProposedTrack[]>; // Returns an array of ProposedTrack

// ==================== Metadata Queries ====================
// Renamed to clarify their purpose as metadata, not full entity details
// Using PublicCampaignMetadataWithRules and PublicCampaignMetadataMinimal from global.d.ts

export type MetadataDataFull = GQLResponse<'publicCampaignMetadata', PublicCampaignMetadataWithRules>;
export type MetadataDataMinimal = GQLResponse<'publicCampaignMetadata', PublicCampaignMetadataMinimal>;

export type CampaignDetailsData = GQLResponse<'getCampaign', CampaignDetail>;

export type UserProfileData = GQLResponse<'userProfile', UserAccount | null>;

// ==================== Command & Unit Queries ====================

export type UnitDossierData = GQLResponse<'getCommand', Command> &
    GQLResponse<'managedCampaigns', Pick<CampaignDetail, 'id' | 'name'>[]> &
    GQLResponse<'publicCampaignMetadata', Omit<PublicCampaignMetadataMinimal, 'repairRules'>>;
export type GetMyCommandsData = GQLResponse<'myCommands', Command[]>;
export type ManagedCampaignsData = GQLResponse<'managedCampaigns', (Omit<CampaignDetail, 'tracks' | 'monthlyPay' | 'monthlyMaintenance' | 'transportationCost' | 'combatPay' | 'repairRules' | 'lengthInMonths'> & {
    tracks: Omit<TrackDetail, 'complications' | 'afterActionNarrative' | 'oppositionComplications'>[];
})[]>;

export type ForceData = GQLResponse<'getCommand', Command> &
    GQLResponse<'managedCampaigns', any[]> &
    GQLResponse<'participatingCampaigns', any[]> &
    GQLResponse<'publicCampaignMetadata', Omit<PublicCampaignMetadataMinimal, 'repairRules'>>;

export type LedgerData = GQLResponse<'getCommand', Pick<Command, 'id' | 'name' | 'totalSupportPoints'> & {
    detachments: Pick<Detachment, 'id' | 'name' | 'campaignId' | 'campaignName'>[];
}>;

// ==================== User & Auth Mutations ====================

export type LoginWithTokenData = GQLResponse<'loginWithToken', string>; // Returns token string
export type UpdateUserProfileData = GQLResponse<'updateUserProfile', Pick<UserAccount, 'id' | 'displayName' | 'role'>>; // Returns partial UserAccount

// ==================== Mutation Response Types ====================

export type CreateCampaignData = GQLResponse<'createCampaign', UpdateCampaignData['updateCampaign']>;
export type UpdateCampaignData = GQLResponse<'updateCampaign', Pick<CampaignDetail, 'id' | 'name' | 'systemName' | 'description' | 'lengthInMonths' | 'trackCount' | 'monthlyPay' | 'monthlyMaintenance' | 'transportationCost' | 'combatPay' | 'status' | 'payRate' | 'payStep' | 'salvageTerms' | 'salvageStep' | 'supportTerms' | 'supportStep' | 'transportTerms' | 'transportStep' | 'commandRights' | 'commandStep'>>;

export type CreateInviteData = GQLResponse<'createInvite', { token: string; recipientName: string }>;
export type DeleteInviteData = GQLResponse<'deleteInvite', boolean>;

export type CreateDetachmentData = GQLResponse<'createDetachment', Detachment>;
export type DeleteDetachmentData = GQLResponse<'deleteDetachment', boolean>;
export type AssignDetachmentData = GQLResponse<'assignDetachmentToCampaign', boolean>;
export type JoinCampaignData = GQLResponse<'joinCampaign', boolean>;

export type UpdateTrackData = GQLResponse<'updateTrack', TrackDetail>;
export type RerollTrackData = GQLResponse<'rerollTrack', Pick<TrackDetail, 'id' | 'trackName' | 'complications' | 'oppositionComplications'>>;
export type ReorderTracksData = GQLResponse<'reorderTracks', TrackDetail[]>;

export type EstablishCommandData = GQLResponse<'establishCommand', MercenaryCommand>;
export type UpdateCommandData = GQLResponse<'updateCommand', MercenaryCommand>;
export type DeleteCommandData = GQLResponse<'deleteCommand', boolean>;

export type AssignAssetData = GQLResponse<'assignAsset', boolean>;

export type AddUnitData = GQLResponse<'addCombatUnit', CombatUnit>;
export type UpdateUnitData = GQLResponse<'updateCombatUnit', CombatUnit>;
export type ImportAssetsData = GQLResponse<'importCombatUnitsFromLink', CombatUnit[]>;

export type HirePilotData = GQLResponse<'hirePilot', Pilot>;
export type UpdatePilotData = GQLResponse<'updatePilot', Pilot>;

export type AddLedgerEntryData = GQLResponse<'addLedgerEntry', { id: string }>;

export type DeleteUnitData = GQLResponse<'deleteUnit', boolean>;
export type DeletePilotData = GQLResponse<'deletePilot', boolean>;
