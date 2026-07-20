export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
}

export type Campaign = {
  __typename?: 'Campaign'
  armorMultiplier: Maybe<Scalars['Float']['output']>
  campaignInvites: Maybe<Array<Maybe<CampaignInvite>>>
  changeFormationTrainingCost: Maybe<Scalars['Int']['output']>
  clanTechModifier: Maybe<Scalars['Float']['output']>
  combatPay: Maybe<Scalars['Int']['output']>
  commandRights: Maybe<Scalars['String']['output']>
  commandStep: Maybe<Scalars['Int']['output']>
  contracts: Maybe<Array<Maybe<Contract>>>
  crippledMultiplier: Maybe<Scalars['Float']['output']>
  description: Maybe<Scalars['String']['output']>
  destroyedMultiplier: Maybe<Scalars['Float']['output']>
  factions: Maybe<Array<Maybe<CampaignFaction>>>
  healBattleArmorCost: Maybe<Scalars['Int']['output']>
  healMechWarriorPerMonthLimit: Maybe<Scalars['Int']['output']>
  healMechWarriorPerWoundBoxCost: Maybe<Scalars['Int']['output']>
  hireBattleArmorCost: Maybe<Scalars['Int']['output']>
  hireMechWarriorCost: Maybe<Scalars['Int']['output']>
  hireNamedPilotCost: Maybe<Scalars['Int']['output']>
  id: Scalars['ID']['output']
  internalMultiplier: Maybe<Scalars['Float']['output']>
  isManager: Maybe<Scalars['Boolean']['output']>
  isParticipant: Maybe<Scalars['Boolean']['output']>
  learnCommandAbility1Cost: Maybe<Scalars['Int']['output']>
  learnCommandAbility2Cost: Maybe<Scalars['Int']['output']>
  learnCommandAbility3Cost: Maybe<Scalars['Int']['output']>
  lengthInMonths: Maybe<Scalars['Int']['output']>
  managerId: Maybe<Scalars['String']['output']>
  mixedTechModifier: Maybe<Scalars['Float']['output']>
  monthlyMaintenance: Maybe<Scalars['Int']['output']>
  monthlyPay: Maybe<Scalars['Int']['output']>
  name: Maybe<Scalars['String']['output']>
  nonMechModifier: Maybe<Scalars['Float']['output']>
  omnimechReconfigureModifier: Maybe<Scalars['Float']['output']>
  participatingDetachments: Maybe<Array<Maybe<Detachment>>>
  payRate: Maybe<Scalars['Float']['output']>
  payStep: Maybe<Scalars['Int']['output']>
  primaryEmployer: Maybe<Scalars['String']['output']>
  pvPurchaseUnitMultiplier: Maybe<Scalars['Int']['output']>
  pvSellUnitMultiplier: Maybe<Scalars['Int']['output']>
  rearmCostPerTon: Maybe<Scalars['Int']['output']>
  rearmCostPerTonAlphaStrike: Maybe<Scalars['Int']['output']>
  replaceCommandAbilityCost: Maybe<Scalars['Int']['output']>
  salvageStep: Maybe<Scalars['Int']['output']>
  salvageTerms: Maybe<Scalars['String']['output']>
  secondaryEmployer: Maybe<Scalars['String']['output']>
  status: Maybe<Scalars['String']['output']>
  supportStep: Maybe<Scalars['Int']['output']>
  supportTerms: Maybe<Scalars['String']['output']>
  systemName: Maybe<Scalars['String']['output']>
  trackCount: Maybe<Scalars['Int']['output']>
  tracks: Maybe<Array<Maybe<CampaignTrack>>>
  trainFormationCommanderCost: Maybe<Scalars['Int']['output']>
  transportStep: Maybe<Scalars['Int']['output']>
  transportTerms: Maybe<Scalars['String']['output']>
  transportationCost: Maybe<Scalars['Int']['output']>
}

