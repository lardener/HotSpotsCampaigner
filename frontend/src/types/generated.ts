import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Campaign = {
  __typename?: 'Campaign';
  armorMultiplier?: Maybe<Scalars['Float']['output']>;
  campaignInvites?: Maybe<Array<Maybe<CampaignInvite>>>;
  changeFormationTrainingCost?: Maybe<Scalars['Int']['output']>;
  clanTechModifier?: Maybe<Scalars['Float']['output']>;
  combatPay?: Maybe<Scalars['Int']['output']>;
  commandRights?: Maybe<Scalars['String']['output']>;
  commandStep?: Maybe<Scalars['Int']['output']>;
  contracts?: Maybe<Array<Maybe<Contract>>>;
  crippledMultiplier?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  destroyedMultiplier?: Maybe<Scalars['Float']['output']>;
  factions?: Maybe<Array<Maybe<CampaignFaction>>>;
  healBattleArmorCost?: Maybe<Scalars['Int']['output']>;
  healMechWarriorPerMonthLimit?: Maybe<Scalars['Int']['output']>;
  healMechWarriorPerWoundBoxCost?: Maybe<Scalars['Int']['output']>;
  hireBattleArmorCost?: Maybe<Scalars['Int']['output']>;
  hireMechWarriorCost?: Maybe<Scalars['Int']['output']>;
  hireNamedPilotCost?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  internalMultiplier?: Maybe<Scalars['Float']['output']>;
  isManager?: Maybe<Scalars['Boolean']['output']>;
  isParticipant?: Maybe<Scalars['Boolean']['output']>;
  learnCommandAbility1Cost?: Maybe<Scalars['Int']['output']>;
  learnCommandAbility2Cost?: Maybe<Scalars['Int']['output']>;
  learnCommandAbility3Cost?: Maybe<Scalars['Int']['output']>;
  lengthInMonths?: Maybe<Scalars['Int']['output']>;
  managerId?: Maybe<Scalars['String']['output']>;
  mixedTechModifier?: Maybe<Scalars['Float']['output']>;
  monthlyMaintenance?: Maybe<Scalars['Int']['output']>;
  monthlyPay?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  nonMechModifier?: Maybe<Scalars['Float']['output']>;
  omnimechReconfigureModifier?: Maybe<Scalars['Float']['output']>;
  participatingDetachments?: Maybe<Array<Maybe<Detachment>>>;
  payRate?: Maybe<Scalars['Float']['output']>;
  payStep?: Maybe<Scalars['Int']['output']>;
  primaryEmployer?: Maybe<Scalars['String']['output']>;
  pvPurchaseUnitMultiplier?: Maybe<Scalars['Int']['output']>;
  pvSellUnitMultiplier?: Maybe<Scalars['Int']['output']>;
  rearmCostPerTon?: Maybe<Scalars['Int']['output']>;
  rearmCostPerTonAlphaStrike?: Maybe<Scalars['Int']['output']>;
  replaceCommandAbilityCost?: Maybe<Scalars['Int']['output']>;
  salvageStep?: Maybe<Scalars['Int']['output']>;
  salvageTerms?: Maybe<Scalars['String']['output']>;
  secondaryEmployer?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  supportStep?: Maybe<Scalars['Int']['output']>;
  supportTerms?: Maybe<Scalars['String']['output']>;
  systemName?: Maybe<Scalars['String']['output']>;
  trackCount?: Maybe<Scalars['Int']['output']>;
  tracks?: Maybe<Array<Maybe<CampaignTrack>>>;
  trainFormationCommanderCost?: Maybe<Scalars['Int']['output']>;
  transportStep?: Maybe<Scalars['Int']['output']>;
  transportTerms?: Maybe<Scalars['String']['output']>;
  transportationCost?: Maybe<Scalars['Int']['output']>;
};

export type CampaignCreateInput = {
  armorMultiplier?: InputMaybe<Scalars['Float']['input']>;
  changeFormationTrainingCost?: InputMaybe<Scalars['Int']['input']>;
  clanTechModifier?: InputMaybe<Scalars['Float']['input']>;
  combatPay?: InputMaybe<Scalars['Int']['input']>;
  commandRights?: InputMaybe<Scalars['String']['input']>;
  commandStep?: InputMaybe<Scalars['Int']['input']>;
  crippledMultiplier?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  destroyedMultiplier?: InputMaybe<Scalars['Float']['input']>;
  employer?: InputMaybe<Scalars['String']['input']>;
  employerCategory?: InputMaybe<Scalars['String']['input']>;
  healBattleArmorCost?: InputMaybe<Scalars['Int']['input']>;
  healMechWarriorPerMonthLimit?: InputMaybe<Scalars['Int']['input']>;
  healMechWarriorPerWoundBoxCost?: InputMaybe<Scalars['Int']['input']>;
  hireBattleArmorCost?: InputMaybe<Scalars['Int']['input']>;
  hireMechWarriorCost?: InputMaybe<Scalars['Int']['input']>;
  hireNamedPilotCost?: InputMaybe<Scalars['Int']['input']>;
  internalMultiplier?: InputMaybe<Scalars['Float']['input']>;
  learnCommandAbility1Cost?: InputMaybe<Scalars['Int']['input']>;
  learnCommandAbility2Cost?: InputMaybe<Scalars['Int']['input']>;
  learnCommandAbility3Cost?: InputMaybe<Scalars['Int']['input']>;
  lengthInMonths?: InputMaybe<Scalars['Int']['input']>;
  mission?: InputMaybe<Scalars['String']['input']>;
  mixedTechModifier?: InputMaybe<Scalars['Float']['input']>;
  monthlyMaintenance?: InputMaybe<Scalars['Int']['input']>;
  monthlyPay?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  nonMechModifier?: InputMaybe<Scalars['Float']['input']>;
  omnimechReconfigureModifier?: InputMaybe<Scalars['Float']['input']>;
  oppCommandRights?: InputMaybe<Scalars['String']['input']>;
  oppCommandStep?: InputMaybe<Scalars['Int']['input']>;
  oppMission?: InputMaybe<Scalars['String']['input']>;
  oppPayRate?: InputMaybe<Scalars['Float']['input']>;
  oppPayStep?: InputMaybe<Scalars['Int']['input']>;
  oppSalvageStep?: InputMaybe<Scalars['Int']['input']>;
  oppSalvageTerms?: InputMaybe<Scalars['String']['input']>;
  oppSupportStep?: InputMaybe<Scalars['Int']['input']>;
  oppSupportTerms?: InputMaybe<Scalars['String']['input']>;
  oppTransportStep?: InputMaybe<Scalars['Int']['input']>;
  oppTransportTerms?: InputMaybe<Scalars['String']['input']>;
  opponent?: InputMaybe<Scalars['String']['input']>;
  opponentCategory?: InputMaybe<Scalars['String']['input']>;
  payRate?: InputMaybe<Scalars['Float']['input']>;
  payStep?: InputMaybe<Scalars['Int']['input']>;
  pvPurchaseUnitMultiplier?: InputMaybe<Scalars['Int']['input']>;
  pvSellUnitMultiplier?: InputMaybe<Scalars['Int']['input']>;
  rearmCostPerTon?: InputMaybe<Scalars['Int']['input']>;
  rearmCostPerTonAlphaStrike?: InputMaybe<Scalars['Int']['input']>;
  replaceCommandAbilityCost?: InputMaybe<Scalars['Int']['input']>;
  salvageStep?: InputMaybe<Scalars['Int']['input']>;
  salvageTerms?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  supportStep?: InputMaybe<Scalars['Int']['input']>;
  supportTerms?: InputMaybe<Scalars['String']['input']>;
  systemName?: InputMaybe<Scalars['String']['input']>;
  trackCount?: InputMaybe<Scalars['Int']['input']>;
  tracks?: InputMaybe<Array<InputMaybe<ProposedTrackInput>>>;
  trainFormationCommanderCost?: InputMaybe<Scalars['Int']['input']>;
  transportStep?: InputMaybe<Scalars['Int']['input']>;
  transportTerms?: InputMaybe<Scalars['String']['input']>;
  transportationCost?: InputMaybe<Scalars['Int']['input']>;
};

export type CampaignFaction = {
  __typename?: 'CampaignFaction';
  campaignId: Scalars['ID']['output'];
  factionName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  offersContracts?: Maybe<Scalars['Boolean']['output']>;
  shortDescription?: Maybe<Scalars['String']['output']>;
};

export type CampaignInvite = {
  __typename?: 'CampaignInvite';
  campaignId: Scalars['ID']['output'];
  expiresAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  recipientName?: Maybe<Scalars['String']['output']>;
  token?: Maybe<Scalars['String']['output']>;
  used?: Maybe<Scalars['Boolean']['output']>;
};

