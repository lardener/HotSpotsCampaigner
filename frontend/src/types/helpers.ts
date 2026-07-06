/**
 * UI Helper Types
 * 
 * This module contains types that are specific to the UI layer and do not 
 * exist in the auto-generated GraphQL types. These include:
 * - UI input helpers (NumericInput, GQLResponse)
 * - Domain enums (UnitType, TechBase, UnitStatus)
 * - UI-specific shapes (DetachmentAarState, CampaignDetailSummary, etc.)
 * 
 * All domain types that exist in generated.ts should be imported from there directly.
 */

import type { Campaign, CampaignMetadata, CombatUnit, Detachment, Pilot, ResolvedStepValues as GeneratedResolvedStepValues, GetMyCommandsQuery, GetManagedCampaignsQuery, GetCampaignMetadataQuery, GetUnitDossierQuery, Query } from './generated';

// ==================== UI Input Helpers ====================

/**
 * Represents a numeric value during UI entry.
 * Allows strings to handle intermediate states like empty fields or 
 * a lone negative sign ("-") before the number is fully typed.
 */
export type NumericInput = string | number;

/**
 * Utility to map a query name to an entity type for GraphQL response structures.
 */
export type GQLResponse<K extends string, T> = {
    [P in K]: T;
};

// ==================== Domain Enums ====================

export type UnitType = 'BM' | 'CV' | 'PM' | 'IM' | 'BA' | 'CI';
export type TechBase = 'Inner Sphere' | 'Clan' | 'Mixed';
export type UnitStatus = 'OPERATIONAL' | 'ARMOR DAMAGE' | 'INTERNAL DAMAGE' | 'CRIPPLED' | 'DESTROYED' | 'TRULY DESTROYED';

// ==================== UI-Specific Shapes ====================

/**
 * Simplified campaign summary for active campaigns list.
 */
export type ActiveCampaignSummary = Pick<Campaign, 'id' | 'name' | 'systemName' | 'status' | 'lengthInMonths' | 'trackCount' | 'monthlyPay' | 'monthlyMaintenance'>;

/**
 * Minimal campaign metadata for public views.
 */
export type PublicCampaignMetadataMinimal = Pick<
    CampaignMetadata,
    'unitStatuses' | 'unitTypes' | 'techBases' | 'armorMultiplier' | 'internalMultiplier' | 'crippledMultiplier' | 'destroyedMultiplier' | 'nonMechModifier' | 'mixedTechModifier' | 'clanTechModifier' | 'omnimechReconfigureModifier' | 'rearmCostPerTon' | 'healMechWarriorPerWoundBoxCost' | 'healMechWarriorPerMonthLimit' | 'pvPurchaseUnitMultiplier' | 'pvSellUnitMultiplier'
>;

/**
 * Full campaign metadata with pricing rules.
 */
export type PublicCampaignMetadataWithRules = PublicCampaignMetadataMinimal & Pick<
    CampaignMetadata,
    'missions' | 'trackTypes' | 'factions' | 'employerTypes' | 'resolvedSteps' |
    'hireNamedPilotCost' | 'hireBattleArmorCost' | 'trainFormationCommanderCost' | 'changeFormationTrainingCost' |
    'learnCommandAbility1Cost' | 'learnCommandAbility2Cost' | 'learnCommandAbility3Cost' | 'replaceCommandAbilityCost'
>;

/**
 * Campaign detail with all tracks and contract information.
 */
export type CampaignDetail = Campaign;

/**
 * Track detail with complications and AAR narrative.
 */
export type TrackDetail = import('./generated').CampaignTrack;

/**
 * Proposed track for campaign generation.
 */
export type ProposedTrack = import('./generated').ProposedTrack;

/**
 * Contract preview before creation.
 */
export type ContractPreview = import('./generated').Contract;

/**
 * Campaign proposal for preview.
 */
export type Proposal = import('./generated').CampaignProposal;

/**
 * Detachment state for After Action Report editing.
 */
export interface DetachmentAarState extends Detachment {
    units?: CombatUnit[];
    pilots?: Pilot[];
    selectedContractId?: string;
    selectedLevel?: number;
    outcomeMultiplier?: number;
    salvageValue?: NumericInput;
    customAward?: NumericInput;
    payRate?: number;
    salvageCoverage?: number;
}

/**
 * Simplified campaign detail summary for list views.
 */
export type CampaignDetailSummary = Pick<Campaign, 'id' | 'name' | 'status' | 'trackCount' | 'contracts' | 'monthlyPay' | 'monthlyMaintenance' | 'transportationCost'>;

/**
 * Repair rules input for configuration.
 */
export interface RepairRulesInput {
    armorMultiplier?: number;
    internalMultiplier?: number;
    crippledMultiplier?: number;
    destroyedMultiplier?: number;
    nonMechModifier?: number;
    mixedTechModifier?: number;
    clanTechModifier?: number;
    rearmCostPerTon?: number;
    hireMechWarriorCost?: number;
    healMechWarriorPerWoundBoxCost?: number;
}

/**
 * User profile for authentication.
 */
export interface Profile {
    email: string;
    name: string;
}

/**
 * Resolved step values for contract pricing.
 */
export type ResolvedStepValues = GeneratedResolvedStepValues;
export type ResolvedStep = ResolvedStepValues;
export type ResolvedSteps = Record<string, ResolvedStep>;

/**
 * Composite type for the Unit Dossier view.
 */
export interface UnitDossierData {
    getCommand: GetUnitDossierQuery['getCommand'];
    managedCampaigns: GetManagedCampaignsQuery['managedCampaigns'];
    publicCampaignMetadata: GetCampaignMetadataQuery['publicCampaignMetadata'];
}

/**
 * Composite type for the Force Dashboard view.
 */
export interface ForceData {
    myCommands: GetMyCommandsQuery['myCommands'];
    managedCampaigns: GetManagedCampaignsQuery['managedCampaigns'];
    participatingCampaigns: Query['participatingCampaigns'];
}