export type CampaignCreateInput = {
  armorMultiplier: InputMaybe<Scalars['Float']['input']>
  changeFormationTrainingCost: InputMaybe<Scalars['Int']['input']>
  clanTechModifier: InputMaybe<Scalars['Float']['input']>
  combatPay: InputMaybe<Scalars['Int']['input']>
  commandRights: InputMaybe<Scalars['String']['input']>
  commandStep: InputMaybe<Scalars['Int']['input']>
  crippledMultiplier: InputMaybe<Scalars['Float']['input']>
  description: InputMaybe<Scalars['String']['input']>
  destroyedMultiplier: InputMaybe<Scalars['Float']['input']>
  employer: InputMaybe<Scalars['String']['input']>
  employerCategory: InputMaybe<Scalars['String']['input']>
  healBattleArmorCost: InputMaybe<Scalars['Int']['input']>
  healMechWarriorPerMonthLimit: InputMaybe<Scalars['Int']['input']>
  healMechWarriorPerWoundBoxCost: InputMaybe<Scalars['Int']['input']>
  hireBattleArmorCost: InputMaybe<Scalars['Int']['input']>
  hireMechWarriorCost: InputMaybe<Scalars['Int']['input']>
  hireNamedPilotCost: InputMaybe<Scalars['Int']['input']>
  internalMultiplier: InputMaybe<Scalars['Float']['input']>
  learnCommandAbility1Cost: InputMaybe<Scalars['Int']['input']>
  learnCommandAbility2Cost: InputMaybe<Scalars['Int']['input']>
  learnCommandAbility3Cost: InputMaybe<Scalars['Int']['input']>
  lengthInMonths: InputMaybe<Scalars['Int']['input']>
  mission: InputMaybe<Scalars['String']['input']>
  mixedTechModifier: InputMaybe<Scalars['Float']['input']>
  monthlyMaintenance: InputMaybe<Scalars['Int']['input']>
  monthlyPay: InputMaybe<Scalars['Int']['input']>
  name: InputMaybe<Scalars['String']['input']>
  nonMechModifier: InputMaybe<Scalars['Float']['input']>
  omnimechReconfigureModifier: InputMaybe<Scalars['Float']['input']>
  oppCommandRights: InputMaybe<Scalars['String']['input']>
  oppCommandStep: InputMaybe<Scalars['Int']['input']>
  oppMission: InputMaybe<Scalars['String']['input']>
  oppPayRate: InputMaybe<Scalars['Float']['input']>
  oppPayStep: InputMaybe<Scalars['Int']['input']>
  oppSalvageStep: InputMaybe<Scalars['Int']['input']>
  oppSalvageTerms: InputMaybe<Scalars['String']['input']>
  oppSupportStep: InputMaybe<Scalars['Int']['input']>
  oppSupportTerms: InputMaybe<Scalars['String']['input']>
  oppTransportStep: InputMaybe<Scalars['Int']['input']>
  oppTransportTerms: InputMaybe<Scalars['String']['input']>
  opponent: InputMaybe<Scalars['String']['input']>
  opponentCategory: InputMaybe<Scalars['String']['input']>
  payRate: InputMaybe<Scalars['Float']['input']>
  payStep: InputMaybe<Scalars['Int']['input']>
  pvPurchaseUnitMultiplier: InputMaybe<Scalars['Int']['input']>
  pvSellUnitMultiplier: InputMaybe<Scalars['Int']['input']>
  rearmCostPerTon: InputMaybe<Scalars['Int']['input']>
  rearmCostPerTonAlphaStrike: InputMaybe<Scalars['Int']['input']>
  replaceCommandAbilityCost: InputMaybe<Scalars['Int']['input']>
  salvageStep: InputMaybe<Scalars['Int']['input']>
  salvageTerms: InputMaybe<Scalars['String']['input']>
  status: InputMaybe<Scalars['String']['input']>
  supportStep: InputMaybe<Scalars['Int']['input']>
  supportTerms: InputMaybe<Scalars['String']['input']>
  systemName: InputMaybe<Scalars['String']['input']>
  trackCount: InputMaybe<Scalars['Int']['input']>
  tracks: InputMaybe<Array<InputMaybe<ProposedTrackInput>>>
  trainFormationCommanderCost: InputMaybe<Scalars['Int']['input']>
  transportStep: InputMaybe<Scalars['Int']['input']>
  transportTerms: InputMaybe<Scalars['String']['input']>
  transportationCost: InputMaybe<Scalars['Int']['input']>
}

export type CampaignFaction = {
  __typename?: 'CampaignFaction'
  campaignId: Scalars['ID']['output']
  factionName: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  offersContracts: Maybe<Scalars['Boolean']['output']>
  shortDescription: Maybe<Scalars['String']['output']>
}

export type CampaignInvite = {
  __typename?: 'CampaignInvite'
  campaignId: Scalars['ID']['output']
  expiresAt: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  recipientName: Maybe<Scalars['String']['output']>
  token: Maybe<Scalars['String']['output']>
  used: Maybe<Scalars['Boolean']['output']>
}

export type CampaignMarket = {
  __typename?: 'CampaignMarket'
  campaignId: Scalars['ID']['output']
  employerMarkets: Array<EmployerMarket>
  freeMarketMarkdown: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  scrapperFee: Scalars['Int']['output']
  scrapperMarketMarkdown: Maybe<Scalars['String']['output']>
}