export type CampaignMetadata = {
  __typename?: 'CampaignMetadata';
  armorMultiplier?: Maybe<Scalars['Float']['output']>;
  changeFormationTrainingCost?: Maybe<Scalars['Int']['output']>;
  clanTechModifier?: Maybe<Scalars['Float']['output']>;
  crippledMultiplier?: Maybe<Scalars['Float']['output']>;
  destroyedMultiplier?: Maybe<Scalars['Float']['output']>;
  employerTypes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  factions?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  healBattleArmorCost?: Maybe<Scalars['Int']['output']>;
  healMechWarriorPerMonthLimit?: Maybe<Scalars['Int']['output']>;
  healMechWarriorPerWoundBoxCost?: Maybe<Scalars['Int']['output']>;
  hireBattleArmorCost?: Maybe<Scalars['Int']['output']>;
  hireMechWarriorCost?: Maybe<Scalars['Int']['output']>;
  hireNamedPilotCost?: Maybe<Scalars['Int']['output']>;
  internalMultiplier?: Maybe<Scalars['Float']['output']>;
  learnCommandAbility1Cost?: Maybe<Scalars['Int']['output']>;
  learnCommandAbility2Cost?: Maybe<Scalars['Int']['output']>;
  learnCommandAbility3Cost?: Maybe<Scalars['Int']['output']>;
  missions?: Maybe<MissionMetadata>;
  mixedTechModifier?: Maybe<Scalars['Float']['output']>;
  nonMechModifier?: Maybe<Scalars['Float']['output']>;
  omnimechReconfigureModifier?: Maybe<Scalars['Float']['output']>;
  pvPurchaseUnitMultiplier?: Maybe<Scalars['Int']['output']>;
  pvSellUnitMultiplier?: Maybe<Scalars['Int']['output']>;
  rearmCostPerTon?: Maybe<Scalars['Int']['output']>;
  rearmCostPerTonAlphaStrike?: Maybe<Scalars['Int']['output']>;
  replaceCommandAbilityCost?: Maybe<Scalars['Int']['output']>;
  resolvedSteps?: Maybe<Array<Maybe<ResolvedStepEntry>>>;
  techBases?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  trackTypes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  trainFormationCommanderCost?: Maybe<Scalars['Int']['output']>;
  unitStatuses?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  unitTypes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type CampaignProposal = {
  __typename?: 'CampaignProposal';
  armorMultiplier?: Maybe<Scalars['Float']['output']>;
  campaign?: Maybe<Campaign>;
  changeFormationTrainingCost?: Maybe<Scalars['Int']['output']>;
  clanTechModifier?: Maybe<Scalars['Float']['output']>;
  contracts?: Maybe<Array<Maybe<Contract>>>;
  crippledMultiplier?: Maybe<Scalars['Float']['output']>;
  destroyedMultiplier?: Maybe<Scalars['Float']['output']>;
  healBattleArmorCost?: Maybe<Scalars['Int']['output']>;
  healMechWarriorPerMonthLimit?: Maybe<Scalars['Int']['output']>;
  healMechWarriorPerWoundBoxCost?: Maybe<Scalars['Int']['output']>;
  hireBattleArmorCost?: Maybe<Scalars['Int']['output']>;
  hireMechWarriorCost?: Maybe<Scalars['Int']['output']>;
  hireNamedPilotCost?: Maybe<Scalars['Int']['output']>;
  internalMultiplier?: Maybe<Scalars['Float']['output']>;
  learnCommandAbility1Cost?: Maybe<Scalars['Int']['output']>;
  learnCommandAbility2Cost?: Maybe<Scalars['Int']['output']>;
  learnCommandAbility3Cost?: Maybe<Scalars['Int']['output']>;
  mixedTechModifier?: Maybe<Scalars['Float']['output']>;
  nonMechModifier?: Maybe<Scalars['Float']['output']>;
  omnimechReconfigureModifier?: Maybe<Scalars['Float']['output']>;
  pvPurchaseUnitMultiplier?: Maybe<Scalars['Int']['output']>;
  pvSellUnitMultiplier?: Maybe<Scalars['Int']['output']>;
  rearmCostPerTon?: Maybe<Scalars['Int']['output']>;
  rearmCostPerTonAlphaStrike?: Maybe<Scalars['Int']['output']>;
  replaceCommandAbilityCost?: Maybe<Scalars['Int']['output']>;
  tracks?: Maybe<Array<Maybe<ProposedTrack>>>;
  trainFormationCommanderCost?: Maybe<Scalars['Int']['output']>;
};

export type CampaignTrack = {
  __typename?: 'CampaignTrack';
  afterActionNarrative?: Maybe<Scalars['String']['output']>;
  attackerFactionId?: Maybe<Scalars['ID']['output']>;
  campaignId: Scalars['ID']['output'];
  complications?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  location?: Maybe<Scalars['String']['output']>;
  monthIndex?: Maybe<Scalars['Int']['output']>;
  nextSession?: Maybe<Scalars['String']['output']>;
  oppositionComplications?: Maybe<Scalars['String']['output']>;
  sequenceOrder?: Maybe<Scalars['Int']['output']>;
  trackName?: Maybe<Scalars['String']['output']>;
};

export type CampaignUpdateInput = {
  armorMultiplier?: InputMaybe<Scalars['Float']['input']>;
  changeFormationTrainingCost?: InputMaybe<Scalars['Int']['input']>;
  clanTechModifier?: InputMaybe<Scalars['Float']['input']>;
  combatPay?: InputMaybe<Scalars['Int']['input']>;
  commandRights?: InputMaybe<Scalars['String']['input']>;
  commandStep?: InputMaybe<Scalars['Int']['input']>;
  crippledMultiplier?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  destroyedMultiplier?: InputMaybe<Scalars['Float']['input']>;
  employer?: InputMaybe<Scalars['String']['input']>;
  employerCategory?: InputMaybe<Scalars['String']['input']>;
  healBattleArmorCost?: InputMaybe<Scalars['Int']['input']>;
  healMechWarriorPerMonthLimit?: InputMaybe<Scalars['Int']['input']>;
  healMechWarriorPerWoundBoxCost?: InputMaybe<Scalars['Int']['input']>;
  hireBattleArmorCost?: InputMaybe<Scalars['Int']['input']>;
  hireMechWarriorCost?: InputMaybe<Scalars['Int']['input']>;
  hireNamedPilotCost?: InputMaybe<Scalars['Int']['input']>;
  internalMultiplier?: InputMaybe<Scalars['Float']['input']>;
  learnCommandAbility1Cost?: InputMaybe<Scalars['Int']['input']>;
  learnCommandAbility2Cost?: InputMaybe<Scalars['Int']['input']>;
  learnCommandAbility3Cost?: InputMaybe<Scalars['Int']['input']>;
  lengthInMonths?: InputMaybe<Scalars['Int']['input']>;
  mission?: InputMaybe<Scalars['String']['input']>;
  mixedTechModifier?: InputMaybe<Scalars['Float']['input']>;
  monthlyMaintenance?: InputMaybe<Scalars['Int']['input']>;
  monthlyPay?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  nonMechModifier?: InputMaybe<Scalars['Float']['input']>;
  omnimechReconfigureModifier?: InputMaybe<Scalars['Float']['input']>;
  oppCommandRights?: InputMaybe<Scalars['String']['input']>;
  oppCommandStep?: InputMaybe<Scalars['Int']['input']>;
  oppMission?: InputMaybe<Scalars['String']['input']>;
  oppPayRate?: InputMaybe<Scalars['Float']['input']>;
  oppPayStep?: InputMaybe<Scalars['Int']['input']>;
  oppSalvageStep?: InputMaybe<Scalars['Int']['input']>;
  oppSalvageTerms?: InputMaybe<Scalars['String']['input']>;
  oppSupportStep?: InputMaybe<Scalars['Int']['input']>;
  oppSupportTerms?: InputMaybe<Scalars['String']['input']>;
  oppTransportStep?: InputMaybe<Scalars['Int']['input']>;
  oppTransportTerms?: InputMaybe<Scalars['String']['input']>;
  opponent?: InputMaybe<Scalars['String']['input']>;
  opponentCategory?: InputMaybe<Scalars['String']['input']>;
  payRate?: InputMaybe<Scalars['Float']['input']>;
  payStep?: InputMaybe<Scalars['Int']['input']>;
  pvPurchaseUnitMultiplier?: InputMaybe<Scalars['Int']['input']>;
  pvSellUnitMultiplier?: InputMaybe<Scalars['Int']['input']>;
  rearmCostPerTon?: InputMaybe<Scalars['Int']['input']>;
  rearmCostPerTonAlphaStrike?: InputMaybe<Scalars['Int']['input']>;
  replaceCommandAbilityCost?: InputMaybe<Scalars['Int']['input']>;
  salvageStep?: InputMaybe<Scalars['Int']['input']>;
  salvageTerms?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  supportStep?: InputMaybe<Scalars['Int']['input']>;
  supportTerms?: InputMaybe<Scalars['String']['input']>;
  systemName?: InputMaybe<Scalars['String']['input']>;
  trackCount?: InputMaybe<Scalars['Int']['input']>;
  trainFormationCommanderCost?: InputMaybe<Scalars['Int']['input']>;
  transportStep?: InputMaybe<Scalars['Int']['input']>;
  transportTerms?: InputMaybe<Scalars['String']['input']>;
  transportationCost?: InputMaybe<Scalars['Int']['input']>;
};

export type CombatUnit = {
  __typename?: 'CombatUnit';
  asSize?: Maybe<Scalars['Int']['output']>;
  bv?: Maybe<Scalars['Int']['output']>;
  detachmentId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  model?: Maybe<Scalars['String']['output']>;
  pv?: Maybe<Scalars['Int']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  techBase?: Maybe<Scalars['String']['output']>;
  tonnage?: Maybe<Scalars['Int']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  variant?: Maybe<Scalars['String']['output']>;
};

export type CombatUnitUpdateInput = {
  asSize?: InputMaybe<Scalars['Int']['input']>;
  bv?: InputMaybe<Scalars['Int']['input']>;
  detachmentId?: InputMaybe<Scalars['ID']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  pv?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  techBase?: InputMaybe<Scalars['String']['input']>;
  tonnage?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  variant?: InputMaybe<Scalars['String']['input']>;
};

export type CommandAssetsResponse = {
  __typename?: 'CommandAssetsResponse';
  pilots?: Maybe<Array<Maybe<Pilot>>>;
  units?: Maybe<Array<Maybe<CombatUnit>>>;
};

export type CommandUpdateInput = {
  commandingOfficer?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type Contract = {
  __typename?: 'Contract';
  commandRights?: Maybe<Scalars['String']['output']>;
  commandStep?: Maybe<Scalars['Int']['output']>;
  employerCategory?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  missionType?: Maybe<Scalars['String']['output']>;
  payRate?: Maybe<Scalars['Float']['output']>;
  payStep?: Maybe<Scalars['Int']['output']>;
  primaryContract?: Maybe<Scalars['Boolean']['output']>;
  salvageStep?: Maybe<Scalars['Int']['output']>;
  salvageTerms?: Maybe<Scalars['String']['output']>;
  supportStep?: Maybe<Scalars['Int']['output']>;
  supportTerms?: Maybe<Scalars['String']['output']>;
  trackCount?: Maybe<Scalars['Int']['output']>;
  transportStep?: Maybe<Scalars['Int']['output']>;
  transportTerms?: Maybe<Scalars['String']['output']>;
};

export type ContractAssignment = {
  __typename?: 'ContractAssignment';
  contractId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  monthIndex: Scalars['Int']['output'];
};

export type Detachment = {
  __typename?: 'Detachment';
  callsign?: Maybe<Scalars['String']['output']>;
  campaignId?: Maybe<Scalars['ID']['output']>;
  campaignName?: Maybe<Scalars['String']['output']>;
  campaignRating?: Maybe<Scalars['Int']['output']>;
  contractAssignments?: Maybe<Array<Maybe<ContractAssignment>>>;
  id: Scalars['ID']['output'];
  mercenaryCommandId?: Maybe<Scalars['ID']['output']>;
  mercenaryCommandName?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  pilots?: Maybe<Array<Maybe<Pilot>>>;
  units?: Maybe<Array<Maybe<CombatUnit>>>;
};

export type FactionReputation = {
  __typename?: 'FactionReputation';
  campaignFactionId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  mercenaryCommandId: Scalars['ID']['output'];
  score?: Maybe<Scalars['Int']['output']>;
  standing?: Maybe<Scalars['String']['output']>;
};

export type LedgerEntry = {
  __typename?: 'LedgerEntry';
  amount?: Maybe<Scalars['Int']['output']>;
  campaignId?: Maybe<Scalars['ID']['output']>;
  campaignName?: Maybe<Scalars['String']['output']>;
  commandId?: Maybe<Scalars['ID']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  detachmentId?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  monthIndex?: Maybe<Scalars['Int']['output']>;
  reputationChange?: Maybe<Scalars['Int']['output']>;
  timestamp?: Maybe<Scalars['String']['output']>;
};

export type LedgerEntryInput = {
  amount: Scalars['Int']['input'];
  campaignId?: InputMaybe<Scalars['ID']['input']>;
  campaignName?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
  monthIndex?: InputMaybe<Scalars['Int']['input']>;
  reputationChange?: InputMaybe<Scalars['Int']['input']>;
};

export type MercenaryCommand = {
  __typename?: 'MercenaryCommand';
  allLedgerEntries?: Maybe<Array<Maybe<LedgerEntry>>>;
  commandingOfficer?: Maybe<Scalars['String']['output']>;
  detachments?: Maybe<Array<Maybe<Detachment>>>;
  factionReputations?: Maybe<Array<Maybe<FactionReputation>>>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  ownerId?: Maybe<Scalars['String']['output']>;
  pilots?: Maybe<Array<Maybe<Pilot>>>;
  reputation?: Maybe<Scalars['Int']['output']>;
  totalSupportPoints?: Maybe<Scalars['Int']['output']>;
  units?: Maybe<Array<Maybe<CombatUnit>>>;
};

export type MissionMetadata = {
  __typename?: 'MissionMetadata';
  opponent?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  primary?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addCombatUnit?: Maybe<CombatUnit>;
  addLedgerEntry?: Maybe<LedgerEntry>;
  assignAsset?: Maybe<Scalars['Boolean']['output']>;
  assignDetachmentToCampaign?: Maybe<Scalars['Boolean']['output']>;
  assignDetachmentToContract?: Maybe<Scalars['Boolean']['output']>;
  createCampaign?: Maybe<Campaign>;
  createDetachment?: Maybe<Detachment>;
  createInvite?: Maybe<CampaignInvite>;
  deleteCommand?: Maybe<Scalars['Boolean']['output']>;
  deleteDetachment?: Maybe<Scalars['Boolean']['output']>;
  deleteInvite?: Maybe<Scalars['Boolean']['output']>;
  deletePilot?: Maybe<Scalars['Boolean']['output']>;
  deleteUnit?: Maybe<Scalars['Boolean']['output']>;
  establishCommand?: Maybe<MercenaryCommand>;
  hirePilot?: Maybe<Pilot>;
  importCombatUnitsFromLink?: Maybe<Array<Maybe<CombatUnit>>>;
  joinCampaign?: Maybe<Scalars['Boolean']['output']>;
  loginWithToken?: Maybe<Scalars['Boolean']['output']>;
  reorderTracks: Array<CampaignTrack>;
  rerollTrack?: Maybe<CampaignTrack>;
  updateCampaign?: Maybe<Campaign>;
  updateCombatUnit?: Maybe<CombatUnit>;
  updateCommand?: Maybe<MercenaryCommand>;
  updatePilot?: Maybe<Pilot>;
  updateTrack?: Maybe<CampaignTrack>;
  updateUserProfile?: Maybe<UserProfile>;
};


export type MutationAddCombatUnitArgs = {
  commandId: Scalars['ID']['input'];
  input: CombatUnitUpdateInput;
};


export type MutationAddLedgerEntryArgs = {
  commandId: Scalars['ID']['input'];
  detachmentId?: InputMaybe<Scalars['ID']['input']>;
  input: LedgerEntryInput;
};


export type MutationAssignAssetArgs = {
  assetId: Scalars['ID']['input'];
  assetType: Scalars['String']['input'];
  detachmentId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationAssignDetachmentToCampaignArgs = {
  campaignId?: InputMaybe<Scalars['ID']['input']>;
  detachmentId: Scalars['ID']['input'];
};


export type MutationAssignDetachmentToContractArgs = {
  contractId: Scalars['ID']['input'];
  detachmentId: Scalars['ID']['input'];
  monthIndex: Scalars['Int']['input'];
};


export type MutationCreateCampaignArgs = {
  input: CampaignCreateInput;
};


export type MutationCreateDetachmentArgs = {
  campaignId?: InputMaybe<Scalars['ID']['input']>;
  commandId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};


export type MutationCreateInviteArgs = {
  campaignId: Scalars['ID']['input'];
  recipientName?: InputMaybe<Scalars['String']['input']>;
};


export type MutationDeleteCommandArgs = {
  commandId: Scalars['ID']['input'];
  force?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationDeleteDetachmentArgs = {
  detachmentId: Scalars['ID']['input'];
};


export type MutationDeleteInviteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeletePilotArgs = {
  pilotId: Scalars['ID']['input'];
};


export type MutationDeleteUnitArgs = {
  unitId: Scalars['ID']['input'];
};


export type MutationEstablishCommandArgs = {
  input: CommandUpdateInput;
};


export type MutationHirePilotArgs = {
  commandId: Scalars['ID']['input'];
  input: PilotUpdateInput;
};


export type MutationImportCombatUnitsFromLinkArgs = {
  commandId: Scalars['ID']['input'];
  detachmentId?: InputMaybe<Scalars['ID']['input']>;
  link: Scalars['String']['input'];
};


export type MutationJoinCampaignArgs = {
  detachmentId: Scalars['ID']['input'];
  token: Scalars['String']['input'];
};


export type MutationLoginWithTokenArgs = {
  token: Scalars['String']['input'];
};


export type MutationReorderTracksArgs = {
  campaignId: Scalars['ID']['input'];
  trackIds: Array<Scalars['ID']['input']>;
};


export type MutationRerollTrackArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateCampaignArgs = {
  id: Scalars['ID']['input'];
  input: CampaignUpdateInput;
};


export type MutationUpdateCombatUnitArgs = {
  id: Scalars['ID']['input'];
  input: CombatUnitUpdateInput;
};


export type MutationUpdateCommandArgs = {
  id: Scalars['ID']['input'];
  input: CommandUpdateInput;
};


export type MutationUpdatePilotArgs = {
  id: Scalars['ID']['input'];
  input: PilotUpdateInput;
};


export type MutationUpdateTrackArgs = {
  id: Scalars['ID']['input'];
  input: TrackUpdateInput;
};


export type MutationUpdateUserProfileArgs = {
  displayName?: InputMaybe<Scalars['String']['input']>;
};

export type Pilot = {
  __typename?: 'Pilot';
  asSkill?: Maybe<Scalars['Int']['output']>;
  detachmentId?: Maybe<Scalars['ID']['output']>;
  edgeAbilities?: Maybe<Scalars['String']['output']>;
  edgeAbilitySkill?: Maybe<Scalars['Int']['output']>;
  edgeAbilitySpEarned?: Maybe<Scalars['Int']['output']>;
  edgeTokensSkill?: Maybe<Scalars['Int']['output']>;
  edgeTokensSpEarned?: Maybe<Scalars['Int']['output']>;
  gunnery?: Maybe<Scalars['Int']['output']>;
  gunnerySpEarned?: Maybe<Scalars['Int']['output']>;
  handicap?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  piloting?: Maybe<Scalars['Int']['output']>;
  pilotingSpEarned?: Maybe<Scalars['Int']['output']>;
  totalSpEarned?: Maybe<Scalars['Int']['output']>;
  unitType?: Maybe<Scalars['String']['output']>;
  wounds?: Maybe<Scalars['Int']['output']>;
};

export type PilotUpdateInput = {
  asSkill?: InputMaybe<Scalars['Int']['input']>;
  detachmentId?: InputMaybe<Scalars['ID']['input']>;
  edgeAbilities?: InputMaybe<Scalars['String']['input']>;
  edgeAbilitySkill?: InputMaybe<Scalars['Int']['input']>;
  edgeAbilitySpEarned?: InputMaybe<Scalars['Int']['input']>;
  edgeTokensSkill?: InputMaybe<Scalars['Int']['input']>;
  edgeTokensSpEarned?: InputMaybe<Scalars['Int']['input']>;
  gunnery?: InputMaybe<Scalars['Int']['input']>;
  gunnerySpEarned?: InputMaybe<Scalars['Int']['input']>;
  handicap?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  piloting?: InputMaybe<Scalars['Int']['input']>;
  pilotingSpEarned?: InputMaybe<Scalars['Int']['input']>;
  totalSpEarned?: InputMaybe<Scalars['Int']['input']>;
  unitType?: InputMaybe<Scalars['String']['input']>;
  wounds?: InputMaybe<Scalars['Int']['input']>;
};

export type ProposedTrack = {
  __typename?: 'ProposedTrack';
  complication?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  oppositionComplication?: Maybe<Scalars['String']['output']>;
};

export type ProposedTrackInput = {
  complication?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  oppositionComplication?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  activeCampaigns?: Maybe<Array<Maybe<Campaign>>>;
  campaignMetadata?: Maybe<CampaignMetadata>;
  commandAssets?: Maybe<CommandAssetsResponse>;
  generateTracks?: Maybe<Array<Maybe<ProposedTrack>>>;
  getCampaign?: Maybe<Campaign>;
  getCommand?: Maybe<MercenaryCommand>;
  managedCampaigns?: Maybe<Array<Maybe<Campaign>>>;
  myCommands?: Maybe<Array<Maybe<MercenaryCommand>>>;
  participatingCampaigns?: Maybe<Array<Maybe<Campaign>>>;
  previewCampaign?: Maybe<CampaignProposal>;
  publicActiveCampaigns?: Maybe<Array<Maybe<Campaign>>>;
  publicCampaignMetadata?: Maybe<CampaignMetadata>;
  publicPreviewCampaign?: Maybe<CampaignProposal>;
  userProfile?: Maybe<UserProfile>;
};


export type QueryActiveCampaignsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCommandAssetsArgs = {
  commandId: Scalars['ID']['input'];
};


export type QueryGenerateTracksArgs = {
  commandRights: Scalars['String']['input'];
  count: Scalars['Int']['input'];
  existing?: InputMaybe<Array<InputMaybe<ProposedTrackInput>>>;
  mission: Scalars['String']['input'];
  oppCommandRights: Scalars['String']['input'];
};


export type QueryGetCampaignArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetCommandArgs = {
  id: Scalars['ID']['input'];
};


export type QueryManagedCampaignsArgs = {
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryParticipatingCampaignsArgs = {
  commandId: Scalars['ID']['input'];
};


export type QueryPreviewCampaignArgs = {
  input: CampaignCreateInput;
};


export type QueryPublicActiveCampaignsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryPublicPreviewCampaignArgs = {
  input: CampaignCreateInput;
};

export type ResolvedStepEntry = {
  __typename?: 'ResolvedStepEntry';
  step?: Maybe<Scalars['Int']['output']>;
  values?: Maybe<ResolvedStepValues>;
};

export type ResolvedStepValues = {
  __typename?: 'ResolvedStepValues';
  commandRights?: Maybe<Scalars['String']['output']>;
  payRate?: Maybe<Scalars['String']['output']>;
  salvageRights?: Maybe<Scalars['String']['output']>;
  supportRights?: Maybe<Scalars['String']['output']>;
  transportation?: Maybe<Scalars['String']['output']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  ledgerUpdated?: Maybe<MercenaryCommand>;
};


export type SubscriptionLedgerUpdatedArgs = {
  commandId: Scalars['ID']['input'];
};

export type TrackUpdateInput = {
  afterActionNarrative?: InputMaybe<Scalars['String']['input']>;
  attackerFactionId?: InputMaybe<Scalars['ID']['input']>;
  complications?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  monthIndex?: InputMaybe<Scalars['Int']['input']>;
  nextSession?: InputMaybe<Scalars['String']['input']>;
  oppositionComplications?: InputMaybe<Scalars['String']['input']>;
  sequenceOrder?: InputMaybe<Scalars['Int']['input']>;
  trackName?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  displayName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  role?: Maybe<Scalars['String']['output']>;
};

export type UserProfile = {
  __typename?: 'UserProfile';
  displayName?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
};

export type CombatUnitFieldsFragment = { __typename?: 'CombatUnit', id: string, type?: string | null, model?: string | null, variant?: string | null, techBase?: string | null, tonnage?: number | null, asSize?: number | null, bv?: number | null, pv?: number | null, status?: string | null, detachmentId?: string | null };

export type PilotFieldsFragment = { __typename?: 'Pilot', id: string, name?: string | null, gunnery?: number | null, piloting?: number | null, asSkill?: number | null, edgeTokensSkill?: number | null, edgeAbilitySkill?: number | null, edgeAbilities?: string | null, unitType?: string | null, wounds?: number | null, handicap?: number | null, totalSpEarned?: number | null, gunnerySpEarned?: number | null, pilotingSpEarned?: number | null, edgeTokensSpEarned?: number | null, edgeAbilitySpEarned?: number | null, detachmentId?: string | null };

export type ContractFieldsFragment = { __typename?: 'Contract', id?: string | null, employerCategory?: string | null, missionType?: string | null, primaryContract?: boolean | null, payRate?: number | null, payStep?: number | null, salvageTerms?: string | null, salvageStep?: number | null, supportTerms?: string | null, supportStep?: number | null, transportTerms?: string | null, transportStep?: number | null, commandRights?: string | null, commandStep?: number | null, trackCount?: number | null };

export type TrackFieldsFragment = { __typename?: 'CampaignTrack', id: string, trackName?: string | null, sequenceOrder?: number | null, location?: string | null, nextSession?: string | null, attackerFactionId?: string | null, monthIndex?: number | null, complications?: string | null, afterActionNarrative?: string | null, oppositionComplications?: string | null };

export type CommandFieldsFragment = { __typename?: 'MercenaryCommand', id: string, name?: string | null, commandingOfficer?: string | null, totalSupportPoints?: number | null, reputation?: number | null };

export type DetachmentFieldsFragment = { __typename?: 'Detachment', id: string, name?: string | null, mercenaryCommandId?: string | null, mercenaryCommandName?: string | null, campaignId?: string | null, campaignName?: string | null, campaignRating?: number | null };

export type LedgerEntryFieldsFragment = { __typename?: 'LedgerEntry', id: string, timestamp?: string | null, detachmentId?: string | null, description?: string | null, amount?: number | null, reputationChange?: number | null, campaignId?: string | null, campaignName?: string | null, monthIndex?: number | null };

export type GetUserProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserProfileQuery = { __typename?: 'Query', userProfile?: { __typename?: 'UserProfile', id: string, name?: string | null, email?: string | null, displayName?: string | null, role?: string | null } | null };

export type LoginWithTokenMutationVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type LoginWithTokenMutation = { __typename?: 'Mutation', loginWithToken?: boolean | null };

export type UpdateUserProfileMutationVariables = Exact<{
  displayName: Scalars['String']['input'];
}>;


export type UpdateUserProfileMutation = { __typename?: 'Mutation', updateUserProfile?: { __typename?: 'UserProfile', id: string, displayName?: string | null, role?: string | null } | null };

export type GetActiveCampaignsQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetActiveCampaignsQuery = { __typename?: 'Query', publicActiveCampaigns?: Array<{ __typename?: 'Campaign', id: string, name?: string | null, description?: string | null, systemName?: string | null, status?: string | null, trackCount?: number | null, primaryEmployer?: string | null, secondaryEmployer?: string | null, participatingDetachments?: Array<{ __typename?: 'Detachment', id: string, name?: string | null, mercenaryCommandId?: string | null, mercenaryCommandName?: string | null, campaignId?: string | null, campaignName?: string | null, campaignRating?: number | null } | null> | null } | null> | null };

export type GetCampaignMetadataQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCampaignMetadataQuery = { __typename?: 'Query', publicCampaignMetadata?: { __typename?: 'CampaignMetadata', trackTypes?: Array<string | null> | null, factions?: Array<string | null> | null, employerTypes?: Array<string | null> | null, unitStatuses?: Array<string | null> | null, unitTypes?: Array<string | null> | null, techBases?: Array<string | null> | null, armorMultiplier?: number | null, internalMultiplier?: number | null, crippledMultiplier?: number | null, destroyedMultiplier?: number | null, nonMechModifier?: number | null, mixedTechModifier?: number | null, clanTechModifier?: number | null, omnimechReconfigureModifier?: number | null, pvPurchaseUnitMultiplier?: number | null, pvSellUnitMultiplier?: number | null, rearmCostPerTon?: number | null, rearmCostPerTonAlphaStrike?: number | null, hireMechWarriorCost?: number | null, hireNamedPilotCost?: number | null, hireBattleArmorCost?: number | null, healMechWarriorPerWoundBoxCost?: number | null, healMechWarriorPerMonthLimit?: number | null, healBattleArmorCost?: number | null, trainFormationCommanderCost?: number | null, changeFormationTrainingCost?: number | null, learnCommandAbility1Cost?: number | null, learnCommandAbility2Cost?: number | null, learnCommandAbility3Cost?: number | null, replaceCommandAbilityCost?: number | null, missions?: { __typename?: 'MissionMetadata', primary?: Array<string | null> | null, opponent?: Array<string | null> | null } | null, resolvedSteps?: Array<{ __typename?: 'ResolvedStepEntry', step?: number | null, values?: { __typename?: 'ResolvedStepValues', payRate?: string | null, salvageRights?: string | null, supportRights?: string | null, transportation?: string | null, commandRights?: string | null } | null } | null> | null } | null };

export type PreviewCampaignQueryVariables = Exact<{
  input: CampaignCreateInput;
}>;


export type PreviewCampaignQuery = { __typename?: 'Query', publicPreviewCampaign?: { __typename?: 'CampaignProposal', armorMultiplier?: number | null, internalMultiplier?: number | null, crippledMultiplier?: number | null, destroyedMultiplier?: number | null, nonMechModifier?: number | null, mixedTechModifier?: number | null, clanTechModifier?: number | null, omnimechReconfigureModifier?: number | null, pvPurchaseUnitMultiplier?: number | null, pvSellUnitMultiplier?: number | null, rearmCostPerTon?: number | null, rearmCostPerTonAlphaStrike?: number | null, hireMechWarriorCost?: number | null, hireNamedPilotCost?: number | null, hireBattleArmorCost?: number | null, healMechWarriorPerWoundBoxCost?: number | null, healMechWarriorPerMonthLimit?: number | null, healBattleArmorCost?: number | null, trainFormationCommanderCost?: number | null, changeFormationTrainingCost?: number | null, learnCommandAbility1Cost?: number | null, learnCommandAbility2Cost?: number | null, learnCommandAbility3Cost?: number | null, replaceCommandAbilityCost?: number | null, campaign?: { __typename?: 'Campaign', name?: string | null, systemName?: string | null, trackCount?: number | null, lengthInMonths?: number | null, monthlyPay?: number | null, monthlyMaintenance?: number | null, transportationCost?: number | null, combatPay?: number | null } | null, contracts?: Array<{ __typename?: 'Contract', employerCategory?: string | null, missionType?: string | null, primaryContract?: boolean | null, payRate?: number | null, payStep?: number | null, salvageTerms?: string | null, salvageStep?: number | null, supportTerms?: string | null, supportStep?: number | null, transportTerms?: string | null, transportStep?: number | null, commandRights?: string | null, commandStep?: number | null, trackCount?: number | null } | null> | null, tracks?: Array<{ __typename?: 'ProposedTrack', name?: string | null, complication?: string | null, oppositionComplication?: string | null } | null> | null } | null };

export type GenerateTracksQueryVariables = Exact<{
  mission: Scalars['String']['input'];
  commandRights: Scalars['String']['input'];
  oppCommandRights: Scalars['String']['input'];
  count: Scalars['Int']['input'];
  existing?: InputMaybe<Array<InputMaybe<ProposedTrackInput>> | InputMaybe<ProposedTrackInput>>;
}>;


export type GenerateTracksQuery = { __typename?: 'Query', generateTracks?: Array<{ __typename?: 'ProposedTrack', name?: string | null, complication?: string | null, oppositionComplication?: string | null } | null> | null };

export type CreateCampaignMutationVariables = Exact<{
  input: CampaignCreateInput;
}>;


export type CreateCampaignMutation = { __typename?: 'Mutation', createCampaign?: { __typename?: 'Campaign', id: string, name?: string | null, systemName?: string | null, description?: string | null, lengthInMonths?: number | null, trackCount?: number | null, monthlyPay?: number | null, monthlyMaintenance?: number | null, transportationCost?: number | null, combatPay?: number | null, status?: string | null, payRate?: number | null, payStep?: number | null, salvageTerms?: string | null, salvageStep?: number | null, supportTerms?: string | null, supportStep?: number | null, transportTerms?: string | null, transportStep?: number | null, commandRights?: string | null, commandStep?: number | null, armorMultiplier?: number | null, internalMultiplier?: number | null, crippledMultiplier?: number | null, destroyedMultiplier?: number | null, nonMechModifier?: number | null, mixedTechModifier?: number | null, clanTechModifier?: number | null, omnimechReconfigureModifier?: number | null, pvPurchaseUnitMultiplier?: number | null, pvSellUnitMultiplier?: number | null, rearmCostPerTon?: number | null, rearmCostPerTonAlphaStrike?: number | null, hireMechWarriorCost?: number | null, hireNamedPilotCost?: number | null, hireBattleArmorCost?: number | null, healMechWarriorPerWoundBoxCost?: number | null, healMechWarriorPerMonthLimit?: number | null, healBattleArmorCost?: number | null, trainFormationCommanderCost?: number | null, changeFormationTrainingCost?: number | null, learnCommandAbility1Cost?: number | null, learnCommandAbility2Cost?: number | null, learnCommandAbility3Cost?: number | null, replaceCommandAbilityCost?: number | null } | null };

export type UpdateCampaignMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: CampaignUpdateInput;
}>;


export type UpdateCampaignMutation = { __typename?: 'Mutation', updateCampaign?: { __typename?: 'Campaign', id: string, name?: string | null, systemName?: string | null, description?: string | null, lengthInMonths?: number | null, trackCount?: number | null, monthlyPay?: number | null, monthlyMaintenance?: number | null, transportationCost?: number | null, combatPay?: number | null, status?: string | null, payRate?: number | null, payStep?: number | null, salvageTerms?: string | null, salvageStep?: number | null, supportTerms?: string | null, supportStep?: number | null, transportTerms?: string | null, transportStep?: number | null, commandRights?: string | null, commandStep?: number | null, armorMultiplier?: number | null, internalMultiplier?: number | null, crippledMultiplier?: number | null, destroyedMultiplier?: number | null, nonMechModifier?: number | null, mixedTechModifier?: number | null, clanTechModifier?: number | null, omnimechReconfigureModifier?: number | null, pvPurchaseUnitMultiplier?: number | null, pvSellUnitMultiplier?: number | null, rearmCostPerTon?: number | null, rearmCostPerTonAlphaStrike?: number | null, hireMechWarriorCost?: number | null, hireNamedPilotCost?: number | null, hireBattleArmorCost?: number | null, healMechWarriorPerWoundBoxCost?: number | null, healMechWarriorPerMonthLimit?: number | null, healBattleArmorCost?: number | null, trainFormationCommanderCost?: number | null, changeFormationTrainingCost?: number | null, learnCommandAbility1Cost?: number | null, learnCommandAbility2Cost?: number | null, learnCommandAbility3Cost?: number | null, replaceCommandAbilityCost?: number | null } | null };

export type GetManagedCampaignsQueryVariables = Exact<{
  status?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetManagedCampaignsQuery = { __typename?: 'Query', managedCampaigns?: Array<{ __typename?: 'Campaign', id: string, name?: string | null, systemName?: string | null, description?: string | null, status?: string | null, trackCount?: number | null, primaryEmployer?: string | null, secondaryEmployer?: string | null, payRate?: number | null, salvageTerms?: string | null, supportTerms?: string | null, transportTerms?: string | null, commandRights?: string | null, payStep?: number | null, salvageStep?: number | null, supportStep?: number | null, transportStep?: number | null, commandStep?: number | null, armorMultiplier?: number | null, internalMultiplier?: number | null, crippledMultiplier?: number | null, destroyedMultiplier?: number | null, nonMechModifier?: number | null, mixedTechModifier?: number | null, clanTechModifier?: number | null, omnimechReconfigureModifier?: number | null, pvPurchaseUnitMultiplier?: number | null, pvSellUnitMultiplier?: number | null, rearmCostPerTon?: number | null, rearmCostPerTonAlphaStrike?: number | null, hireMechWarriorCost?: number | null, hireNamedPilotCost?: number | null, hireBattleArmorCost?: number | null, healMechWarriorPerWoundBoxCost?: number | null, healMechWarriorPerMonthLimit?: number | null, healBattleArmorCost?: number | null, trainFormationCommanderCost?: number | null, changeFormationTrainingCost?: number | null, learnCommandAbility1Cost?: number | null, learnCommandAbility2Cost?: number | null, learnCommandAbility3Cost?: number | null, replaceCommandAbilityCost?: number | null, contracts?: Array<{ __typename?: 'Contract', id?: string | null, employerCategory?: string | null, missionType?: string | null, primaryContract?: boolean | null, payRate?: number | null, payStep?: number | null, salvageTerms?: string | null, salvageStep?: number | null, supportTerms?: string | null, supportStep?: number | null, transportTerms?: string | null, transportStep?: number | null, commandRights?: string | null, commandStep?: number | null, trackCount?: number | null } | null> | null, factions?: Array<{ __typename?: 'CampaignFaction', id: string, factionName?: string | null } | null> | null, tracks?: Array<{ __typename?: 'CampaignTrack', id: string, trackName?: string | null, sequenceOrder?: number | null, location?: string | null, nextSession?: string | null, attackerFactionId?: string | null, monthIndex?: number | null, complications?: string | null, afterActionNarrative?: string | null, oppositionComplications?: string | null } | null> | null, participatingDetachments?: Array<{ __typename?: 'Detachment', id: string, name?: string | null, mercenaryCommandId?: string | null, mercenaryCommandName?: string | null, campaignId?: string | null, campaignName?: string | null, campaignRating?: number | null } | null> | null } | null> | null };

export type CreateDetachmentMutationVariables = Exact<{
  commandId: Scalars['ID']['input'];
  campaignId?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
}>;


export type CreateDetachmentMutation = { __typename?: 'Mutation', createDetachment?: { __typename?: 'Detachment', id: string, name?: string | null, mercenaryCommandId?: string | null, mercenaryCommandName?: string | null, campaignId?: string | null, campaignName?: string | null, campaignRating?: number | null } | null };

export type DeleteDetachmentMutationVariables = Exact<{
  detachmentId: Scalars['ID']['input'];
}>;


export type DeleteDetachmentMutation = { __typename?: 'Mutation', deleteDetachment?: boolean | null };

export type AssignDetachmentToCampaignMutationVariables = Exact<{
  detachmentId: Scalars['ID']['input'];
  campaignId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type AssignDetachmentToCampaignMutation = { __typename?: 'Mutation', assignDetachmentToCampaign?: boolean | null };

export type GetPublicCampaignDetailsQueryVariables = Exact<{
  campaignId: Scalars['ID']['input'];
}>;


export type GetPublicCampaignDetailsQuery = { __typename?: 'Query', getCampaign?: { __typename?: 'Campaign', id: string, name?: string | null, systemName?: string | null, description?: string | null, lengthInMonths?: number | null, trackCount?: number | null, status?: string | null, primaryEmployer?: string | null, secondaryEmployer?: string | null, tracks?: Array<{ __typename?: 'CampaignTrack', id: string, trackName?: string | null, sequenceOrder?: number | null, location?: string | null, nextSession?: string | null, attackerFactionId?: string | null, monthIndex?: number | null, complications?: string | null, afterActionNarrative?: string | null, oppositionComplications?: string | null } | null> | null, participatingDetachments?: Array<{ __typename?: 'Detachment', id: string, name?: string | null, mercenaryCommandId?: string | null, mercenaryCommandName?: string | null, campaignId?: string | null, campaignName?: string | null, campaignRating?: number | null, units?: Array<{ __typename?: 'CombatUnit', id: string, type?: string | null, model?: string | null, variant?: string | null, techBase?: string | null, tonnage?: number | null, asSize?: number | null, bv?: number | null, pv?: number | null, status?: string | null, detachmentId?: string | null } | null> | null, pilots?: Array<{ __typename?: 'Pilot', id: string, name?: string | null, gunnery?: number | null, piloting?: number | null, asSkill?: number | null, edgeTokensSkill?: number | null, edgeAbilitySkill?: number | null, edgeAbilities?: string | null, unitType?: string | null, wounds?: number | null, handicap?: number | null, totalSpEarned?: number | null, gunnerySpEarned?: number | null, pilotingSpEarned?: number | null, edgeTokensSpEarned?: number | null, edgeAbilitySpEarned?: number | null, detachmentId?: string | null } | null> | null } | null> | null } | null };

export type JoinCampaignMutationVariables = Exact<{
  token: Scalars['String']['input'];
  detachmentId: Scalars['ID']['input'];
}>;


export type JoinCampaignMutation = { __typename?: 'Mutation', joinCampaign?: boolean | null };

export type GetCampaignDetailsQueryVariables = Exact<{
  campaignId: Scalars['ID']['input'];
}>;


export type GetCampaignDetailsQuery = { __typename?: 'Query', getCampaign?: { __typename?: 'Campaign', id: string, name?: string | null, systemName?: string | null, description?: string | null, lengthInMonths?: number | null, trackCount?: number | null, isManager?: boolean | null, isParticipant?: boolean | null, status?: string | null, primaryEmployer?: string | null, secondaryEmployer?: string | null, monthlyPay?: number | null, monthlyMaintenance?: number | null, transportationCost?: number | null, combatPay?: number | null, payRate?: number | null, payStep?: number | null, salvageTerms?: string | null, salvageStep?: number | null, supportTerms?: string | null, supportStep?: number | null, transportTerms?: string | null, transportStep?: number | null, commandRights?: string | null, commandStep?: number | null, armorMultiplier?: number | null, internalMultiplier?: number | null, crippledMultiplier?: number | null, destroyedMultiplier?: number | null, nonMechModifier?: number | null, mixedTechModifier?: number | null, clanTechModifier?: number | null, omnimechReconfigureModifier?: number | null, pvPurchaseUnitMultiplier?: number | null, pvSellUnitMultiplier?: number | null, rearmCostPerTon?: number | null, rearmCostPerTonAlphaStrike?: number | null, hireMechWarriorCost?: number | null, hireNamedPilotCost?: number | null, hireBattleArmorCost?: number | null, healMechWarriorPerWoundBoxCost?: number | null, healMechWarriorPerMonthLimit?: number | null, healBattleArmorCost?: number | null, trainFormationCommanderCost?: number | null, changeFormationTrainingCost?: number | null, learnCommandAbility1Cost?: number | null, learnCommandAbility2Cost?: number | null, learnCommandAbility3Cost?: number | null, replaceCommandAbilityCost?: number | null, contracts?: Array<{ __typename?: 'Contract', id?: string | null, employerCategory?: string | null, missionType?: string | null, primaryContract?: boolean | null, payRate?: number | null, payStep?: number | null, salvageTerms?: string | null, salvageStep?: number | null, supportTerms?: string | null, supportStep?: number | null, transportTerms?: string | null, transportStep?: number | null, commandRights?: string | null, commandStep?: number | null, trackCount?: number | null } | null> | null, factions?: Array<{ __typename?: 'CampaignFaction', id: string, factionName?: string | null } | null> | null, tracks?: Array<{ __typename?: 'CampaignTrack', id: string, trackName?: string | null, sequenceOrder?: number | null, location?: string | null, nextSession?: string | null, attackerFactionId?: string | null, monthIndex?: number | null, complications?: string | null, afterActionNarrative?: string | null, oppositionComplications?: string | null } | null> | null, participatingDetachments?: Array<{ __typename?: 'Detachment', id: string, name?: string | null, mercenaryCommandId?: string | null, mercenaryCommandName?: string | null, campaignId?: string | null, campaignName?: string | null, campaignRating?: number | null, units?: Array<{ __typename?: 'CombatUnit', id: string, type?: string | null, model?: string | null, variant?: string | null, techBase?: string | null, tonnage?: number | null, asSize?: number | null, bv?: number | null, pv?: number | null, status?: string | null, detachmentId?: string | null } | null> | null, pilots?: Array<{ __typename?: 'Pilot', id: string, name?: string | null, gunnery?: number | null, piloting?: number | null, asSkill?: number | null, edgeTokensSkill?: number | null, edgeAbilitySkill?: number | null, edgeAbilities?: string | null, unitType?: string | null, wounds?: number | null, handicap?: number | null, totalSpEarned?: number | null, gunnerySpEarned?: number | null, pilotingSpEarned?: number | null, edgeTokensSpEarned?: number | null, edgeAbilitySpEarned?: number | null, detachmentId?: string | null } | null> | null } | null> | null, campaignInvites?: Array<{ __typename?: 'CampaignInvite', id: string, token?: string | null, recipientName?: string | null, expiresAt?: string | null, used?: boolean | null } | null> | null } | null };

export type UpdateTrackMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: TrackUpdateInput;
}>;


export type UpdateTrackMutation = { __typename?: 'Mutation', updateTrack?: { __typename?: 'CampaignTrack', id: string, trackName?: string | null, location?: string | null, nextSession?: string | null, attackerFactionId?: string | null, monthIndex?: number | null, complications?: string | null, afterActionNarrative?: string | null, oppositionComplications?: string | null } | null };

export type RerollTrackMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RerollTrackMutation = { __typename?: 'Mutation', rerollTrack?: { __typename?: 'CampaignTrack', id: string, trackName?: string | null, complications?: string | null, oppositionComplications?: string | null } | null };

export type ReorderTracksMutationVariables = Exact<{
  campaignId: Scalars['ID']['input'];
  trackIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type ReorderTracksMutation = { __typename?: 'Mutation', reorderTracks: Array<{ __typename?: 'CampaignTrack', id: string, sequenceOrder?: number | null, trackName?: string | null, location?: string | null, nextSession?: string | null, attackerFactionId?: string | null, monthIndex?: number | null, complications?: string | null, afterActionNarrative?: string | null, oppositionComplications?: string | null }> };

export type CreateInviteMutationVariables = Exact<{
  campaignId: Scalars['ID']['input'];
  recipientName?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateInviteMutation = { __typename?: 'Mutation', createInvite?: { __typename?: 'CampaignInvite', token?: string | null, recipientName?: string | null } | null };

export type DeleteInviteMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteInviteMutation = { __typename?: 'Mutation', deleteInvite?: boolean | null };

export type GetMyCommandsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyCommandsQuery = { __typename?: 'Query', myCommands?: Array<{ __typename?: 'MercenaryCommand', id: string, name?: string | null, commandingOfficer?: string | null, totalSupportPoints?: number | null, reputation?: number | null, detachments?: Array<{ __typename?: 'Detachment', id: string, name?: string | null, mercenaryCommandId?: string | null, mercenaryCommandName?: string | null, campaignId?: string | null, campaignName?: string | null, campaignRating?: number | null } | null> | null } | null> | null };

export type GetUnitDossierQueryVariables = Exact<{
  commandId: Scalars['ID']['input'];
}>;


export type GetUnitDossierQuery = { __typename?: 'Query', getCommand?: { __typename?: 'MercenaryCommand', id: string, name?: string | null, commandingOfficer?: string | null, totalSupportPoints?: number | null, reputation?: number | null, units?: Array<{ __typename?: 'CombatUnit', id: string, type?: string | null, model?: string | null, variant?: string | null, techBase?: string | null, tonnage?: number | null, asSize?: number | null, bv?: number | null, pv?: number | null, status?: string | null, detachmentId?: string | null } | null> | null, pilots?: Array<{ __typename?: 'Pilot', id: string, name?: string | null, gunnery?: number | null, piloting?: number | null, asSkill?: number | null, edgeTokensSkill?: number | null, edgeAbilitySkill?: number | null, edgeAbilities?: string | null, unitType?: string | null, wounds?: number | null, handicap?: number | null, totalSpEarned?: number | null, gunnerySpEarned?: number | null, pilotingSpEarned?: number | null, edgeTokensSpEarned?: number | null, edgeAbilitySpEarned?: number | null, detachmentId?: string | null } | null> | null, detachments?: Array<{ __typename?: 'Detachment', id: string, name?: string | null, mercenaryCommandId?: string | null, mercenaryCommandName?: string | null, campaignId?: string | null, campaignName?: string | null, campaignRating?: number | null } | null> | null, allLedgerEntries?: Array<{ __typename?: 'LedgerEntry', id: string, timestamp?: string | null, detachmentId?: string | null, description?: string | null, amount?: number | null, reputationChange?: number | null, campaignId?: string | null, campaignName?: string | null, monthIndex?: number | null } | null> | null } | null, managedCampaigns?: Array<{ __typename?: 'Campaign', id: string, name?: string | null } | null> | null, publicCampaignMetadata?: { __typename?: 'CampaignMetadata', unitStatuses?: Array<string | null> | null, unitTypes?: Array<string | null> | null, techBases?: Array<string | null> | null, armorMultiplier?: number | null, internalMultiplier?: number | null, crippledMultiplier?: number | null, destroyedMultiplier?: number | null, nonMechModifier?: number | null, mixedTechModifier?: number | null, clanTechModifier?: number | null, omnimechReconfigureModifier?: number | null, pvPurchaseUnitMultiplier?: number | null, pvSellUnitMultiplier?: number | null, rearmCostPerTon?: number | null, rearmCostPerTonAlphaStrike?: number | null, hireMechWarriorCost?: number | null, hireNamedPilotCost?: number | null, hireBattleArmorCost?: number | null, healMechWarriorPerWoundBoxCost?: number | null, healMechWarriorPerMonthLimit?: number | null, healBattleArmorCost?: number | null, trainFormationCommanderCost?: number | null, changeFormationTrainingCost?: number | null, learnCommandAbility1Cost?: number | null, learnCommandAbility2Cost?: number | null, learnCommandAbility3Cost?: number | null, replaceCommandAbilityCost?: number | null } | null };

export type EstablishCommandMutationVariables = Exact<{
  input: CommandUpdateInput;
}>;


export type EstablishCommandMutation = { __typename?: 'Mutation', establishCommand?: { __typename?: 'MercenaryCommand', id: string, name?: string | null, commandingOfficer?: string | null, totalSupportPoints?: number | null, reputation?: number | null } | null };

export type UpdateCommandMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: CommandUpdateInput;
}>;


export type UpdateCommandMutation = { __typename?: 'Mutation', updateCommand?: { __typename?: 'MercenaryCommand', id: string, name?: string | null, commandingOfficer?: string | null, totalSupportPoints?: number | null, reputation?: number | null } | null };

export type DeleteCommandMutationVariables = Exact<{
  commandId: Scalars['ID']['input'];
  force?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type DeleteCommandMutation = { __typename?: 'Mutation', deleteCommand?: boolean | null };

export type AssignAssetMutationVariables = Exact<{
  assetType: Scalars['String']['input'];
  assetId: Scalars['ID']['input'];
  detachmentId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type AssignAssetMutation = { __typename?: 'Mutation', assignAsset?: boolean | null };

export type GetForceDataQueryVariables = Exact<{
  commandId: Scalars['ID']['input'];
}>;


export type GetForceDataQuery = { __typename?: 'Query', getCommand?: { __typename?: 'MercenaryCommand', id: string, name?: string | null, commandingOfficer?: string | null, totalSupportPoints?: number | null, reputation?: number | null, units?: Array<{ __typename?: 'CombatUnit', id: string, model?: string | null, tonnage?: number | null, status?: string | null, detachmentId?: string | null } | null> | null, pilots?: Array<{ __typename?: 'Pilot', id: string, name?: string | null, gunnery?: number | null, piloting?: number | null, asSkill?: number | null, edgeTokensSkill?: number | null, edgeAbilitySkill?: number | null, edgeAbilities?: string | null, unitType?: string | null, wounds?: number | null, handicap?: number | null, totalSpEarned?: number | null, gunnerySpEarned?: number | null, pilotingSpEarned?: number | null, edgeTokensSpEarned?: number | null, edgeAbilitySpEarned?: number | null, detachmentId?: string | null } | null> | null, detachments?: Array<{ __typename?: 'Detachment', id: string, name?: string | null, mercenaryCommandId?: string | null, mercenaryCommandName?: string | null, campaignId?: string | null, campaignName?: string | null, campaignRating?: number | null } | null> | null } | null, managedCampaigns?: Array<{ __typename?: 'Campaign', id: string, name?: string | null, systemName?: string | null, trackCount?: number | null, participatingDetachments?: Array<{ __typename?: 'Detachment', id: string, name?: string | null, mercenaryCommandId?: string | null, mercenaryCommandName?: string | null, campaignId?: string | null, campaignName?: string | null, campaignRating?: number | null } | null> | null } | null> | null, participatingCampaigns?: Array<{ __typename?: 'Campaign', id: string, name?: string | null, primaryEmployer?: string | null, participatingDetachments?: Array<{ __typename?: 'Detachment', id: string, name?: string | null, mercenaryCommandId?: string | null, mercenaryCommandName?: string | null, campaignId?: string | null, campaignName?: string | null, campaignRating?: number | null } | null> | null } | null> | null, publicCampaignMetadata?: { __typename?: 'CampaignMetadata', unitStatuses?: Array<string | null> | null, unitTypes?: Array<string | null> | null, techBases?: Array<string | null> | null, armorMultiplier?: number | null, internalMultiplier?: number | null, crippledMultiplier?: number | null, destroyedMultiplier?: number | null, nonMechModifier?: number | null, mixedTechModifier?: number | null, clanTechModifier?: number | null, omnimechReconfigureModifier?: number | null, pvPurchaseUnitMultiplier?: number | null, pvSellUnitMultiplier?: number | null, rearmCostPerTon?: number | null, rearmCostPerTonAlphaStrike?: number | null, hireMechWarriorCost?: number | null, hireNamedPilotCost?: number | null, hireBattleArmorCost?: number | null, healMechWarriorPerWoundBoxCost?: number | null, healMechWarriorPerMonthLimit?: number | null, healBattleArmorCost?: number | null, trainFormationCommanderCost?: number | null, changeFormationTrainingCost?: number | null, learnCommandAbility1Cost?: number | null, learnCommandAbility2Cost?: number | null, learnCommandAbility3Cost?: number | null, replaceCommandAbilityCost?: number | null } | null };

export type AddLedgerEntryMutationVariables = Exact<{
  commandId: Scalars['ID']['input'];
  detachmentId?: InputMaybe<Scalars['ID']['input']>;
  input: LedgerEntryInput;
}>;


export type AddLedgerEntryMutation = { __typename?: 'Mutation', addLedgerEntry?: { __typename?: 'LedgerEntry', id: string, timestamp?: string | null, detachmentId?: string | null, description?: string | null, amount?: number | null, reputationChange?: number | null, campaignId?: string | null, campaignName?: string | null, monthIndex?: number | null } | null };

export type GetLedgerDataQueryVariables = Exact<{
  commandId: Scalars['ID']['input'];
}>;


export type GetLedgerDataQuery = { __typename?: 'Query', getCommand?: { __typename?: 'MercenaryCommand', id: string, name?: string | null, totalSupportPoints?: number | null, detachments?: Array<{ __typename?: 'Detachment', id: string, name?: string | null, campaignId?: string | null, campaignName?: string | null } | null> | null } | null };

export type UpdateUnitMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: CombatUnitUpdateInput;
}>;


export type UpdateUnitMutation = { __typename?: 'Mutation', updateCombatUnit?: { __typename?: 'CombatUnit', id: string, type?: string | null, model?: string | null, variant?: string | null, techBase?: string | null, tonnage?: number | null, asSize?: number | null, bv?: number | null, pv?: number | null, status?: string | null, detachmentId?: string | null } | null };

export type UpdatePilotMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: PilotUpdateInput;
}>;


export type UpdatePilotMutation = { __typename?: 'Mutation', updatePilot?: { __typename?: 'Pilot', id: string, name?: string | null, gunnery?: number | null, piloting?: number | null, asSkill?: number | null, edgeTokensSkill?: number | null, edgeAbilitySkill?: number | null, edgeAbilities?: string | null, unitType?: string | null, wounds?: number | null, handicap?: number | null, totalSpEarned?: number | null, gunnerySpEarned?: number | null, pilotingSpEarned?: number | null, edgeTokensSpEarned?: number | null, edgeAbilitySpEarned?: number | null, detachmentId?: string | null } | null };

export type AddCombatUnitMutationVariables = Exact<{
  commandId: Scalars['ID']['input'];
  input: CombatUnitUpdateInput;
}>;


export type AddCombatUnitMutation = { __typename?: 'Mutation', addCombatUnit?: { __typename?: 'CombatUnit', id: string, type?: string | null, model?: string | null, variant?: string | null, techBase?: string | null, tonnage?: number | null, asSize?: number | null, bv?: number | null, pv?: number | null, status?: string | null, detachmentId?: string | null } | null };

export type HirePilotMutationVariables = Exact<{
  commandId: Scalars['ID']['input'];
  input: PilotUpdateInput;
}>;


export type HirePilotMutation = { __typename?: 'Mutation', hirePilot?: { __typename?: 'Pilot', id: string, name?: string | null, gunnery?: number | null, piloting?: number | null, asSkill?: number | null, edgeTokensSkill?: number | null, edgeAbilitySkill?: number | null, edgeAbilities?: string | null, unitType?: string | null, wounds?: number | null, handicap?: number | null, totalSpEarned?: number | null, gunnerySpEarned?: number | null, pilotingSpEarned?: number | null, edgeTokensSpEarned?: number | null, edgeAbilitySpEarned?: number | null, detachmentId?: string | null } | null };

export type ImportAssetsMutationVariables = Exact<{
  commandId: Scalars['ID']['input'];
  detachmentId?: InputMaybe<Scalars['ID']['input']>;
  link: Scalars['String']['input'];
}>;


export type ImportAssetsMutation = { __typename?: 'Mutation', importCombatUnitsFromLink?: Array<{ __typename?: 'CombatUnit', id: string, type?: string | null, model?: string | null, variant?: string | null, techBase?: string | null, tonnage?: number | null, asSize?: number | null, bv?: number | null, pv?: number | null, status?: string | null, detachmentId?: string | null } | null> | null };

export type DeleteUnitMutationVariables = Exact<{
  unitId: Scalars['ID']['input'];
}>;


export type DeleteUnitMutation = { __typename?: 'Mutation', deleteUnit?: boolean | null };

export type DeletePilotMutationVariables = Exact<{
  pilotId: Scalars['ID']['input'];
}>;


export type DeletePilotMutation = { __typename?: 'Mutation', deletePilot?: boolean | null };

export const CombatUnitFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CombatUnitFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CombatUnit"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"variant"}},{"kind":"Field","name":{"kind":"Name","value":"techBase"}},{"kind":"Field","name":{"kind":"Name","value":"tonnage"}},{"kind":"Field","name":{"kind":"Name","value":"asSize"}},{"kind":"Field","name":{"kind":"Name","value":"bv"}},{"kind":"Field","name":{"kind":"Name","value":"pv"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"detachmentId"}}]}}]} as unknown as DocumentNode<CombatUnitFieldsFragment, unknown>;
export const PilotFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PilotFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Pilot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"gunnery"}},{"kind":"Field","name":{"kind":"Name","value":"piloting"}},{"kind":"Field","name":{"kind":"Name","value":"asSkill"}},{"kind":"Field","name":{"kind":"Name","value":"edgeTokensSkill"}},{"kind":"Field","name":{"kind":"Name","value":"edgeAbilitySkill"}},{"kind":"Field","name":{"kind":"Name","value":"edgeAbilities"}},{"kind":"Field","name":{"kind":"Name","value":"unitType"}},{"kind":"Field","name":{"kind":"Name","value":"wounds"}},{"kind":"Field","name":{"kind":"Name","value":"handicap"}},{"kind":"Field","name":{"kind":"Name","value":"totalSpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"gunnerySpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"pilotingSpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"edgeTokensSpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"edgeAbilitySpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"detachmentId"}}]}}]} as unknown as DocumentNode<PilotFieldsFragment, unknown>;
export const ContractFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ContractFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Contract"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employerCategory"}},{"kind":"Field","name":{"kind":"Name","value":"missionType"}},{"kind":"Field","name":{"kind":"Name","value":"primaryContract"}},{"kind":"Field","name":{"kind":"Name","value":"payRate"}},{"kind":"Field","name":{"kind":"Name","value":"payStep"}},{"kind":"Field","name":{"kind":"Name","value":"salvageTerms"}},{"kind":"Field","name":{"kind":"Name","value":"salvageStep"}},{"kind":"Field","name":{"kind":"Name","value":"supportTerms"}},{"kind":"Field","name":{"kind":"Name","value":"supportStep"}},{"kind":"Field","name":{"kind":"Name","value":"transportTerms"}},{"kind":"Field","name":{"kind":"Name","value":"transportStep"}},{"kind":"Field","name":{"kind":"Name","value":"commandRights"}},{"kind":"Field","name":{"kind":"Name","value":"commandStep"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}}]}}]} as unknown as DocumentNode<ContractFieldsFragment, unknown>;
export const TrackFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TrackFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CampaignTrack"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"trackName"}},{"kind":"Field","name":{"kind":"Name","value":"sequenceOrder"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"nextSession"}},{"kind":"Field","name":{"kind":"Name","value":"attackerFactionId"}},{"kind":"Field","name":{"kind":"Name","value":"monthIndex"}},{"kind":"Field","name":{"kind":"Name","value":"complications"}},{"kind":"Field","name":{"kind":"Name","value":"afterActionNarrative"}},{"kind":"Field","name":{"kind":"Name","value":"oppositionComplications"}}]}}]} as unknown as DocumentNode<TrackFieldsFragment, unknown>;
export const CommandFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CommandFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MercenaryCommand"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"commandingOfficer"}},{"kind":"Field","name":{"kind":"Name","value":"totalSupportPoints"}},{"kind":"Field","name":{"kind":"Name","value":"reputation"}}]}}]} as unknown as DocumentNode<CommandFieldsFragment, unknown>;
export const DetachmentFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DetachmentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Detachment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"mercenaryCommandId"}},{"kind":"Field","name":{"kind":"Name","value":"mercenaryCommandName"}},{"kind":"Field","name":{"kind":"Name","value":"campaignId"}},{"kind":"Field","name":{"kind":"Name","value":"campaignName"}},{"kind":"Field","name":{"kind":"Name","value":"campaignRating"}}]}}]} as unknown as DocumentNode<DetachmentFieldsFragment, unknown>;
export const LedgerEntryFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LedgerEntryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LedgerEntry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"detachmentId"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reputationChange"}},{"kind":"Field","name":{"kind":"Name","value":"campaignId"}},{"kind":"Field","name":{"kind":"Name","value":"campaignName"}},{"kind":"Field","name":{"kind":"Name","value":"monthIndex"}}]}}]} as unknown as DocumentNode<LedgerEntryFieldsFragment, unknown>;
export const GetUserProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUserProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"userProfile"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<GetUserProfileQuery, GetUserProfileQueryVariables>;
export const LoginWithTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LoginWithToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"loginWithToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}}]}]}}]} as unknown as DocumentNode<LoginWithTokenMutation, LoginWithTokenMutationVariables>;
export const UpdateUserProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUserProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"displayName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUserProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"displayName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"displayName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>;
export const GetActiveCampaignsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetActiveCampaigns"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"size"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publicActiveCampaigns"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"size"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"systemName"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"primaryEmployer"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryEmployer"}},{"kind":"Field","name":{"kind":"Name","value":"participatingDetachments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DetachmentFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DetachmentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Detachment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"mercenaryCommandId"}},{"kind":"Field","name":{"kind":"Name","value":"mercenaryCommandName"}},{"kind":"Field","name":{"kind":"Name","value":"campaignId"}},{"kind":"Field","name":{"kind":"Name","value":"campaignName"}},{"kind":"Field","name":{"kind":"Name","value":"campaignRating"}}]}}]} as unknown as DocumentNode<GetActiveCampaignsQuery, GetActiveCampaignsQueryVariables>;
export const GetCampaignMetadataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCampaignMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publicCampaignMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"missions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"primary"}},{"kind":"Field","name":{"kind":"Name","value":"opponent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"trackTypes"}},{"kind":"Field","name":{"kind":"Name","value":"factions"}},{"kind":"Field","name":{"kind":"Name","value":"employerTypes"}},{"kind":"Field","name":{"kind":"Name","value":"unitStatuses"}},{"kind":"Field","name":{"kind":"Name","value":"unitTypes"}},{"kind":"Field","name":{"kind":"Name","value":"techBases"}},{"kind":"Field","name":{"kind":"Name","value":"resolvedSteps"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"step"}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payRate"}},{"kind":"Field","name":{"kind":"Name","value":"salvageRights"}},{"kind":"Field","name":{"kind":"Name","value":"supportRights"}},{"kind":"Field","name":{"kind":"Name","value":"transportation"}},{"kind":"Field","name":{"kind":"Name","value":"commandRights"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"armorMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"internalMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"crippledMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"destroyedMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"nonMechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"mixedTechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"clanTechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"omnimechReconfigureModifier"}},{"kind":"Field","name":{"kind":"Name","value":"pvPurchaseUnitMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"pvSellUnitMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"rearmCostPerTon"}},{"kind":"Field","name":{"kind":"Name","value":"rearmCostPerTonAlphaStrike"}},{"kind":"Field","name":{"kind":"Name","value":"hireMechWarriorCost"}},{"kind":"Field","name":{"kind":"Name","value":"hireNamedPilotCost"}},{"kind":"Field","name":{"kind":"Name","value":"hireBattleArmorCost"}},{"kind":"Field","name":{"kind":"Name","value":"healMechWarriorPerWoundBoxCost"}},{"kind":"Field","name":{"kind":"Name","value":"healMechWarriorPerMonthLimit"}},{"kind":"Field","name":{"kind":"Name","value":"healBattleArmorCost"}},{"kind":"Field","name":{"kind":"Name","value":"trainFormationCommanderCost"}},{"kind":"Field","name":{"kind":"Name","value":"changeFormationTrainingCost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility1Cost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility2Cost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility3Cost"}},{"kind":"Field","name":{"kind":"Name","value":"replaceCommandAbilityCost"}}]}}]}}]} as unknown as DocumentNode<GetCampaignMetadataQuery, GetCampaignMetadataQueryVariables>;
export const PreviewCampaignDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PreviewCampaign"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CampaignCreateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publicPreviewCampaign"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"campaign"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"systemName"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"lengthInMonths"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyPay"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyMaintenance"}},{"kind":"Field","name":{"kind":"Name","value":"transportationCost"}},{"kind":"Field","name":{"kind":"Name","value":"combatPay"}}]}},{"kind":"Field","name":{"kind":"Name","value":"armorMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"internalMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"crippledMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"destroyedMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"nonMechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"mixedTechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"clanTechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"omnimechReconfigureModifier"}},{"kind":"Field","name":{"kind":"Name","value":"pvPurchaseUnitMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"pvSellUnitMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"rearmCostPerTon"}},{"kind":"Field","name":{"kind":"Name","value":"rearmCostPerTonAlphaStrike"}},{"kind":"Field","name":{"kind":"Name","value":"hireMechWarriorCost"}},{"kind":"Field","name":{"kind":"Name","value":"hireNamedPilotCost"}},{"kind":"Field","name":{"kind":"Name","value":"hireBattleArmorCost"}},{"kind":"Field","name":{"kind":"Name","value":"healMechWarriorPerWoundBoxCost"}},{"kind":"Field","name":{"kind":"Name","value":"healMechWarriorPerMonthLimit"}},{"kind":"Field","name":{"kind":"Name","value":"healBattleArmorCost"}},{"kind":"Field","name":{"kind":"Name","value":"trainFormationCommanderCost"}},{"kind":"Field","name":{"kind":"Name","value":"changeFormationTrainingCost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility1Cost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility2Cost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility3Cost"}},{"kind":"Field","name":{"kind":"Name","value":"replaceCommandAbilityCost"}},{"kind":"Field","name":{"kind":"Name","value":"contracts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"employerCategory"}},{"kind":"Field","name":{"kind":"Name","value":"missionType"}},{"kind":"Field","name":{"kind":"Name","value":"primaryContract"}},{"kind":"Field","name":{"kind":"Name","value":"payRate"}},{"kind":"Field","name":{"kind":"Name","value":"payStep"}},{"kind":"Field","name":{"kind":"Name","value":"salvageTerms"}},{"kind":"Field","name":{"kind":"Name","value":"salvageStep"}},{"kind":"Field","name":{"kind":"Name","value":"supportTerms"}},{"kind":"Field","name":{"kind":"Name","value":"supportStep"}},{"kind":"Field","name":{"kind":"Name","value":"transportTerms"}},{"kind":"Field","name":{"kind":"Name","value":"transportStep"}},{"kind":"Field","name":{"kind":"Name","value":"commandRights"}},{"kind":"Field","name":{"kind":"Name","value":"commandStep"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tracks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"complication"}},{"kind":"Field","name":{"kind":"Name","value":"oppositionComplication"}}]}}]}}]}}]} as unknown as DocumentNode<PreviewCampaignQuery, PreviewCampaignQueryVariables>;
export const GenerateTracksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GenerateTracks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mission"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"commandRights"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"oppCommandRights"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"count"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"existing"}},"type":{"kind":"ListType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProposedTrackInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateTracks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"mission"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mission"}}},{"kind":"Argument","name":{"kind":"Name","value":"commandRights"},"value":{"kind":"Variable","name":{"kind":"Name","value":"commandRights"}}},{"kind":"Argument","name":{"kind":"Name","value":"oppCommandRights"},"value":{"kind":"Variable","name":{"kind":"Name","value":"oppCommandRights"}}},{"kind":"Argument","name":{"kind":"Name","value":"count"},"value":{"kind":"Variable","name":{"kind":"Name","value":"count"}}},{"kind":"Argument","name":{"kind":"Name","value":"existing"},"value":{"kind":"Variable","name":{"kind":"Name","value":"existing"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"complication"}},{"kind":"Field","name":{"kind":"Name","value":"oppositionComplication"}}]}}]}}]} as unknown as DocumentNode<GenerateTracksQuery, GenerateTracksQueryVariables>;
export const CreateCampaignDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCampaign"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CampaignCreateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCampaign"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"systemName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"lengthInMonths"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyPay"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyMaintenance"}},{"kind":"Field","name":{"kind":"Name","value":"transportationCost"}},{"kind":"Field","name":{"kind":"Name","value":"combatPay"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"payRate"}},{"kind":"Field","name":{"kind":"Name","value":"payStep"}},{"kind":"Field","name":{"kind":"Name","value":"salvageTerms"}},{"kind":"Field","name":{"kind":"Name","value":"salvageStep"}},{"kind":"Field","name":{"kind":"Name","value":"supportTerms"}},{"kind":"Field","name":{"kind":"Name","value":"supportStep"}},{"kind":"Field","name":{"kind":"Name","value":"transportTerms"}},{"kind":"Field","name":{"kind":"Name","value":"transportStep"}},{"kind":"Field","name":{"kind":"Name","value":"commandRights"}},{"kind":"Field","name":{"kind":"Name","value":"commandStep"}},{"kind":"Field","name":{"kind":"Name","value":"armorMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"internalMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"crippledMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"destroyedMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"nonMechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"mixedTechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"clanTechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"omnimechReconfigureModifier"}},{"kind":"Field","name":{"kind":"Name","value":"pvPurchaseUnitMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"pvSellUnitMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"rearmCostPerTon"}},{"kind":"Field","name":{"kind":"Name","value":"rearmCostPerTonAlphaStrike"}},{"kind":"Field","name":{"kind":"Name","value":"hireMechWarriorCost"}},{"kind":"Field","name":{"kind":"Name","value":"hireNamedPilotCost"}},{"kind":"Field","name":{"kind":"Name","value":"hireBattleArmorCost"}},{"kind":"Field","name":{"kind":"Name","value":"healMechWarriorPerWoundBoxCost"}},{"kind":"Field","name":{"kind":"Name","value":"healMechWarriorPerMonthLimit"}},{"kind":"Field","name":{"kind":"Name","value":"healBattleArmorCost"}},{"kind":"Field","name":{"kind":"Name","value":"trainFormationCommanderCost"}},{"kind":"Field","name":{"kind":"Name","value":"changeFormationTrainingCost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility1Cost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility2Cost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility3Cost"}},{"kind":"Field","name":{"kind":"Name","value":"replaceCommandAbilityCost"}}]}}]}}]} as unknown as DocumentNode<CreateCampaignMutation, CreateCampaignMutationVariables>;
export const UpdateCampaignDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCampaign"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CampaignUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCampaign"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"systemName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"lengthInMonths"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyPay"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyMaintenance"}},{"kind":"Field","name":{"kind":"Name","value":"transportationCost"}},{"kind":"Field","name":{"kind":"Name","value":"combatPay"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"payRate"}},{"kind":"Field","name":{"kind":"Name","value":"payStep"}},{"kind":"Field","name":{"kind":"Name","value":"salvageTerms"}},{"kind":"Field","name":{"kind":"Name","value":"salvageStep"}},{"kind":"Field","name":{"kind":"Name","value":"supportTerms"}},{"kind":"Field","name":{"kind":"Name","value":"supportStep"}},{"kind":"Field","name":{"kind":"Name","value":"transportTerms"}},{"kind":"Field","name":{"kind":"Name","value":"transportStep"}},{"kind":"Field","name":{"kind":"Name","value":"commandRights"}},{"kind":"Field","name":{"kind":"Name","value":"commandStep"}},{"kind":"Field","name":{"kind":"Name","value":"armorMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"internalMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"crippledMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"destroyedMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"nonMechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"mixedTechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"clanTechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"omnimechReconfigureModifier"}},{"kind":"Field","name":{"kind":"Name","value":"pvPurchaseUnitMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"pvSellUnitMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"rearmCostPerTon"}},{"kind":"Field","name":{"kind":"Name","value":"rearmCostPerTonAlphaStrike"}},{"kind":"Field","name":{"kind":"Name","value":"hireMechWarriorCost"}},{"kind":"Field","name":{"kind":"Name","value":"hireNamedPilotCost"}},{"kind":"Field","name":{"kind":"Name","value":"hireBattleArmorCost"}},{"kind":"Field","name":{"kind":"Name","value":"healMechWarriorPerWoundBoxCost"}},{"kind":"Field","name":{"kind":"Name","value":"healMechWarriorPerMonthLimit"}},{"kind":"Field","name":{"kind":"Name","value":"healBattleArmorCost"}},{"kind":"Field","name":{"kind":"Name","value":"trainFormationCommanderCost"}},{"kind":"Field","name":{"kind":"Name","value":"changeFormationTrainingCost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility1Cost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility2Cost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility3Cost"}},{"kind":"Field","name":{"kind":"Name","value":"replaceCommandAbilityCost"}}]}}]}}]} as unknown as DocumentNode<UpdateCampaignMutation, UpdateCampaignMutationVariables>;
export const GetManagedCampaignsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetManagedCampaigns"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"managedCampaigns"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"systemName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"primaryEmployer"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryEmployer"}},{"kind":"Field","name":{"kind":"Name","value":"payRate"}},{"kind":"Field","name":{"kind":"Name","value":"salvageTerms"}},{"kind":"Field","name":{"kind":"Name","value":"supportTerms"}},{"kind":"Field","name":{"kind":"Name","value":"transportTerms"}},{"kind":"Field","name":{"kind":"Name","value":"commandRights"}},{"kind":"Field","name":{"kind":"Name","value":"payStep"}},{"kind":"Field","name":{"kind":"Name","value":"salvageStep"}},{"kind":"Field","name":{"kind":"Name","value":"supportStep"}},{"kind":"Field","name":{"kind":"Name","value":"transportStep"}},{"kind":"Field","name":{"kind":"Name","value":"commandStep"}},{"kind":"Field","name":{"kind":"Name","value":"armorMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"internalMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"crippledMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"destroyedMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"nonMechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"mixedTechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"clanTechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"omnimechReconfigureModifier"}},{"kind":"Field","name":{"kind":"Name","value":"pvPurchaseUnitMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"pvSellUnitMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"rearmCostPerTon"}},{"kind":"Field","name":{"kind":"Name","value":"rearmCostPerTonAlphaStrike"}},{"kind":"Field","name":{"kind":"Name","value":"hireMechWarriorCost"}},{"kind":"Field","name":{"kind":"Name","value":"hireNamedPilotCost"}},{"kind":"Field","name":{"kind":"Name","value":"hireBattleArmorCost"}},{"kind":"Field","name":{"kind":"Name","value":"healMechWarriorPerWoundBoxCost"}},{"kind":"Field","name":{"kind":"Name","value":"healMechWarriorPerMonthLimit"}},{"kind":"Field","name":{"kind":"Name","value":"healBattleArmorCost"}},{"kind":"Field","name":{"kind":"Name","value":"trainFormationCommanderCost"}},{"kind":"Field","name":{"kind":"Name","value":"changeFormationTrainingCost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility1Cost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility2Cost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility3Cost"}},{"kind":"Field","name":{"kind":"Name","value":"replaceCommandAbilityCost"}},{"kind":"Field","name":{"kind":"Name","value":"contracts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ContractFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"factions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"factionName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tracks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TrackFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"participatingDetachments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DetachmentFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ContractFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Contract"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employerCategory"}},{"kind":"Field","name":{"kind":"Name","value":"missionType"}},{"kind":"Field","name":{"kind":"Name","value":"primaryContract"}},{"kind":"Field","name":{"kind":"Name","value":"payRate"}},{"kind":"Field","name":{"kind":"Name","value":"payStep"}},{"kind":"Field","name":{"kind":"Name","value":"salvageTerms"}},{"kind":"Field","name":{"kind":"Name","value":"salvageStep"}},{"kind":"Field","name":{"kind":"Name","value":"supportTerms"}},{"kind":"Field","name":{"kind":"Name","value":"supportStep"}},{"kind":"Field","name":{"kind":"Name","value":"transportTerms"}},{"kind":"Field","name":{"kind":"Name","value":"transportStep"}},{"kind":"Field","name":{"kind":"Name","value":"commandRights"}},{"kind":"Field","name":{"kind":"Name","value":"commandStep"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TrackFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CampaignTrack"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"trackName"}},{"kind":"Field","name":{"kind":"Name","value":"sequenceOrder"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"nextSession"}},{"kind":"Field","name":{"kind":"Name","value":"attackerFactionId"}},{"kind":"Field","name":{"kind":"Name","value":"monthIndex"}},{"kind":"Field","name":{"kind":"Name","value":"complications"}},{"kind":"Field","name":{"kind":"Name","value":"afterActionNarrative"}},{"kind":"Field","name":{"kind":"Name","value":"oppositionComplications"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DetachmentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Detachment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"mercenaryCommandId"}},{"kind":"Field","name":{"kind":"Name","value":"mercenaryCommandName"}},{"kind":"Field","name":{"kind":"Name","value":"campaignId"}},{"kind":"Field","name":{"kind":"Name","value":"campaignName"}},{"kind":"Field","name":{"kind":"Name","value":"campaignRating"}}]}}]} as unknown as DocumentNode<GetManagedCampaignsQuery, GetManagedCampaignsQueryVariables>;
export const CreateDetachmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateDetachment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"campaignId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"name"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDetachment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"commandId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}}},{"kind":"Argument","name":{"kind":"Name","value":"campaignId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"campaignId"}}},{"kind":"Argument","name":{"kind":"Name","value":"name"},"value":{"kind":"Variable","name":{"kind":"Name","value":"name"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DetachmentFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DetachmentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Detachment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"mercenaryCommandId"}},{"kind":"Field","name":{"kind":"Name","value":"mercenaryCommandName"}},{"kind":"Field","name":{"kind":"Name","value":"campaignId"}},{"kind":"Field","name":{"kind":"Name","value":"campaignName"}},{"kind":"Field","name":{"kind":"Name","value":"campaignRating"}}]}}]} as unknown as DocumentNode<CreateDetachmentMutation, CreateDetachmentMutationVariables>;
export const DeleteDetachmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteDetachment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"detachmentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteDetachment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"detachmentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"detachmentId"}}}]}]}}]} as unknown as DocumentNode<DeleteDetachmentMutation, DeleteDetachmentMutationVariables>;
export const AssignDetachmentToCampaignDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AssignDetachmentToCampaign"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"detachmentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"campaignId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignDetachmentToCampaign"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"detachmentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"detachmentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"campaignId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"campaignId"}}}]}]}}]} as unknown as DocumentNode<AssignDetachmentToCampaignMutation, AssignDetachmentToCampaignMutationVariables>;
export const GetPublicCampaignDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetPublicCampaignDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"campaignId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getCampaign"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"campaignId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"systemName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"lengthInMonths"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"primaryEmployer"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryEmployer"}},{"kind":"Field","name":{"kind":"Name","value":"tracks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TrackFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"participatingDetachments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DetachmentFields"}},{"kind":"Field","name":{"kind":"Name","value":"units"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CombatUnitFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pilots"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PilotFields"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TrackFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CampaignTrack"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"trackName"}},{"kind":"Field","name":{"kind":"Name","value":"sequenceOrder"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"nextSession"}},{"kind":"Field","name":{"kind":"Name","value":"attackerFactionId"}},{"kind":"Field","name":{"kind":"Name","value":"monthIndex"}},{"kind":"Field","name":{"kind":"Name","value":"complications"}},{"kind":"Field","name":{"kind":"Name","value":"afterActionNarrative"}},{"kind":"Field","name":{"kind":"Name","value":"oppositionComplications"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DetachmentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Detachment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"mercenaryCommandId"}},{"kind":"Field","name":{"kind":"Name","value":"mercenaryCommandName"}},{"kind":"Field","name":{"kind":"Name","value":"campaignId"}},{"kind":"Field","name":{"kind":"Name","value":"campaignName"}},{"kind":"Field","name":{"kind":"Name","value":"campaignRating"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CombatUnitFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CombatUnit"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"variant"}},{"kind":"Field","name":{"kind":"Name","value":"techBase"}},{"kind":"Field","name":{"kind":"Name","value":"tonnage"}},{"kind":"Field","name":{"kind":"Name","value":"asSize"}},{"kind":"Field","name":{"kind":"Name","value":"bv"}},{"kind":"Field","name":{"kind":"Name","value":"pv"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"detachmentId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PilotFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Pilot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"gunnery"}},{"kind":"Field","name":{"kind":"Name","value":"piloting"}},{"kind":"Field","name":{"kind":"Name","value":"asSkill"}},{"kind":"Field","name":{"kind":"Name","value":"edgeTokensSkill"}},{"kind":"Field","name":{"kind":"Name","value":"edgeAbilitySkill"}},{"kind":"Field","name":{"kind":"Name","value":"edgeAbilities"}},{"kind":"Field","name":{"kind":"Name","value":"unitType"}},{"kind":"Field","name":{"kind":"Name","value":"wounds"}},{"kind":"Field","name":{"kind":"Name","value":"handicap"}},{"kind":"Field","name":{"kind":"Name","value":"totalSpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"gunnerySpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"pilotingSpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"edgeTokensSpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"edgeAbilitySpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"detachmentId"}}]}}]} as unknown as DocumentNode<GetPublicCampaignDetailsQuery, GetPublicCampaignDetailsQueryVariables>;
export const JoinCampaignDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"JoinCampaign"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"detachmentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"joinCampaign"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}},{"kind":"Argument","name":{"kind":"Name","value":"detachmentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"detachmentId"}}}]}]}}]} as unknown as DocumentNode<JoinCampaignMutation, JoinCampaignMutationVariables>;
export const GetCampaignDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCampaignDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"campaignId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getCampaign"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"campaignId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"systemName"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"lengthInMonths"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"isManager"}},{"kind":"Field","name":{"kind":"Name","value":"isParticipant"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"primaryEmployer"}},{"kind":"Field","name":{"kind":"Name","value":"secondaryEmployer"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyPay"}},{"kind":"Field","name":{"kind":"Name","value":"monthlyMaintenance"}},{"kind":"Field","name":{"kind":"Name","value":"transportationCost"}},{"kind":"Field","name":{"kind":"Name","value":"combatPay"}},{"kind":"Field","name":{"kind":"Name","value":"payRate"}},{"kind":"Field","name":{"kind":"Name","value":"payStep"}},{"kind":"Field","name":{"kind":"Name","value":"salvageTerms"}},{"kind":"Field","name":{"kind":"Name","value":"salvageStep"}},{"kind":"Field","name":{"kind":"Name","value":"supportTerms"}},{"kind":"Field","name":{"kind":"Name","value":"supportStep"}},{"kind":"Field","name":{"kind":"Name","value":"transportTerms"}},{"kind":"Field","name":{"kind":"Name","value":"transportStep"}},{"kind":"Field","name":{"kind":"Name","value":"commandRights"}},{"kind":"Field","name":{"kind":"Name","value":"commandStep"}},{"kind":"Field","name":{"kind":"Name","value":"armorMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"internalMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"crippledMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"destroyedMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"nonMechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"mixedTechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"clanTechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"omnimechReconfigureModifier"}},{"kind":"Field","name":{"kind":"Name","value":"pvPurchaseUnitMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"pvSellUnitMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"rearmCostPerTon"}},{"kind":"Field","name":{"kind":"Name","value":"rearmCostPerTonAlphaStrike"}},{"kind":"Field","name":{"kind":"Name","value":"hireMechWarriorCost"}},{"kind":"Field","name":{"kind":"Name","value":"hireNamedPilotCost"}},{"kind":"Field","name":{"kind":"Name","value":"hireBattleArmorCost"}},{"kind":"Field","name":{"kind":"Name","value":"healMechWarriorPerWoundBoxCost"}},{"kind":"Field","name":{"kind":"Name","value":"healMechWarriorPerMonthLimit"}},{"kind":"Field","name":{"kind":"Name","value":"healBattleArmorCost"}},{"kind":"Field","name":{"kind":"Name","value":"trainFormationCommanderCost"}},{"kind":"Field","name":{"kind":"Name","value":"changeFormationTrainingCost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility1Cost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility2Cost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility3Cost"}},{"kind":"Field","name":{"kind":"Name","value":"replaceCommandAbilityCost"}},{"kind":"Field","name":{"kind":"Name","value":"contracts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ContractFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"factions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"factionName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tracks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"TrackFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"participatingDetachments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DetachmentFields"}},{"kind":"Field","name":{"kind":"Name","value":"units"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CombatUnitFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pilots"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PilotFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"campaignInvites"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"used"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ContractFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Contract"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"employerCategory"}},{"kind":"Field","name":{"kind":"Name","value":"missionType"}},{"kind":"Field","name":{"kind":"Name","value":"primaryContract"}},{"kind":"Field","name":{"kind":"Name","value":"payRate"}},{"kind":"Field","name":{"kind":"Name","value":"payStep"}},{"kind":"Field","name":{"kind":"Name","value":"salvageTerms"}},{"kind":"Field","name":{"kind":"Name","value":"salvageStep"}},{"kind":"Field","name":{"kind":"Name","value":"supportTerms"}},{"kind":"Field","name":{"kind":"Name","value":"supportStep"}},{"kind":"Field","name":{"kind":"Name","value":"transportTerms"}},{"kind":"Field","name":{"kind":"Name","value":"transportStep"}},{"kind":"Field","name":{"kind":"Name","value":"commandRights"}},{"kind":"Field","name":{"kind":"Name","value":"commandStep"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TrackFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CampaignTrack"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"trackName"}},{"kind":"Field","name":{"kind":"Name","value":"sequenceOrder"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"nextSession"}},{"kind":"Field","name":{"kind":"Name","value":"attackerFactionId"}},{"kind":"Field","name":{"kind":"Name","value":"monthIndex"}},{"kind":"Field","name":{"kind":"Name","value":"complications"}},{"kind":"Field","name":{"kind":"Name","value":"afterActionNarrative"}},{"kind":"Field","name":{"kind":"Name","value":"oppositionComplications"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DetachmentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Detachment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"mercenaryCommandId"}},{"kind":"Field","name":{"kind":"Name","value":"mercenaryCommandName"}},{"kind":"Field","name":{"kind":"Name","value":"campaignId"}},{"kind":"Field","name":{"kind":"Name","value":"campaignName"}},{"kind":"Field","name":{"kind":"Name","value":"campaignRating"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CombatUnitFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CombatUnit"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"variant"}},{"kind":"Field","name":{"kind":"Name","value":"techBase"}},{"kind":"Field","name":{"kind":"Name","value":"tonnage"}},{"kind":"Field","name":{"kind":"Name","value":"asSize"}},{"kind":"Field","name":{"kind":"Name","value":"bv"}},{"kind":"Field","name":{"kind":"Name","value":"pv"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"detachmentId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PilotFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Pilot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"gunnery"}},{"kind":"Field","name":{"kind":"Name","value":"piloting"}},{"kind":"Field","name":{"kind":"Name","value":"asSkill"}},{"kind":"Field","name":{"kind":"Name","value":"edgeTokensSkill"}},{"kind":"Field","name":{"kind":"Name","value":"edgeAbilitySkill"}},{"kind":"Field","name":{"kind":"Name","value":"edgeAbilities"}},{"kind":"Field","name":{"kind":"Name","value":"unitType"}},{"kind":"Field","name":{"kind":"Name","value":"wounds"}},{"kind":"Field","name":{"kind":"Name","value":"handicap"}},{"kind":"Field","name":{"kind":"Name","value":"totalSpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"gunnerySpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"pilotingSpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"edgeTokensSpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"edgeAbilitySpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"detachmentId"}}]}}]} as unknown as DocumentNode<GetCampaignDetailsQuery, GetCampaignDetailsQueryVariables>;
export const UpdateTrackDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTrack"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TrackUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTrack"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"trackName"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"nextSession"}},{"kind":"Field","name":{"kind":"Name","value":"attackerFactionId"}},{"kind":"Field","name":{"kind":"Name","value":"monthIndex"}},{"kind":"Field","name":{"kind":"Name","value":"complications"}},{"kind":"Field","name":{"kind":"Name","value":"afterActionNarrative"}},{"kind":"Field","name":{"kind":"Name","value":"oppositionComplications"}}]}}]}}]} as unknown as DocumentNode<UpdateTrackMutation, UpdateTrackMutationVariables>;
export const RerollTrackDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RerollTrack"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rerollTrack"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"trackName"}},{"kind":"Field","name":{"kind":"Name","value":"complications"}},{"kind":"Field","name":{"kind":"Name","value":"oppositionComplications"}}]}}]}}]} as unknown as DocumentNode<RerollTrackMutation, RerollTrackMutationVariables>;
export const ReorderTracksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ReorderTracks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"campaignId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"trackIds"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reorderTracks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"campaignId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"campaignId"}}},{"kind":"Argument","name":{"kind":"Name","value":"trackIds"},"value":{"kind":"Variable","name":{"kind":"Name","value":"trackIds"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sequenceOrder"}},{"kind":"Field","name":{"kind":"Name","value":"trackName"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"nextSession"}},{"kind":"Field","name":{"kind":"Name","value":"attackerFactionId"}},{"kind":"Field","name":{"kind":"Name","value":"monthIndex"}},{"kind":"Field","name":{"kind":"Name","value":"complications"}},{"kind":"Field","name":{"kind":"Name","value":"afterActionNarrative"}},{"kind":"Field","name":{"kind":"Name","value":"oppositionComplications"}}]}}]}}]} as unknown as DocumentNode<ReorderTracksMutation, ReorderTracksMutationVariables>;
export const CreateInviteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateInvite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"campaignId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"recipientName"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createInvite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"campaignId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"campaignId"}}},{"kind":"Argument","name":{"kind":"Name","value":"recipientName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"recipientName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"}},{"kind":"Field","name":{"kind":"Name","value":"recipientName"}}]}}]}}]} as unknown as DocumentNode<CreateInviteMutation, CreateInviteMutationVariables>;
export const DeleteInviteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteInvite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteInvite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteInviteMutation, DeleteInviteMutationVariables>;
export const GetMyCommandsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMyCommands"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myCommands"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CommandFields"}},{"kind":"Field","name":{"kind":"Name","value":"detachments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DetachmentFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CommandFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MercenaryCommand"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"commandingOfficer"}},{"kind":"Field","name":{"kind":"Name","value":"totalSupportPoints"}},{"kind":"Field","name":{"kind":"Name","value":"reputation"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DetachmentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Detachment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"mercenaryCommandId"}},{"kind":"Field","name":{"kind":"Name","value":"mercenaryCommandName"}},{"kind":"Field","name":{"kind":"Name","value":"campaignId"}},{"kind":"Field","name":{"kind":"Name","value":"campaignName"}},{"kind":"Field","name":{"kind":"Name","value":"campaignRating"}}]}}]} as unknown as DocumentNode<GetMyCommandsQuery, GetMyCommandsQueryVariables>;
export const GetUnitDossierDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUnitDossier"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getCommand"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CommandFields"}},{"kind":"Field","name":{"kind":"Name","value":"units"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CombatUnitFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pilots"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PilotFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"detachments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DetachmentFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"allLedgerEntries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LedgerEntryFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"managedCampaigns"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"StringValue","value":"ACTIVE","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"publicCampaignMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitStatuses"}},{"kind":"Field","name":{"kind":"Name","value":"unitTypes"}},{"kind":"Field","name":{"kind":"Name","value":"techBases"}},{"kind":"Field","name":{"kind":"Name","value":"armorMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"internalMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"crippledMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"destroyedMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"nonMechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"mixedTechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"clanTechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"omnimechReconfigureModifier"}},{"kind":"Field","name":{"kind":"Name","value":"pvPurchaseUnitMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"pvSellUnitMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"rearmCostPerTon"}},{"kind":"Field","name":{"kind":"Name","value":"rearmCostPerTonAlphaStrike"}},{"kind":"Field","name":{"kind":"Name","value":"hireMechWarriorCost"}},{"kind":"Field","name":{"kind":"Name","value":"hireNamedPilotCost"}},{"kind":"Field","name":{"kind":"Name","value":"hireBattleArmorCost"}},{"kind":"Field","name":{"kind":"Name","value":"healMechWarriorPerWoundBoxCost"}},{"kind":"Field","name":{"kind":"Name","value":"healMechWarriorPerMonthLimit"}},{"kind":"Field","name":{"kind":"Name","value":"healBattleArmorCost"}},{"kind":"Field","name":{"kind":"Name","value":"trainFormationCommanderCost"}},{"kind":"Field","name":{"kind":"Name","value":"changeFormationTrainingCost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility1Cost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility2Cost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility3Cost"}},{"kind":"Field","name":{"kind":"Name","value":"replaceCommandAbilityCost"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CommandFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MercenaryCommand"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"commandingOfficer"}},{"kind":"Field","name":{"kind":"Name","value":"totalSupportPoints"}},{"kind":"Field","name":{"kind":"Name","value":"reputation"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CombatUnitFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CombatUnit"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"variant"}},{"kind":"Field","name":{"kind":"Name","value":"techBase"}},{"kind":"Field","name":{"kind":"Name","value":"tonnage"}},{"kind":"Field","name":{"kind":"Name","value":"asSize"}},{"kind":"Field","name":{"kind":"Name","value":"bv"}},{"kind":"Field","name":{"kind":"Name","value":"pv"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"detachmentId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PilotFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Pilot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"gunnery"}},{"kind":"Field","name":{"kind":"Name","value":"piloting"}},{"kind":"Field","name":{"kind":"Name","value":"asSkill"}},{"kind":"Field","name":{"kind":"Name","value":"edgeTokensSkill"}},{"kind":"Field","name":{"kind":"Name","value":"edgeAbilitySkill"}},{"kind":"Field","name":{"kind":"Name","value":"edgeAbilities"}},{"kind":"Field","name":{"kind":"Name","value":"unitType"}},{"kind":"Field","name":{"kind":"Name","value":"wounds"}},{"kind":"Field","name":{"kind":"Name","value":"handicap"}},{"kind":"Field","name":{"kind":"Name","value":"totalSpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"gunnerySpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"pilotingSpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"edgeTokensSpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"edgeAbilitySpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"detachmentId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DetachmentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Detachment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"mercenaryCommandId"}},{"kind":"Field","name":{"kind":"Name","value":"mercenaryCommandName"}},{"kind":"Field","name":{"kind":"Name","value":"campaignId"}},{"kind":"Field","name":{"kind":"Name","value":"campaignName"}},{"kind":"Field","name":{"kind":"Name","value":"campaignRating"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LedgerEntryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LedgerEntry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"detachmentId"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reputationChange"}},{"kind":"Field","name":{"kind":"Name","value":"campaignId"}},{"kind":"Field","name":{"kind":"Name","value":"campaignName"}},{"kind":"Field","name":{"kind":"Name","value":"monthIndex"}}]}}]} as unknown as DocumentNode<GetUnitDossierQuery, GetUnitDossierQueryVariables>;
export const EstablishCommandDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EstablishCommand"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CommandUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"establishCommand"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CommandFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CommandFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MercenaryCommand"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"commandingOfficer"}},{"kind":"Field","name":{"kind":"Name","value":"totalSupportPoints"}},{"kind":"Field","name":{"kind":"Name","value":"reputation"}}]}}]} as unknown as DocumentNode<EstablishCommandMutation, EstablishCommandMutationVariables>;
export const UpdateCommandDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCommand"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CommandUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCommand"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CommandFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CommandFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MercenaryCommand"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"commandingOfficer"}},{"kind":"Field","name":{"kind":"Name","value":"totalSupportPoints"}},{"kind":"Field","name":{"kind":"Name","value":"reputation"}}]}}]} as unknown as DocumentNode<UpdateCommandMutation, UpdateCommandMutationVariables>;
export const DeleteCommandDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCommand"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"force"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteCommand"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"commandId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}}},{"kind":"Argument","name":{"kind":"Name","value":"force"},"value":{"kind":"Variable","name":{"kind":"Name","value":"force"}}}]}]}}]} as unknown as DocumentNode<DeleteCommandMutation, DeleteCommandMutationVariables>;
export const AssignAssetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AssignAsset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assetType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"assetId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"detachmentId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"assignAsset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"assetType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assetType"}}},{"kind":"Argument","name":{"kind":"Name","value":"assetId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"assetId"}}},{"kind":"Argument","name":{"kind":"Name","value":"detachmentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"detachmentId"}}}]}]}}]} as unknown as DocumentNode<AssignAssetMutation, AssignAssetMutationVariables>;
export const GetForceDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetForceData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getCommand"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CommandFields"}},{"kind":"Field","name":{"kind":"Name","value":"units"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"tonnage"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"detachmentId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pilots"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PilotFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"detachments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DetachmentFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"managedCampaigns"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"StringValue","value":"ACTIVE","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"systemName"}},{"kind":"Field","name":{"kind":"Name","value":"trackCount"}},{"kind":"Field","name":{"kind":"Name","value":"participatingDetachments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DetachmentFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"participatingCampaigns"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"commandId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"primaryEmployer"}},{"kind":"Field","name":{"kind":"Name","value":"participatingDetachments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"DetachmentFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"publicCampaignMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitStatuses"}},{"kind":"Field","name":{"kind":"Name","value":"unitTypes"}},{"kind":"Field","name":{"kind":"Name","value":"techBases"}},{"kind":"Field","name":{"kind":"Name","value":"armorMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"internalMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"crippledMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"destroyedMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"nonMechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"mixedTechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"clanTechModifier"}},{"kind":"Field","name":{"kind":"Name","value":"omnimechReconfigureModifier"}},{"kind":"Field","name":{"kind":"Name","value":"pvPurchaseUnitMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"pvSellUnitMultiplier"}},{"kind":"Field","name":{"kind":"Name","value":"rearmCostPerTon"}},{"kind":"Field","name":{"kind":"Name","value":"rearmCostPerTonAlphaStrike"}},{"kind":"Field","name":{"kind":"Name","value":"hireMechWarriorCost"}},{"kind":"Field","name":{"kind":"Name","value":"hireNamedPilotCost"}},{"kind":"Field","name":{"kind":"Name","value":"hireBattleArmorCost"}},{"kind":"Field","name":{"kind":"Name","value":"healMechWarriorPerWoundBoxCost"}},{"kind":"Field","name":{"kind":"Name","value":"healMechWarriorPerMonthLimit"}},{"kind":"Field","name":{"kind":"Name","value":"healBattleArmorCost"}},{"kind":"Field","name":{"kind":"Name","value":"trainFormationCommanderCost"}},{"kind":"Field","name":{"kind":"Name","value":"changeFormationTrainingCost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility1Cost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility2Cost"}},{"kind":"Field","name":{"kind":"Name","value":"learnCommandAbility3Cost"}},{"kind":"Field","name":{"kind":"Name","value":"replaceCommandAbilityCost"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CommandFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MercenaryCommand"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"commandingOfficer"}},{"kind":"Field","name":{"kind":"Name","value":"totalSupportPoints"}},{"kind":"Field","name":{"kind":"Name","value":"reputation"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PilotFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Pilot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"gunnery"}},{"kind":"Field","name":{"kind":"Name","value":"piloting"}},{"kind":"Field","name":{"kind":"Name","value":"asSkill"}},{"kind":"Field","name":{"kind":"Name","value":"edgeTokensSkill"}},{"kind":"Field","name":{"kind":"Name","value":"edgeAbilitySkill"}},{"kind":"Field","name":{"kind":"Name","value":"edgeAbilities"}},{"kind":"Field","name":{"kind":"Name","value":"unitType"}},{"kind":"Field","name":{"kind":"Name","value":"wounds"}},{"kind":"Field","name":{"kind":"Name","value":"handicap"}},{"kind":"Field","name":{"kind":"Name","value":"totalSpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"gunnerySpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"pilotingSpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"edgeTokensSpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"edgeAbilitySpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"detachmentId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"DetachmentFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Detachment"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"mercenaryCommandId"}},{"kind":"Field","name":{"kind":"Name","value":"mercenaryCommandName"}},{"kind":"Field","name":{"kind":"Name","value":"campaignId"}},{"kind":"Field","name":{"kind":"Name","value":"campaignName"}},{"kind":"Field","name":{"kind":"Name","value":"campaignRating"}}]}}]} as unknown as DocumentNode<GetForceDataQuery, GetForceDataQueryVariables>;
export const AddLedgerEntryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddLedgerEntry"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"detachmentId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LedgerEntryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addLedgerEntry"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"commandId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}}},{"kind":"Argument","name":{"kind":"Name","value":"detachmentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"detachmentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LedgerEntryFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LedgerEntryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LedgerEntry"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"detachmentId"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reputationChange"}},{"kind":"Field","name":{"kind":"Name","value":"campaignId"}},{"kind":"Field","name":{"kind":"Name","value":"campaignName"}},{"kind":"Field","name":{"kind":"Name","value":"monthIndex"}}]}}]} as unknown as DocumentNode<AddLedgerEntryMutation, AddLedgerEntryMutationVariables>;
export const GetLedgerDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLedgerData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getCommand"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"totalSupportPoints"}},{"kind":"Field","name":{"kind":"Name","value":"detachments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"campaignId"}},{"kind":"Field","name":{"kind":"Name","value":"campaignName"}}]}}]}}]}}]} as unknown as DocumentNode<GetLedgerDataQuery, GetLedgerDataQueryVariables>;
export const UpdateUnitDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUnit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CombatUnitUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCombatUnit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CombatUnitFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CombatUnitFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CombatUnit"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"variant"}},{"kind":"Field","name":{"kind":"Name","value":"techBase"}},{"kind":"Field","name":{"kind":"Name","value":"tonnage"}},{"kind":"Field","name":{"kind":"Name","value":"asSize"}},{"kind":"Field","name":{"kind":"Name","value":"bv"}},{"kind":"Field","name":{"kind":"Name","value":"pv"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"detachmentId"}}]}}]} as unknown as DocumentNode<UpdateUnitMutation, UpdateUnitMutationVariables>;
export const UpdatePilotDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePilot"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PilotUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePilot"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PilotFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PilotFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Pilot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"gunnery"}},{"kind":"Field","name":{"kind":"Name","value":"piloting"}},{"kind":"Field","name":{"kind":"Name","value":"asSkill"}},{"kind":"Field","name":{"kind":"Name","value":"edgeTokensSkill"}},{"kind":"Field","name":{"kind":"Name","value":"edgeAbilitySkill"}},{"kind":"Field","name":{"kind":"Name","value":"edgeAbilities"}},{"kind":"Field","name":{"kind":"Name","value":"unitType"}},{"kind":"Field","name":{"kind":"Name","value":"wounds"}},{"kind":"Field","name":{"kind":"Name","value":"handicap"}},{"kind":"Field","name":{"kind":"Name","value":"totalSpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"gunnerySpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"pilotingSpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"edgeTokensSpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"edgeAbilitySpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"detachmentId"}}]}}]} as unknown as DocumentNode<UpdatePilotMutation, UpdatePilotMutationVariables>;
export const AddCombatUnitDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddCombatUnit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CombatUnitUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addCombatUnit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"commandId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CombatUnitFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CombatUnitFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CombatUnit"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"variant"}},{"kind":"Field","name":{"kind":"Name","value":"techBase"}},{"kind":"Field","name":{"kind":"Name","value":"tonnage"}},{"kind":"Field","name":{"kind":"Name","value":"asSize"}},{"kind":"Field","name":{"kind":"Name","value":"bv"}},{"kind":"Field","name":{"kind":"Name","value":"pv"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"detachmentId"}}]}}]} as unknown as DocumentNode<AddCombatUnitMutation, AddCombatUnitMutationVariables>;
export const HirePilotDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"HirePilot"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PilotUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hirePilot"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"commandId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"PilotFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PilotFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Pilot"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"gunnery"}},{"kind":"Field","name":{"kind":"Name","value":"piloting"}},{"kind":"Field","name":{"kind":"Name","value":"asSkill"}},{"kind":"Field","name":{"kind":"Name","value":"edgeTokensSkill"}},{"kind":"Field","name":{"kind":"Name","value":"edgeAbilitySkill"}},{"kind":"Field","name":{"kind":"Name","value":"edgeAbilities"}},{"kind":"Field","name":{"kind":"Name","value":"unitType"}},{"kind":"Field","name":{"kind":"Name","value":"wounds"}},{"kind":"Field","name":{"kind":"Name","value":"handicap"}},{"kind":"Field","name":{"kind":"Name","value":"totalSpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"gunnerySpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"pilotingSpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"edgeTokensSpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"edgeAbilitySpEarned"}},{"kind":"Field","name":{"kind":"Name","value":"detachmentId"}}]}}]} as unknown as DocumentNode<HirePilotMutation, HirePilotMutationVariables>;
export const ImportAssetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ImportAssets"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"detachmentId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"link"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"importCombatUnitsFromLink"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"commandId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"commandId"}}},{"kind":"Argument","name":{"kind":"Name","value":"detachmentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"detachmentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"link"},"value":{"kind":"Variable","name":{"kind":"Name","value":"link"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CombatUnitFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CombatUnitFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CombatUnit"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"model"}},{"kind":"Field","name":{"kind":"Name","value":"variant"}},{"kind":"Field","name":{"kind":"Name","value":"techBase"}},{"kind":"Field","name":{"kind":"Name","value":"tonnage"}},{"kind":"Field","name":{"kind":"Name","value":"asSize"}},{"kind":"Field","name":{"kind":"Name","value":"bv"}},{"kind":"Field","name":{"kind":"Name","value":"pv"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"detachmentId"}}]}}]} as unknown as DocumentNode<ImportAssetsMutation, ImportAssetsMutationVariables>;
export const DeleteUnitDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteUnit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"unitId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteUnit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"unitId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"unitId"}}}]}]}}]} as unknown as DocumentNode<DeleteUnitMutation, DeleteUnitMutationVariables>;
export const DeletePilotDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeletePilot"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pilotId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletePilot"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pilotId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pilotId"}}}]}]}}]} as unknown as DocumentNode<DeletePilotMutation, DeletePilotMutationVariables>;