export type CampaignMetadata = {
  __typename?: 'CampaignMetadata'
  armorMultiplier: Maybe<Scalars['Float']['output']>
  changeFormationTrainingCost: Maybe<Scalars['Int']['output']>
  clanTechModifier: Maybe<Scalars['Float']['output']>
  crippledMultiplier: Maybe<Scalars['Float']['output']>
  destroyedMultiplier: Maybe<Scalars['Float']['output']>
  employerTypes: Maybe<Array<Maybe<Scalars['String']['output']>>>
  factions: Maybe<Array<Maybe<Scalars['String']['output']>>>
  healBattleArmorCost: Maybe<Scalars['Int']['output']>
  healMechWarriorPerMonthLimit: Maybe<Scalars['Int']['output']>
  healMechWarriorPerWoundBoxCost: Maybe<Scalars['Int']['output']>
  hireBattleArmorCost: Maybe<Scalars['Int']['output']>
  hireMechWarriorCost: Maybe<Scalars['Int']['output']>
  hireNamedPilotCost: Maybe<Scalars['Int']['output']>
  internalMultiplier: Maybe<Scalars['Float']['output']>
  learnCommandAbility1Cost: Maybe<Scalars['Int']['output']>
  learnCommandAbility2Cost: Maybe<Scalars['Int']['output']>
  learnCommandAbility3Cost: Maybe<Scalars['Int']['output']>
  missions: Maybe<MissionMetadata>
  mixedTechModifier: Maybe<Scalars['Float']['output']>
  nonMechModifier: Maybe<Scalars['Float']['output']>
  omnimechReconfigureModifier: Maybe<Scalars['Float']['output']>
  pvPurchaseUnitMultiplier: Maybe<Scalars['Int']['output']>
  pvSellUnitMultiplier: Maybe<Scalars['Int']['output']>
  rearmCostPerTon: Maybe<Scalars['Int']['output']>
  rearmCostPerTonAlphaStrike: Maybe<Scalars['Int']['output']>
  replaceCommandAbilityCost: Maybe<Scalars['Int']['output']>
  resolvedSteps: Maybe<Array<Maybe<ResolvedStepEntry>>>
  techBases: Maybe<Array<Maybe<Scalars['String']['output']>>>
  trackTypes: Maybe<Array<Maybe<Scalars['String']['output']>>>
  trainFormationCommanderCost: Maybe<Scalars['Int']['output']>
  unitStatuses: Maybe<Array<Maybe<Scalars['String']['output']>>>
  unitTypes: Maybe<Array<Maybe<Scalars['String']['output']>>>
}

export type CampaignProposal = {
  __typename?: 'CampaignProposal'
  armorMultiplier: Maybe<Scalars['Float']['output']>
  campaign: Maybe<Campaign>
  changeFormationTrainingCost: Maybe<Scalars['Int']['output']>
  clanTechModifier: Maybe<Scalars['Float']['output']>
  contracts: Maybe<Array<Maybe<Contract>>>
  crippledMultiplier: Maybe<Scalars['Float']['output']>
  destroyedMultiplier: Maybe<Scalars['Float']['output']>
  healBattleArmorCost: Maybe<Scalars['Int']['output']>
  healMechWarriorPerMonthLimit: Maybe<Scalars['Int']['output']>
  healMechWarriorPerWoundBoxCost: Maybe<Scalars['Int']['output']>
  hireBattleArmorCost: Maybe<Scalars['Int']['output']>
  hireMechWarriorCost: Maybe<Scalars['Int']['output']>
  hireNamedPilotCost: Maybe<Scalars['Int']['output']>
  internalMultiplier: Maybe<Scalars['Float']['output']>
  learnCommandAbility1Cost: Maybe<Scalars['Int']['output']>
  learnCommandAbility2Cost: Maybe<Scalars['Int']['output']>
  learnCommandAbility3Cost: Maybe<Scalars['Int']['output']>
  mixedTechModifier: Maybe<Scalars['Float']['output']>
  nonMechModifier: Maybe<Scalars['Float']['output']>
  omnimechReconfigureModifier: Maybe<Scalars['Float']['output']>
  pvPurchaseUnitMultiplier: Maybe<Scalars['Int']['output']>
  pvSellUnitMultiplier: Maybe<Scalars['Int']['output']>
  rearmCostPerTon: Maybe<Scalars['Int']['output']>
  rearmCostPerTonAlphaStrike: Maybe<Scalars['Int']['output']>
  replaceCommandAbilityCost: Maybe<Scalars['Int']['output']>
  tracks: Maybe<Array<Maybe<ProposedTrack>>>
  trainFormationCommanderCost: Maybe<Scalars['Int']['output']>
}

export type CampaignTrack = {
  __typename?: 'CampaignTrack'
  afterActionNarrative: Maybe<Scalars['String']['output']>
  attackerFactionId: Maybe<Scalars['ID']['output']>
  campaignId: Scalars['ID']['output']
  complications: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  location: Maybe<Scalars['String']['output']>
  monthIndex: Maybe<Scalars['Int']['output']>
  nextSession: Maybe<Scalars['String']['output']>
  oppositionComplications: Maybe<Scalars['String']['output']>
  sequenceOrder: Maybe<Scalars['Int']['output']>
  trackName: Maybe<Scalars['String']['output']>
}

export type CampaignUpdateInput = {
  armorMultiplier: InputMaybe<Scalars['Float']['input']>
  changeFormationTrainingCost: InputMaybe<Scalars['Int']['input']>
  clanTechModifier: InputMaybe<Scalars['Float']['input']>
  combatPay: InputMaybe<Scalars['Int']['input']>
  commandRights: InputMaybe<Scalars['String']['input']>
  commandStep: InputMaybe<Scalars['Int']['input']>
  crippledMultiplier: InputMaybe<Scalars['Float']['input']>
  description: InputMaybe<Scalars['String']['input']>
  destroyedMultiplier: InputMaybe<Scalars['Float']['input']>
  employer: InputMaybe<Scalars['String']['input']>
  employerCategory: InputMaybe<Scalars['String']['input']>
  healBattleArmorCost: InputMaybe<Scalars['Int']['input']>
  healMechWarriorPerMonthLimit: InputMaybe<Scalars['Int']['input']>
  healMechWarriorPerWoundBoxCost: InputMaybe<Scalars['Int']['input']>
  hireBattleArmorCost: InputMaybe<Scalars['Int']['input']>
  hireMechWarriorCost: InputMaybe<Scalars['Int']['input']>
  hireNamedPilotCost: InputMaybe<Scalars['Int']['input']>
  internalMultiplier: InputMaybe<Scalars['Float']['input']>
  learnCommandAbility1Cost: InputMaybe<Scalars['Int']['input']>
  learnCommandAbility2Cost: InputMaybe<Scalars['Int']['input']>
  learnCommandAbility3Cost: InputMaybe<Scalars['Int']['input']>
  lengthInMonths: InputMaybe<Scalars['Int']['input']>
  mission: InputMaybe<Scalars['String']['input']>
  mixedTechModifier: InputMaybe<Scalars['Float']['input']>
  monthlyMaintenance: InputMaybe<Scalars['Int']['input']>
  monthlyPay: InputMaybe<Scalars['Int']['input']>
  name: InputMaybe<Scalars['String']['input']>
  nonMechModifier: InputMaybe<Scalars['Float']['input']>
  omnimechReconfigureModifier: InputMaybe<Scalars['Float']['input']>
  oppCommandRights: InputMaybe<Scalars['String']['input']>
  oppCommandStep: InputMaybe<Scalars['Int']['input']>
  oppMission: InputMaybe<Scalars['String']['input']>
  oppPayRate: InputMaybe<Scalars['Float']['input']>
  oppPayStep: InputMaybe<Scalars['Int']['input']>
  oppSalvageStep: InputMaybe<Scalars['Int']['input']>
  oppSalvageTerms: InputMaybe<Scalars['String']['input']>
  oppSupportStep: InputMaybe<Scalars['Int']['input']>
  oppSupportTerms: InputMaybe<Scalars['String']['input']>
  oppTransportStep: InputMaybe<Scalars['Int']['input']>
  oppTransportTerms: InputMaybe<Scalars['String']['input']>
  opponent: InputMaybe<Scalars['String']['input']>
  opponentCategory: InputMaybe<Scalars['String']['input']>
  payRate: InputMaybe<Scalars['Float']['input']>
  payStep: InputMaybe<Scalars['Int']['input']>
  pvPurchaseUnitMultiplier: InputMaybe<Scalars['Int']['input']>
  pvSellUnitMultiplier: InputMaybe<Scalars['Int']['input']>
  rearmCostPerTon: InputMaybe<Scalars['Int']['input']>
  rearmCostPerTonAlphaStrike: InputMaybe<Scalars['Int']['input']>
  replaceCommandAbilityCost: InputMaybe<Scalars['Int']['input']>
  salvageStep: InputMaybe<Scalars['Int']['input']>
  salvageTerms: InputMaybe<Scalars['String']['input']>
  status: InputMaybe<Scalars['String']['input']>
  supportStep: InputMaybe<Scalars['Int']['input']>
  supportTerms: InputMaybe<Scalars['String']['input']>
  systemName: InputMaybe<Scalars['String']['input']>
  trackCount: InputMaybe<Scalars['Int']['input']>
  trainFormationCommanderCost: InputMaybe<Scalars['Int']['input']>
  transportStep: InputMaybe<Scalars['Int']['input']>
  transportTerms: InputMaybe<Scalars['String']['input']>
  transportationCost: InputMaybe<Scalars['Int']['input']>
}

export type CombatUnit = {
  __typename?: 'CombatUnit'
  asSize: Maybe<Scalars['Int']['output']>
  bv: Maybe<Scalars['Int']['output']>
  detachmentId: Maybe<Scalars['ID']['output']>
  id: Scalars['ID']['output']
  model: Maybe<Scalars['String']['output']>
  pv: Maybe<Scalars['Int']['output']>
  status: Maybe<Scalars['String']['output']>
  techBase: Maybe<Scalars['String']['output']>
  tonnage: Maybe<Scalars['Int']['output']>
  type: Maybe<Scalars['String']['output']>
  variant: Maybe<Scalars['String']['output']>
}

export type CombatUnitUpdateInput = {
  asSize: InputMaybe<Scalars['Int']['input']>
  bv: InputMaybe<Scalars['Int']['input']>
  detachmentId: InputMaybe<Scalars['ID']['input']>
  model: InputMaybe<Scalars['String']['input']>
  pv: InputMaybe<Scalars['Int']['input']>
  status: InputMaybe<Scalars['String']['input']>
  techBase: InputMaybe<Scalars['String']['input']>
  tonnage: InputMaybe<Scalars['Int']['input']>
  type: InputMaybe<Scalars['String']['input']>
  variant: InputMaybe<Scalars['String']['input']>
}

export type CommandAssetsResponse = {
  __typename?: 'CommandAssetsResponse'
  pilots: Maybe<Array<Maybe<Pilot>>>
  units: Maybe<Array<Maybe<CombatUnit>>>
}

export type CommandUpdateInput = {
  commandingOfficer: InputMaybe<Scalars['String']['input']>
  name: InputMaybe<Scalars['String']['input']>
}

export type Contract = {
  __typename?: 'Contract'
  commandRights: Maybe<Scalars['String']['output']>
  commandStep: Maybe<Scalars['Int']['output']>
  employerCategory: Maybe<Scalars['String']['output']>
  id: Maybe<Scalars['ID']['output']>
  missionType: Maybe<Scalars['String']['output']>
  payRate: Maybe<Scalars['Float']['output']>
  payStep: Maybe<Scalars['Int']['output']>
  primaryContract: Maybe<Scalars['Boolean']['output']>
  salvageStep: Maybe<Scalars['Int']['output']>
  salvageTerms: Maybe<Scalars['String']['output']>
  supportStep: Maybe<Scalars['Int']['output']>
  supportTerms: Maybe<Scalars['String']['output']>
  trackCount: Maybe<Scalars['Int']['output']>
  transportStep: Maybe<Scalars['Int']['output']>
  transportTerms: Maybe<Scalars['String']['output']>
}

export type ContractAssignment = {
  __typename?: 'ContractAssignment'
  contractId: Scalars['ID']['output']
  id: Scalars['ID']['output']
  monthIndex: Scalars['Int']['output']
}

export type Detachment = {
  __typename?: 'Detachment'
  callsign: Maybe<Scalars['String']['output']>
  campaignId: Maybe<Scalars['ID']['output']>
  campaignName: Maybe<Scalars['String']['output']>
  campaignRating: Maybe<Scalars['Int']['output']>
  contractAssignments: Maybe<Array<Maybe<ContractAssignment>>>
  id: Scalars['ID']['output']
  mercenaryCommandId: Maybe<Scalars['ID']['output']>
  mercenaryCommandName: Maybe<Scalars['String']['output']>
  name: Maybe<Scalars['String']['output']>
  pilots: Maybe<Array<Maybe<Pilot>>>
  units: Maybe<Array<Maybe<CombatUnit>>>
}

export type EmployerMarket = {
  __typename?: 'EmployerMarket'
  factionId: Scalars['ID']['output']
  markdown: Maybe<Scalars['String']['output']>
}

export type FactionReputation = {
  __typename?: 'FactionReputation'
  campaignFactionId: Scalars['ID']['output']
  id: Scalars['ID']['output']
  mercenaryCommandId: Scalars['ID']['output']
  score: Maybe<Scalars['Int']['output']>
  standing: Maybe<Scalars['String']['output']>
}

export type LedgerEntry = {
  __typename?: 'LedgerEntry'
  amount: Maybe<Scalars['Int']['output']>
  campaignId: Maybe<Scalars['ID']['output']>
  campaignName: Maybe<Scalars['String']['output']>
  commandId: Maybe<Scalars['ID']['output']>
  description: Maybe<Scalars['String']['output']>
  detachmentId: Maybe<Scalars['ID']['output']>
  id: Scalars['ID']['output']
  monthIndex: Maybe<Scalars['Int']['output']>
  reputationChange: Maybe<Scalars['Int']['output']>
  timestamp: Maybe<Scalars['String']['output']>
}

export type LedgerEntryInput = {
  amount: Scalars['Int']['input']
  campaignId: InputMaybe<Scalars['ID']['input']>
  campaignName: InputMaybe<Scalars['String']['input']>
  description: Scalars['String']['input']
  monthIndex: InputMaybe<Scalars['Int']['input']>
  reputationChange: InputMaybe<Scalars['Int']['input']>
}

export type MarketHireInput = {
  campaignId: Scalars['ID']['input']
  commandId: Scalars['ID']['input']
  detachmentId: Scalars['ID']['input']
  edgeAbilities: Scalars['String']['input']
  edgeAbilitySpEarned: Scalars['Int']['input']
  edgeTokensSpEarned: Scalars['Int']['input']
  gunnerySpEarned: Scalars['Int']['input']
  name: Scalars['String']['input']
  pilotingSpEarned: Scalars['Int']['input']
  price: Scalars['Int']['input']
  unitType: Scalars['String']['input']
  wounds: Scalars['Int']['input']
}

export type MarketPurchaseInput = {
  bv: Scalars['Int']['input']
  campaignId: Scalars['ID']['input']
  commandId: Scalars['ID']['input']
  condition: Scalars['Int']['input']
  detachmentId: Scalars['ID']['input']
  factionId: InputMaybe<Scalars['ID']['input']>
  marketType: MarketType
  model: Scalars['String']['input']
  price: Scalars['Int']['input']
  pv: Scalars['Int']['input']
  techBase: Scalars['String']['input']
  unitName: Scalars['String']['input']
}

export enum MarketType {
  Employer = 'EMPLOYER',
  Free = 'FREE',
  OppositionEmployer = 'OPPOSITION_EMPLOYER',
  PrimaryEmployer = 'PRIMARY_EMPLOYER',
  Scrappers = 'SCRAPPERS',
}

export type MercenaryCommand = {
  __typename?: 'MercenaryCommand'
  allLedgerEntries: Maybe<Array<Maybe<LedgerEntry>>>
  commandingOfficer: Maybe<Scalars['String']['output']>
  detachments: Maybe<Array<Maybe<Detachment>>>
  factionReputations: Maybe<Array<Maybe<FactionReputation>>>
  id: Scalars['ID']['output']
  name: Maybe<Scalars['String']['output']>
  ownerId: Maybe<Scalars['String']['output']>
  pilots: Maybe<Array<Maybe<Pilot>>>
  reputation: Maybe<Scalars['Int']['output']>
  totalSupportPoints: Maybe<Scalars['Int']['output']>
  units: Maybe<Array<Maybe<CombatUnit>>>
}

export type MissionMetadata = {
  __typename?: 'MissionMetadata'
  opponent: Maybe<Array<Maybe<Scalars['String']['output']>>>
  primary: Maybe<Array<Maybe<Scalars['String']['output']>>>
}

export type Mutation = {
  __typename?: 'Mutation'
  addCombatUnit: Maybe<CombatUnit>
  addLedgerEntry: Maybe<LedgerEntry>
  assignAsset: Maybe<Scalars['Boolean']['output']>
  assignDetachmentToCampaign: Maybe<Scalars['Boolean']['output']>
  assignDetachmentToContract: Maybe<Scalars['Boolean']['output']>
  createCampaign: Maybe<Campaign>
  createDetachment: Maybe<Detachment>
  createInvite: Maybe<CampaignInvite>
  deleteCommand: Maybe<Scalars['Boolean']['output']>
  deleteDetachment: Maybe<Scalars['Boolean']['output']>
  deleteInvite: Maybe<Scalars['Boolean']['output']>
  deletePilot: Maybe<Scalars['Boolean']['output']>
  deleteUnit: Maybe<Scalars['Boolean']['output']>
  establishCommand: Maybe<MercenaryCommand>
  generatePilotMarketLink: Scalars['String']['output']
  generateRandomPilotLink: Scalars['String']['output']
  generateUnitMarketLink: Scalars['String']['output']
  hirePilot: Maybe<Pilot>
  importCombatUnitsFromLink: Maybe<Array<Maybe<CombatUnit>>>
  importUnitsToMarket: Scalars['String']['output']
  joinCampaign: Maybe<Scalars['Boolean']['output']>
  loginWithToken: Maybe<Scalars['Boolean']['output']>
  reorderTracks: Array<CampaignTrack>
  rerollTrack: Maybe<CampaignTrack>
  saveMarketMarkdown: Scalars['Boolean']['output']
  updateCampaign: Maybe<Campaign>
  updateCombatUnit: Maybe<CombatUnit>
  updateCommand: Maybe<MercenaryCommand>
  updatePilot: Maybe<Pilot>
  updateTrack: Maybe<CampaignTrack>
  updateUserProfile: Maybe<UserProfile>
}

export type MutationAddCombatUnitArgs = {
  commandId: Scalars['ID']['input']
  input: CombatUnitUpdateInput
}

export type MutationAddLedgerEntryArgs = {
  commandId: Scalars['ID']['input']
  detachmentId: InputMaybe<Scalars['ID']['input']>
  input: LedgerEntryInput
}

export type MutationAssignAssetArgs = {
  assetId: Scalars['ID']['input']
  assetType: Scalars['String']['input']
  detachmentId: InputMaybe<Scalars['ID']['input']>
}

export type MutationAssignDetachmentToCampaignArgs = {
  campaignId: InputMaybe<Scalars['ID']['input']>
  detachmentId: Scalars['ID']['input']
}

export type MutationAssignDetachmentToContractArgs = {
  contractId: Scalars['ID']['input']
  detachmentId: Scalars['ID']['input']
  monthIndex: Scalars['Int']['input']
}

export type MutationCreateCampaignArgs = {
  input: CampaignCreateInput
}

export type MutationCreateDetachmentArgs = {
  campaignId: InputMaybe<Scalars['ID']['input']>
  commandId: Scalars['ID']['input']
  name: Scalars['String']['input']
}

export type MutationCreateInviteArgs = {
  campaignId: Scalars['ID']['input']
  recipientName: InputMaybe<Scalars['String']['input']>
}

export type MutationDeleteCommandArgs = {
  commandId: Scalars['ID']['input']
  force: InputMaybe<Scalars['Boolean']['input']>
}

export type MutationDeleteDetachmentArgs = {
  detachmentId: Scalars['ID']['input']
}

export type MutationDeleteInviteArgs = {
  id: Scalars['ID']['input']
}

export type MutationDeletePilotArgs = {
  pilotId: Scalars['ID']['input']
}

export type MutationDeleteUnitArgs = {
  unitId: Scalars['ID']['input']
}

export type MutationEstablishCommandArgs = {
  input: CommandUpdateInput
}

export type MutationGeneratePilotMarketLinkArgs = {
  url: Scalars['String']['input']
}

export type MutationGenerateRandomPilotLinkArgs = {
  campaignId: Scalars['ID']['input']
  weightClass: Scalars['String']['input']
}

export type MutationGenerateUnitMarketLinkArgs = {
  url: Scalars['String']['input']
}

export type MutationHirePilotArgs = {
  commandId: Scalars['ID']['input']
  input: PilotUpdateInput
}

export type MutationImportCombatUnitsFromLinkArgs = {
  commandId: Scalars['ID']['input']
  detachmentId: InputMaybe<Scalars['ID']['input']>
  link: Scalars['String']['input']
}

export type MutationImportUnitsToMarketArgs = {
  campaignId: Scalars['ID']['input']
  factionId: InputMaybe<Scalars['ID']['input']>
  marketType: MarketType
  url: Scalars['String']['input']
}

export type MutationJoinCampaignArgs = {
  detachmentId: Scalars['ID']['input']
  token: Scalars['String']['input']
}

export type MutationLoginWithTokenArgs = {
  token: Scalars['String']['input']
}

export type MutationReorderTracksArgs = {
  campaignId: Scalars['ID']['input']
  trackIds: Array<Scalars['ID']['input']>
}

export type MutationRerollTrackArgs = {
  id: Scalars['ID']['input']
}

export type MutationSaveMarketMarkdownArgs = {
  campaignId: Scalars['ID']['input']
  factionId: InputMaybe<Scalars['ID']['input']>
  markdown: Scalars['String']['input']
  marketType: MarketType
}

export type MutationUpdateCampaignArgs = {
  id: Scalars['ID']['input']
  input: CampaignUpdateInput
}

export type MutationUpdateCombatUnitArgs = {
  id: Scalars['ID']['input']
  input: CombatUnitUpdateInput
}

export type MutationUpdateCommandArgs = {
  id: Scalars['ID']['input']
  input: CommandUpdateInput
}

export type MutationUpdatePilotArgs = {
  id: Scalars['ID']['input']
  input: PilotUpdateInput
}

export type MutationUpdateTrackArgs = {
  id: Scalars['ID']['input']
  input: TrackUpdateInput
}

export type MutationUpdateUserProfileArgs = {
  displayName: InputMaybe<Scalars['String']['input']>
}

export type Pilot = {
  __typename?: 'Pilot'
  asSkill: Maybe<Scalars['Int']['output']>
  detachmentId: Maybe<Scalars['ID']['output']>
  edgeAbilities: Maybe<Scalars['String']['output']>
  edgeAbilitySkill: Maybe<Scalars['Int']['output']>
  edgeAbilitySpEarned: Maybe<Scalars['Int']['output']>
  edgeTokensSkill: Maybe<Scalars['Int']['output']>
  edgeTokensSpEarned: Maybe<Scalars['Int']['output']>
  gunnery: Maybe<Scalars['Int']['output']>
  gunnerySpEarned: Maybe<Scalars['Int']['output']>
  handicap: Maybe<Scalars['Int']['output']>
  id: Scalars['ID']['output']
  name: Maybe<Scalars['String']['output']>
  piloting: Maybe<Scalars['Int']['output']>
  pilotingSpEarned: Maybe<Scalars['Int']['output']>
  totalSpEarned: Maybe<Scalars['Int']['output']>
  unitType: Maybe<Scalars['String']['output']>
  wounds: Maybe<Scalars['Int']['output']>
}

export type PilotUpdateInput = {
  asSkill: InputMaybe<Scalars['Int']['input']>
  detachmentId: InputMaybe<Scalars['ID']['input']>
  edgeAbilities: InputMaybe<Scalars['String']['input']>
  edgeAbilitySkill: InputMaybe<Scalars['Int']['input']>
  edgeAbilitySpEarned: InputMaybe<Scalars['Int']['input']>
  edgeTokensSkill: InputMaybe<Scalars['Int']['input']>
  edgeTokensSpEarned: InputMaybe<Scalars['Int']['input']>
  gunnery: InputMaybe<Scalars['Int']['input']>
  gunnerySpEarned: InputMaybe<Scalars['Int']['input']>
  handicap: InputMaybe<Scalars['Int']['input']>
  name: InputMaybe<Scalars['String']['input']>
  piloting: InputMaybe<Scalars['Int']['input']>
  pilotingSpEarned: InputMaybe<Scalars['Int']['input']>
  totalSpEarned: InputMaybe<Scalars['Int']['input']>
  unitType: InputMaybe<Scalars['String']['input']>
  wounds: InputMaybe<Scalars['Int']['input']>
}

export type ProposedTrack = {
  __typename?: 'ProposedTrack'
  complication: Maybe<Scalars['String']['output']>
  name: Maybe<Scalars['String']['output']>
  oppositionComplication: Maybe<Scalars['String']['output']>
}

export type ProposedTrackInput = {
  complication: InputMaybe<Scalars['String']['input']>
  name: InputMaybe<Scalars['String']['input']>
  oppositionComplication: InputMaybe<Scalars['String']['input']>
}

export type PurchaseResult = {
  __typename?: 'PurchaseResult'
  message: Maybe<Scalars['String']['output']>
  remainingCBills: Scalars['Int']['output']
  success: Scalars['Boolean']['output']
  unitId: Maybe<Scalars['ID']['output']>
}

export type Query = {
  __typename?: 'Query'
  activeCampaigns: Maybe<Array<Maybe<Campaign>>>
  campaignMarket: Maybe<CampaignMarket>
  campaignMetadata: Maybe<CampaignMetadata>
  commandAssets: Maybe<CommandAssetsResponse>
  generateTracks: Maybe<Array<Maybe<ProposedTrack>>>
  getCampaign: Maybe<Campaign>
  getCommand: Maybe<MercenaryCommand>
  managedCampaigns: Maybe<Array<Maybe<Campaign>>>
  myCommands: Maybe<Array<Maybe<MercenaryCommand>>>
  participatingCampaigns: Maybe<Array<Maybe<Campaign>>>
  previewCampaign: Maybe<CampaignProposal>
  publicActiveCampaigns: Maybe<Array<Maybe<Campaign>>>
  publicCampaignMetadata: Maybe<CampaignMetadata>
  publicPreviewCampaign: Maybe<CampaignProposal>
  userProfile: Maybe<UserProfile>
}

export type QueryActiveCampaignsArgs = {
  page: InputMaybe<Scalars['Int']['input']>
  size: InputMaybe<Scalars['Int']['input']>
}

export type QueryCampaignMarketArgs = {
  campaignId: Scalars['ID']['input']
}

export type QueryCommandAssetsArgs = {
  commandId: Scalars['ID']['input']
}

export type QueryGenerateTracksArgs = {
  commandRights: Scalars['String']['input']
  count: Scalars['Int']['input']
  existing: InputMaybe<Array<InputMaybe<ProposedTrackInput>>>
  mission: Scalars['String']['input']
  oppCommandRights: Scalars['String']['input']
}

export type QueryGetCampaignArgs = {
  id: Scalars['ID']['input']
}

export type QueryGetCommandArgs = {
  id: Scalars['ID']['input']
}

export type QueryManagedCampaignsArgs = {
  status: InputMaybe<Scalars['String']['input']>
}

export type QueryParticipatingCampaignsArgs = {
  commandId: Scalars['ID']['input']
}

export type QueryPreviewCampaignArgs = {
  input: CampaignCreateInput
}

export type QueryPublicActiveCampaignsArgs = {
  page: InputMaybe<Scalars['Int']['input']>
  size: InputMaybe<Scalars['Int']['input']>
}

export type QueryPublicPreviewCampaignArgs = {
  input: CampaignCreateInput
}

export type ResolvedStepEntry = {
  __typename?: 'ResolvedStepEntry'
  step: Maybe<Scalars['Int']['output']>
  values: Maybe<ResolvedStepValues>
}

export type ResolvedStepValues = {
  __typename?: 'ResolvedStepValues'
  commandRights: Maybe<Scalars['String']['output']>
  payRate: Maybe<Scalars['String']['output']>
  salvageRights: Maybe<Scalars['String']['output']>
  supportRights: Maybe<Scalars['String']['output']>
  transportation: Maybe<Scalars['String']['output']>
}

export type Subscription = {
  __typename?: 'Subscription'
  ledgerUpdated: Maybe<MercenaryCommand>
}

export type SubscriptionLedgerUpdatedArgs = {
  commandId: Scalars['ID']['input']
}

export type TrackUpdateInput = {
  afterActionNarrative: InputMaybe<Scalars['String']['input']>
  attackerFactionId: InputMaybe<Scalars['ID']['input']>
  complications: InputMaybe<Scalars['String']['input']>
  location: InputMaybe<Scalars['String']['input']>
  monthIndex: InputMaybe<Scalars['Int']['input']>
  nextSession: InputMaybe<Scalars['String']['input']>
  oppositionComplications: InputMaybe<Scalars['String']['input']>
  sequenceOrder: InputMaybe<Scalars['Int']['input']>
  trackName: InputMaybe<Scalars['String']['input']>
}

export type User = {
  __typename?: 'User'
  displayName: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  role: Maybe<Scalars['String']['output']>
}

export type UserProfile = {
  __typename?: 'UserProfile'
  displayName: Maybe<Scalars['String']['output']>
  email: Maybe<Scalars['String']['output']>
  id: Scalars['ID']['output']
  name: Maybe<Scalars['String']['output']>
  role: Maybe<Scalars['String']['output']>
}
