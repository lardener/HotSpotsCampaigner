/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never }
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'
export type CampaignCreateInput = {
  armorMultiplier: number | null | undefined
  changeFormationTrainingCost: number | null | undefined
  clanTechModifier: number | null | undefined
  combatPay: number | null | undefined
  commandRights: string | null | undefined
  commandStep: number | null | undefined
  crippledMultiplier: number | null | undefined
  description: string | null | undefined
  destroyedMultiplier: number | null | undefined
  employer: string | null | undefined
  employerCategory: string | null | undefined
  healBattleArmorCost: number | null | undefined
  healMechWarriorPerMonthLimit: number | null | undefined
  healMechWarriorPerWoundBoxCost: number | null | undefined
  hireBattleArmorCost: number | null | undefined
  hireMechWarriorCost: number | null | undefined
  hireNamedPilotCost: number | null | undefined
  internalMultiplier: number | null | undefined
  learnCommandAbility1Cost: number | null | undefined
  learnCommandAbility2Cost: number | null | undefined
  learnCommandAbility3Cost: number | null | undefined
  lengthInMonths: number | null | undefined
  mission: string | null | undefined
  mixedTechModifier: number | null | undefined
  monthlyMaintenance: number | null | undefined
  monthlyPay: number | null | undefined
  name: string | null | undefined
  nonMechModifier: number | null | undefined
  omnimechReconfigureModifier: number | null | undefined
  oppCommandRights: string | null | undefined
  oppCommandStep: number | null | undefined
  oppMission: string | null | undefined
  oppPayRate: number | null | undefined
  oppPayStep: number | null | undefined
  oppSalvageStep: number | null | undefined
  oppSalvageTerms: string | null | undefined
  oppSupportStep: number | null | undefined
  oppSupportTerms: string | null | undefined
  oppTransportStep: number | null | undefined
  oppTransportTerms: string | null | undefined
  opponent: string | null | undefined
  opponentCategory: string | null | undefined
  payRate: number | null | undefined
  payStep: number | null | undefined
  pvPurchaseUnitMultiplier: number | null | undefined
  pvSellUnitMultiplier: number | null | undefined
  rearmCostPerTon: number | null | undefined
  rearmCostPerTonAlphaStrike: number | null | undefined
  replaceCommandAbilityCost: number | null | undefined
  salvageStep: number | null | undefined
  salvageTerms: string | null | undefined
  status: string | null | undefined
  supportStep: number | null | undefined
  supportTerms: string | null | undefined
  systemName: string | null | undefined
  trackCount: number | null | undefined
  tracks: Array<ProposedTrackInput | null | undefined> | null | undefined
  trainFormationCommanderCost: number | null | undefined
  transportStep: number | null | undefined
  transportTerms: string | null | undefined
  transportationCost: number | null | undefined
}

export type CampaignUpdateInput = {
  armorMultiplier: number | null | undefined
  changeFormationTrainingCost: number | null | undefined
  clanTechModifier: number | null | undefined
  combatPay: number | null | undefined
  commandRights: string | null | undefined
  commandStep: number | null | undefined
  crippledMultiplier: number | null | undefined
  description: string | null | undefined
  destroyedMultiplier: number | null | undefined
  employer: string | null | undefined
  employerCategory: string | null | undefined
  healBattleArmorCost: number | null | undefined
  healMechWarriorPerMonthLimit: number | null | undefined
  healMechWarriorPerWoundBoxCost: number | null | undefined
  hireBattleArmorCost: number | null | undefined
  hireMechWarriorCost: number | null | undefined
  hireNamedPilotCost: number | null | undefined
  internalMultiplier: number | null | undefined
  learnCommandAbility1Cost: number | null | undefined
  learnCommandAbility2Cost: number | null | undefined
  learnCommandAbility3Cost: number | null | undefined
  lengthInMonths: number | null | undefined
  mission: string | null | undefined
  mixedTechModifier: number | null | undefined
  monthlyMaintenance: number | null | undefined
  monthlyPay: number | null | undefined
  name: string | null | undefined
  nonMechModifier: number | null | undefined
  omnimechReconfigureModifier: number | null | undefined
  oppCommandRights: string | null | undefined
  oppCommandStep: number | null | undefined
  oppMission: string | null | undefined
  oppPayRate: number | null | undefined
  oppPayStep: number | null | undefined
  oppSalvageStep: number | null | undefined
  oppSalvageTerms: string | null | undefined
  oppSupportStep: number | null | undefined
  oppSupportTerms: string | null | undefined
  oppTransportStep: number | null | undefined
  oppTransportTerms: string | null | undefined
  opponent: string | null | undefined
  opponentCategory: string | null | undefined
  payRate: number | null | undefined
  payStep: number | null | undefined
  pvPurchaseUnitMultiplier: number | null | undefined
  pvSellUnitMultiplier: number | null | undefined
  rearmCostPerTon: number | null | undefined
  rearmCostPerTonAlphaStrike: number | null | undefined
  replaceCommandAbilityCost: number | null | undefined
  salvageStep: number | null | undefined
  salvageTerms: string | null | undefined
  status: string | null | undefined
  supportStep: number | null | undefined
  supportTerms: string | null | undefined
  systemName: string | null | undefined
  trackCount: number | null | undefined
  trainFormationCommanderCost: number | null | undefined
  transportStep: number | null | undefined
  transportTerms: string | null | undefined
  transportationCost: number | null | undefined
}

export type CombatUnitUpdateInput = {
  asSize: number | null | undefined
  bv: number | null | undefined
  detachmentId: string | null | undefined
  model: string | null | undefined
  pv: number | null | undefined
  status: string | null | undefined
  techBase: string | null | undefined
  tonnage: number | null | undefined
  type: string | null | undefined
  variant: string | null | undefined
}

export type CommandUpdateInput = {
  commandingOfficer: string | null | undefined
  name: string | null | undefined
}

export type LedgerEntryInput = {
  amount: number
  campaignId: string | null | undefined
  campaignName: string | null | undefined
  description: string
  monthIndex: number | null | undefined
  reputationChange: number | null | undefined
}

export type MarketType =
  'EMPLOYER' | 'FREE' | 'OPPOSITION_EMPLOYER' | 'PRIMARY_EMPLOYER' | 'SCRAPPERS'

export type PilotUpdateInput = {
  asSkill: number | null | undefined
  detachmentId: string | null | undefined
  edgeAbilities: string | null | undefined
  edgeAbilitySkill: number | null | undefined
  edgeAbilitySpEarned: number | null | undefined
  edgeTokensSkill: number | null | undefined
  edgeTokensSpEarned: number | null | undefined
  gunnery: number | null | undefined
  gunnerySpEarned: number | null | undefined
  handicap: number | null | undefined
  name: string | null | undefined
  piloting: number | null | undefined
  pilotingSpEarned: number | null | undefined
  totalSpEarned: number | null | undefined
  unitType: string | null | undefined
  wounds: number | null | undefined
}

export type ProposedTrackInput = {
  complication: string | null | undefined
  name: string | null | undefined
  oppositionComplication: string | null | undefined
}

export type TrackUpdateInput = {
  afterActionNarrative: string | null | undefined
  attackerFactionId: string | null | undefined
  complications: string | null | undefined
  location: string | null | undefined
  monthIndex: number | null | undefined
  nextSession: string | null | undefined
  oppositionComplications: string | null | undefined
  sequenceOrder: number | null | undefined
  trackName: string | null | undefined
}

export type GenerateUnitMarketLinkMutationVariables = Exact<{
  url: string
}>

export type GenerateUnitMarketLinkMutation = { generateUnitMarketLink: string }

export type GeneratePilotMarketLinkMutationVariables = Exact<{
  url: string
}>

export type GeneratePilotMarketLinkMutation = { generatePilotMarketLink: string }

export type GenerateRandomPilotLinkMutationVariables = Exact<{
  campaignId: string
  weightClass: string
}>

export type GenerateRandomPilotLinkMutation = { generateRandomPilotLink: string }

export type CombatUnitFieldsFragment = {
  id: string
  type: string | null
  model: string | null
  variant: string | null
  techBase: string | null
  tonnage: number | null
  asSize: number | null
  bv: number | null
  pv: number | null
  status: string | null
  detachmentId: string | null
}

export type PilotFieldsFragment = {
  id: string
  name: string | null
  gunnery: number | null
  piloting: number | null
  asSkill: number | null
  edgeTokensSkill: number | null
  edgeAbilitySkill: number | null
  edgeAbilities: string | null
  unitType: string | null
  wounds: number | null
  handicap: number | null
  totalSpEarned: number | null
  gunnerySpEarned: number | null
  pilotingSpEarned: number | null
  edgeTokensSpEarned: number | null
  edgeAbilitySpEarned: number | null
  detachmentId: string | null
}

export type ContractFieldsFragment = {
  id: string | null
  employerCategory: string | null
  missionType: string | null
  primaryContract: boolean | null
  payRate: number | null
  payStep: number | null
  salvageTerms: string | null
  salvageStep: number | null
  supportTerms: string | null
  supportStep: number | null
  transportTerms: string | null
  transportStep: number | null
  commandRights: string | null
  commandStep: number | null
  trackCount: number | null
}

export type TrackFieldsFragment = {
  id: string
  trackName: string | null
  sequenceOrder: number | null
  location: string | null
  nextSession: string | null
  attackerFactionId: string | null
  monthIndex: number | null
  complications: string | null
  afterActionNarrative: string | null
  oppositionComplications: string | null
}

export type CommandFieldsFragment = {
  id: string
  name: string | null
  commandingOfficer: string | null
  totalSupportPoints: number | null
  reputation: number | null
}

export type DetachmentFieldsFragment = {
  id: string
  name: string | null
  mercenaryCommandId: string | null
  mercenaryCommandName: string | null
  campaignId: string | null
  campaignName: string | null
}

export type GenerateCampaignQueryVariables = Exact<{
  input: CampaignCreateInput
}>

export type GenerateCampaignQuery = {
  publicPreviewCampaign: {
    campaign: {
      name: string | null
      systemName: string | null
      trackCount: number | null
      lengthInMonths: number | null
      monthlyPay: number | null
      monthlyMaintenance: number | null
      transportationCost: number | null
      combatPay: number | null
      armorMultiplier: number | null
      internalMultiplier: number | null
      crippledMultiplier: number | null
      destroyedMultiplier: number | null
      nonMechModifier: number | null
      mixedTechModifier: number | null
      clanTechModifier: number | null
      omnimechReconfigureModifier: number | null
      pvPurchaseUnitMultiplier: number | null
      pvSellUnitMultiplier: number | null
      rearmCostPerTon: number | null
      rearmCostPerTonAlphaStrike: number | null
      hireMechWarriorCost: number | null
      hireNamedPilotCost: number | null
      hireBattleArmorCost: number | null
      healMechWarriorPerWoundBoxCost: number | null
      healMechWarriorPerMonthLimit: number | null
      healBattleArmorCost: number | null
      trainFormationCommanderCost: number | null
      changeFormationTrainingCost: number | null
      learnCommandAbility1Cost: number | null
      learnCommandAbility2Cost: number | null
      learnCommandAbility3Cost: number | null
      replaceCommandAbilityCost: number | null
    } | null
    contracts: Array<{
      primaryContract: boolean | null
      missionType: string | null
      employerCategory: string | null
      payRate: number | null
      payStep: number | null
      salvageTerms: string | null
      salvageStep: number | null
      supportTerms: string | null
      supportStep: number | null
      transportTerms: string | null
      transportStep: number | null
      commandRights: string | null
      commandStep: number | null
      trackCount: number | null
    } | null> | null
    tracks: Array<{
      name: string | null
      complication: string | null
      oppositionComplication: string | null
    } | null> | null
  } | null
}

export type LedgerEntryFieldsFragment = {
  id: string
  timestamp: string | null
  detachmentId: string | null
  description: string | null
  amount: number | null
  reputationChange: number | null
  campaignName: string | null
  monthIndex: number | null
}

export type GetUserProfileQueryVariables = Exact<{ [key: string]: never }>

export type GetUserProfileQuery = {
  userProfile: {
    id: string
    name: string | null
    email: string | null
    displayName: string | null
    role: string | null
  } | null
}

export type LoginWithTokenMutationVariables = Exact<{
  token: string
}>

export type LoginWithTokenMutation = { loginWithToken: boolean | null }

export type UpdateUserProfileMutationVariables = Exact<{
  displayName: string
}>

export type UpdateUserProfileMutation = {
  updateUserProfile: { id: string; displayName: string | null; role: string | null } | null
}

export type GetCampaignMarketQueryVariables = Exact<{
  campaignId: string
}>

export type GetCampaignMarketQuery = {
  campaignMarket: {
    id: string
    campaignId: string
    freeMarketMarkdown: string | null
    scrapperMarketMarkdown: string | null
    scrapperFee: number
    employerMarkets: Array<{ factionId: string; markdown: string | null }>
  } | null
}

export type SaveMarketMarkdownMutationVariables = Exact<{
  campaignId: string
  marketType: MarketType
  markdown: string
  factionId: string | null | undefined
}>

export type SaveMarketMarkdownMutation = { saveMarketMarkdown: boolean }

export type GetActiveCampaignsQueryVariables = Exact<{
  page: number | null | undefined
  size: number | null | undefined
}>

export type GetActiveCampaignsQuery = {
  publicActiveCampaigns: Array<{
    id: string
    name: string | null
    systemName: string | null
    status: string | null
    trackCount: number | null
    primaryEmployer: string | null
    secondaryEmployer: string | null
  } | null> | null
}

export type GetCampaignMetadataQueryVariables = Exact<{ [key: string]: never }>

export type GetCampaignMetadataQuery = {
  publicCampaignMetadata: {
    trackTypes: Array<string | null> | null
    factions: Array<string | null> | null
    employerTypes: Array<string | null> | null
    unitStatuses: Array<string | null> | null
    unitTypes: Array<string | null> | null
    techBases: Array<string | null> | null
    missions: { primary: Array<string | null> | null; opponent: Array<string | null> | null } | null
    resolvedSteps: Array<{
      step: number | null
      values: {
        payRate: string | null
        salvageRights: string | null
        supportRights: string | null
        transportation: string | null
        commandRights: string | null
      } | null
    } | null> | null
  } | null
}

export type GenerateTracksQueryVariables = Exact<{
  mission: string
  commandRights: string
  oppCommandRights: string
  count: number
  existing: Array<ProposedTrackInput | null | undefined> | ProposedTrackInput | null | undefined
}>

export type GenerateTracksQuery = {
  generateTracks: Array<{
    name: string | null
    complication: string | null
    oppositionComplication: string | null
  } | null> | null
}

export type CreateCampaignMutationVariables = Exact<{
  input: CampaignCreateInput
}>

export type CreateCampaignMutation = {
  createCampaign: {
    id: string
    name: string | null
    systemName: string | null
    description: string | null
    lengthInMonths: number | null
    trackCount: number | null
    monthlyPay: number | null
    monthlyMaintenance: number | null
    transportationCost: number | null
    combatPay: number | null
    status: string | null
    payRate: number | null
    payStep: number | null
    salvageTerms: string | null
    salvageStep: number | null
    supportTerms: string | null
    supportStep: number | null
    transportTerms: string | null
    transportStep: number | null
    commandRights: string | null
    commandStep: number | null
  } | null
}

export type UpdateCampaignMutationVariables = Exact<{
  id: string
  input: CampaignUpdateInput
}>

export type UpdateCampaignMutation = {
  updateCampaign: {
    id: string
    name: string | null
    systemName: string | null
    description: string | null
    lengthInMonths: number | null
    trackCount: number | null
    monthlyPay: number | null
    monthlyMaintenance: number | null
    transportationCost: number | null
    combatPay: number | null
    status: string | null
    payRate: number | null
    payStep: number | null
    salvageTerms: string | null
    salvageStep: number | null
    supportTerms: string | null
    supportStep: number | null
    transportTerms: string | null
    transportStep: number | null
    commandRights: string | null
    commandStep: number | null
  } | null
}

export type GetManagedCampaignsQueryVariables = Exact<{
  status: string | null | undefined
}>

export type GetManagedCampaignsQuery = {
  managedCampaigns: Array<{
    id: string
    name: string | null
    systemName: string | null
    description: string | null
    status: string | null
    trackCount: number | null
    primaryEmployer: string | null
    secondaryEmployer: string | null
    payRate: number | null
    salvageTerms: string | null
    supportTerms: string | null
    transportTerms: string | null
    commandRights: string | null
    payStep: number | null
    salvageStep: number | null
    supportStep: number | null
    transportStep: number | null
    commandStep: number | null
    contracts: Array<{
      id: string | null
      employerCategory: string | null
      missionType: string | null
      primaryContract: boolean | null
      payRate: number | null
      payStep: number | null
      salvageTerms: string | null
      salvageStep: number | null
      supportTerms: string | null
      supportStep: number | null
      transportTerms: string | null
      transportStep: number | null
      commandRights: string | null
      commandStep: number | null
      trackCount: number | null
    } | null> | null
    factions: Array<{ id: string; factionName: string | null } | null> | null
    tracks: Array<{
      id: string
      trackName: string | null
      sequenceOrder: number | null
      location: string | null
      nextSession: string | null
      attackerFactionId: string | null
      monthIndex: number | null
      complications: string | null
      afterActionNarrative: string | null
      oppositionComplications: string | null
    } | null> | null
    participatingDetachments: Array<{
      id: string
      name: string | null
      mercenaryCommandId: string | null
      mercenaryCommandName: string | null
      campaignId: string | null
      campaignName: string | null
    } | null> | null
  } | null> | null
}

export type CreateDetachmentMutationVariables = Exact<{
  commandId: string
  campaignId: string | null | undefined
  name: string
}>

export type CreateDetachmentMutation = {
  createDetachment: {
    id: string
    name: string | null
    mercenaryCommandId: string | null
    mercenaryCommandName: string | null
    campaignId: string | null
    campaignName: string | null
  } | null
}

export type DeleteDetachmentMutationVariables = Exact<{
  detachmentId: string
}>

export type DeleteDetachmentMutation = { deleteDetachment: boolean | null }

export type AssignDetachmentToCampaignMutationVariables = Exact<{
  detachmentId: string
  campaignId: string | null | undefined
}>

export type AssignDetachmentToCampaignMutation = { assignDetachmentToCampaign: boolean | null }

export type JoinCampaignMutationVariables = Exact<{
  token: string
  detachmentId: string
}>

export type JoinCampaignMutation = { joinCampaign: boolean | null }

export type GetCampaignDetailsQueryVariables = Exact<{
  campaignId: string
}>

export type GetCampaignDetailsQuery = {
  getCampaign: {
    id: string
    name: string | null
    systemName: string | null
    description: string | null
    lengthInMonths: number | null
    trackCount: number | null
    status: string | null
    primaryEmployer: string | null
    secondaryEmployer: string | null
    monthlyPay: number | null
    monthlyMaintenance: number | null
    transportationCost: number | null
    combatPay: number | null
    payRate: number | null
    payStep: number | null
    salvageTerms: string | null
    salvageStep: number | null
    supportTerms: string | null
    supportStep: number | null
    transportTerms: string | null
    transportStep: number | null
    commandRights: string | null
    commandStep: number | null
    factions: Array<{ id: string; factionName: string | null } | null> | null
    tracks: Array<{
      id: string
      trackName: string | null
      sequenceOrder: number | null
      location: string | null
      nextSession: string | null
      attackerFactionId: string | null
      monthIndex: number | null
      complications: string | null
      afterActionNarrative: string | null
      oppositionComplications: string | null
    } | null> | null
    participatingDetachments: Array<{
      id: string
      name: string | null
      mercenaryCommandId: string | null
      mercenaryCommandName: string | null
      campaignId: string | null
      campaignName: string | null
      units: Array<{
        id: string
        type: string | null
        model: string | null
        variant: string | null
        techBase: string | null
        tonnage: number | null
        asSize: number | null
        bv: number | null
        pv: number | null
        status: string | null
        detachmentId: string | null
      } | null> | null
      pilots: Array<{
        id: string
        name: string | null
        gunnery: number | null
        piloting: number | null
        asSkill: number | null
        edgeTokensSkill: number | null
        edgeAbilitySkill: number | null
        edgeAbilities: string | null
        unitType: string | null
        wounds: number | null
        handicap: number | null
        totalSpEarned: number | null
        gunnerySpEarned: number | null
        pilotingSpEarned: number | null
        edgeTokensSpEarned: number | null
        edgeAbilitySpEarned: number | null
        detachmentId: string | null
      } | null> | null
    } | null> | null
    campaignInvites: Array<{
      id: string
      token: string | null
      recipientName: string | null
      expiresAt: string | null
      used: boolean | null
    } | null> | null
  } | null
}

export type UpdateTrackMutationVariables = Exact<{
  id: string
  input: TrackUpdateInput
}>

export type UpdateTrackMutation = {
  updateTrack: {
    id: string
    trackName: string | null
    location: string | null
    nextSession: string | null
    attackerFactionId: string | null
    monthIndex: number | null
    complications: string | null
    afterActionNarrative: string | null
    oppositionComplications: string | null
  } | null
}

export type RerollTrackMutationVariables = Exact<{
  id: string
}>

export type RerollTrackMutation = {
  rerollTrack: {
    id: string
    trackName: string | null
    complications: string | null
    oppositionComplications: string | null
  } | null
}

export type ReorderTracksMutationVariables = Exact<{
  campaignId: string
  trackIds: Array<string> | string
}>

export type ReorderTracksMutation = {
  reorderTracks: Array<{
    id: string
    sequenceOrder: number | null
    trackName: string | null
    location: string | null
    nextSession: string | null
    attackerFactionId: string | null
    monthIndex: number | null
    complications: string | null
    afterActionNarrative: string | null
    oppositionComplications: string | null
  }>
}

export type CreateInviteMutationVariables = Exact<{
  campaignId: string
  recipientName: string | null | undefined
}>

export type CreateInviteMutation = {
  createInvite: { token: string | null; recipientName: string | null } | null
}

export type DeleteInviteMutationVariables = Exact<{
  id: string
}>

export type DeleteInviteMutation = { deleteInvite: boolean | null }

export type GetMyCommandsQueryVariables = Exact<{ [key: string]: never }>

export type GetMyCommandsQuery = {
  myCommands: Array<{
    id: string
    name: string | null
    commandingOfficer: string | null
    totalSupportPoints: number | null
    reputation: number | null
    detachments: Array<{
      id: string
      name: string | null
      mercenaryCommandId: string | null
      mercenaryCommandName: string | null
      campaignId: string | null
      campaignName: string | null
    } | null> | null
  } | null> | null
}

export type GetUnitDossierQueryVariables = Exact<{
  commandId: string
}>

export type GetUnitDossierQuery = {
  getCommand: {
    id: string
    name: string | null
    commandingOfficer: string | null
    totalSupportPoints: number | null
    reputation: number | null
    units: Array<{
      id: string
      type: string | null
      model: string | null
      variant: string | null
      techBase: string | null
      tonnage: number | null
      asSize: number | null
      bv: number | null
      pv: number | null
      status: string | null
      detachmentId: string | null
    } | null> | null
    pilots: Array<{
      id: string
      name: string | null
      gunnery: number | null
      piloting: number | null
      asSkill: number | null
      edgeTokensSkill: number | null
      edgeAbilitySkill: number | null
      edgeAbilities: string | null
      unitType: string | null
      wounds: number | null
      handicap: number | null
      totalSpEarned: number | null
      gunnerySpEarned: number | null
      pilotingSpEarned: number | null
      edgeTokensSpEarned: number | null
      edgeAbilitySpEarned: number | null
      detachmentId: string | null
    } | null> | null
    detachments: Array<{
      id: string
      name: string | null
      mercenaryCommandId: string | null
      mercenaryCommandName: string | null
      campaignId: string | null
      campaignName: string | null
    } | null> | null
    allLedgerEntries: Array<{
      id: string
      timestamp: string | null
      detachmentId: string | null
      description: string | null
      amount: number | null
      reputationChange: number | null
      campaignName: string | null
      monthIndex: number | null
    } | null> | null
  } | null
  managedCampaigns: Array<{ id: string; name: string | null } | null> | null
  publicCampaignMetadata: {
    unitStatuses: Array<string | null> | null
    unitTypes: Array<string | null> | null
    techBases: Array<string | null> | null
  } | null
}

export type EstablishCommandMutationVariables = Exact<{
  input: CommandUpdateInput
}>

export type EstablishCommandMutation = {
  establishCommand: {
    id: string
    name: string | null
    commandingOfficer: string | null
    totalSupportPoints: number | null
    reputation: number | null
  } | null
}

export type UpdateCommandMutationVariables = Exact<{
  id: string
  input: CommandUpdateInput
}>

export type UpdateCommandMutation = {
  updateCommand: {
    id: string
    name: string | null
    commandingOfficer: string | null
    totalSupportPoints: number | null
    reputation: number | null
  } | null
}

export type DeleteCommandMutationVariables = Exact<{
  commandId: string
  force: boolean | null | undefined
}>

export type DeleteCommandMutation = { deleteCommand: boolean | null }

export type AssignAssetMutationVariables = Exact<{
  assetType: string
  assetId: string
  detachmentId: string | null | undefined
}>

export type AssignAssetMutation = { assignAsset: boolean | null }

export type GetForceDataQueryVariables = Exact<{
  commandId: string
}>

export type GetForceDataQuery = {
  getCommand: {
    id: string
    name: string | null
    commandingOfficer: string | null
    totalSupportPoints: number | null
    reputation: number | null
    units: Array<{
      id: string
      model: string | null
      tonnage: number | null
      status: string | null
      detachmentId: string | null
    } | null> | null
    pilots: Array<{
      id: string
      name: string | null
      gunnery: number | null
      piloting: number | null
      asSkill: number | null
      edgeTokensSkill: number | null
      edgeAbilitySkill: number | null
      edgeAbilities: string | null
      unitType: string | null
      wounds: number | null
      handicap: number | null
      totalSpEarned: number | null
      gunnerySpEarned: number | null
      pilotingSpEarned: number | null
      edgeTokensSpEarned: number | null
      edgeAbilitySpEarned: number | null
      detachmentId: string | null
    } | null> | null
    detachments: Array<{ id: string; name: string | null } | null> | null
  } | null
  managedCampaigns: Array<{
    id: string
    name: string | null
    systemName: string | null
    trackCount: number | null
  } | null> | null
  participatingCampaigns: Array<{
    id: string
    name: string | null
    primaryEmployer: string | null
  } | null> | null
  publicCampaignMetadata: {
    unitStatuses: Array<string | null> | null
    unitTypes: Array<string | null> | null
    techBases: Array<string | null> | null
  } | null
}

export type AddLedgerEntryMutationVariables = Exact<{
  commandId: string
  detachmentId: string | null | undefined
  input: LedgerEntryInput
}>

export type AddLedgerEntryMutation = { addLedgerEntry: { id: string } | null }

export type GetLedgerDataQueryVariables = Exact<{
  commandId: string
}>

export type GetLedgerDataQuery = {
  getCommand: {
    id: string
    name: string | null
    totalSupportPoints: number | null
    detachments: Array<{
      id: string
      name: string | null
      campaignId: string | null
      campaignName: string | null
    } | null> | null
  } | null
}

export type UpdateUnitMutationVariables = Exact<{
  id: string
  input: CombatUnitUpdateInput
}>

export type UpdateUnitMutation = {
  updateCombatUnit: {
    id: string
    type: string | null
    model: string | null
    variant: string | null
    techBase: string | null
    tonnage: number | null
    asSize: number | null
    bv: number | null
    pv: number | null
    status: string | null
    detachmentId: string | null
  } | null
}

export type UpdatePilotMutationVariables = Exact<{
  id: string
  input: PilotUpdateInput
}>

export type UpdatePilotMutation = {
  updatePilot: {
    id: string
    name: string | null
    gunnery: number | null
    piloting: number | null
    asSkill: number | null
    edgeTokensSkill: number | null
    edgeAbilitySkill: number | null
    edgeAbilities: string | null
    unitType: string | null
    wounds: number | null
    handicap: number | null
    totalSpEarned: number | null
    gunnerySpEarned: number | null
    pilotingSpEarned: number | null
    edgeTokensSpEarned: number | null
    edgeAbilitySpEarned: number | null
    detachmentId: string | null
  } | null
}

export type AddCombatUnitMutationVariables = Exact<{
  commandId: string
  input: CombatUnitUpdateInput
}>

export type AddCombatUnitMutation = {
  addCombatUnit: {
    id: string
    type: string | null
    model: string | null
    variant: string | null
    techBase: string | null
    tonnage: number | null
    asSize: number | null
    bv: number | null
    pv: number | null
    status: string | null
    detachmentId: string | null
  } | null
}

export type HirePilotMutationVariables = Exact<{
  commandId: string
  input: PilotUpdateInput
}>

export type HirePilotMutation = {
  hirePilot: {
    id: string
    name: string | null
    gunnery: number | null
    piloting: number | null
    asSkill: number | null
    edgeTokensSkill: number | null
    edgeAbilitySkill: number | null
    edgeAbilities: string | null
    unitType: string | null
    wounds: number | null
    handicap: number | null
    totalSpEarned: number | null
    gunnerySpEarned: number | null
    pilotingSpEarned: number | null
    edgeTokensSpEarned: number | null
    edgeAbilitySpEarned: number | null
    detachmentId: string | null
  } | null
}

export type ImportAssetsMutationVariables = Exact<{
  commandId: string
  detachmentId: string | null | undefined
  link: string
}>

export type ImportAssetsMutation = {
  importCombatUnitsFromLink: Array<{
    id: string
    type: string | null
    model: string | null
    variant: string | null
    techBase: string | null
    tonnage: number | null
    asSize: number | null
    bv: number | null
    pv: number | null
    status: string | null
    detachmentId: string | null
  } | null> | null
}

export type DeleteUnitMutationVariables = Exact<{
  unitId: string
}>

export type DeleteUnitMutation = { deleteUnit: boolean | null }

export type DeletePilotMutationVariables = Exact<{
  pilotId: string
}>

export type DeletePilotMutation = { deletePilot: boolean | null }

export const CombatUnitFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CombatUnitFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'CombatUnit' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'model' } },
          { kind: 'Field', name: { kind: 'Name', value: 'variant' } },
          { kind: 'Field', name: { kind: 'Name', value: 'techBase' } },
          { kind: 'Field', name: { kind: 'Name', value: 'tonnage' } },
          { kind: 'Field', name: { kind: 'Name', value: 'asSize' } },
          { kind: 'Field', name: { kind: 'Name', value: 'bv' } },
          { kind: 'Field', name: { kind: 'Name', value: 'pv' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'detachmentId' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CombatUnitFieldsFragment, unknown>
export const PilotFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PilotFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Pilot' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'gunnery' } },
          { kind: 'Field', name: { kind: 'Name', value: 'piloting' } },
          { kind: 'Field', name: { kind: 'Name', value: 'asSkill' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeTokensSkill' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeAbilitySkill' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeAbilities' } },
          { kind: 'Field', name: { kind: 'Name', value: 'unitType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'wounds' } },
          { kind: 'Field', name: { kind: 'Name', value: 'handicap' } },
          { kind: 'Field', name: { kind: 'Name', value: 'totalSpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'gunnerySpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'pilotingSpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeTokensSpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeAbilitySpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'detachmentId' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PilotFieldsFragment, unknown>
export const ContractFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ContractFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Contract' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'employerCategory' } },
          { kind: 'Field', name: { kind: 'Name', value: 'missionType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'primaryContract' } },
          { kind: 'Field', name: { kind: 'Name', value: 'payRate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'payStep' } },
          { kind: 'Field', name: { kind: 'Name', value: 'salvageTerms' } },
          { kind: 'Field', name: { kind: 'Name', value: 'salvageStep' } },
          { kind: 'Field', name: { kind: 'Name', value: 'supportTerms' } },
          { kind: 'Field', name: { kind: 'Name', value: 'supportStep' } },
          { kind: 'Field', name: { kind: 'Name', value: 'transportTerms' } },
          { kind: 'Field', name: { kind: 'Name', value: 'transportStep' } },
          { kind: 'Field', name: { kind: 'Name', value: 'commandRights' } },
          { kind: 'Field', name: { kind: 'Name', value: 'commandStep' } },
          { kind: 'Field', name: { kind: 'Name', value: 'trackCount' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ContractFieldsFragment, unknown>
export const TrackFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TrackFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'CampaignTrack' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'trackName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'sequenceOrder' } },
          { kind: 'Field', name: { kind: 'Name', value: 'location' } },
          { kind: 'Field', name: { kind: 'Name', value: 'nextSession' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attackerFactionId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'monthIndex' } },
          { kind: 'Field', name: { kind: 'Name', value: 'complications' } },
          { kind: 'Field', name: { kind: 'Name', value: 'afterActionNarrative' } },
          { kind: 'Field', name: { kind: 'Name', value: 'oppositionComplications' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TrackFieldsFragment, unknown>
export const CommandFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CommandFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'MercenaryCommand' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'commandingOfficer' } },
          { kind: 'Field', name: { kind: 'Name', value: 'totalSupportPoints' } },
          { kind: 'Field', name: { kind: 'Name', value: 'reputation' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CommandFieldsFragment, unknown>
export const DetachmentFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'DetachmentFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Detachment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mercenaryCommandId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mercenaryCommandName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'campaignId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'campaignName' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DetachmentFieldsFragment, unknown>
export const LedgerEntryFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'LedgerEntryFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'LedgerEntry' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'timestamp' } },
          { kind: 'Field', name: { kind: 'Name', value: 'detachmentId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'reputationChange' } },
          { kind: 'Field', name: { kind: 'Name', value: 'campaignName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'monthIndex' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LedgerEntryFieldsFragment, unknown>
export const GenerateUnitMarketLinkDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'GenerateUnitMarketLink' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'url' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'generateUnitMarketLink' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'url' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'url' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GenerateUnitMarketLinkMutation,
  GenerateUnitMarketLinkMutationVariables
>
export const GeneratePilotMarketLinkDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'GeneratePilotMarketLink' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'url' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'generatePilotMarketLink' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'url' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'url' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GeneratePilotMarketLinkMutation,
  GeneratePilotMarketLinkMutationVariables
>
export const GenerateRandomPilotLinkDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'GenerateRandomPilotLink' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'campaignId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'weightClass' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'generateRandomPilotLink' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'campaignId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'campaignId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'weightClass' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'weightClass' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GenerateRandomPilotLinkMutation,
  GenerateRandomPilotLinkMutationVariables
>
export const GenerateCampaignDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GenerateCampaign' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CampaignCreateInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'publicPreviewCampaign' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'campaign' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'systemName' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'trackCount' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'lengthInMonths' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'monthlyPay' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'monthlyMaintenance' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'transportationCost' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'combatPay' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'armorMultiplier' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'internalMultiplier' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'crippledMultiplier' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'destroyedMultiplier' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'nonMechModifier' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'mixedTechModifier' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'clanTechModifier' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'omnimechReconfigureModifier' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'pvPurchaseUnitMultiplier' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'pvSellUnitMultiplier' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'rearmCostPerTon' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'rearmCostPerTonAlphaStrike' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'hireMechWarriorCost' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'hireNamedPilotCost' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'hireBattleArmorCost' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'healMechWarriorPerWoundBoxCost' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'healMechWarriorPerMonthLimit' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'healBattleArmorCost' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'trainFormationCommanderCost' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'changeFormationTrainingCost' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'learnCommandAbility1Cost' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'learnCommandAbility2Cost' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'learnCommandAbility3Cost' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'replaceCommandAbilityCost' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'contracts' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'primaryContract' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'missionType' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'employerCategory' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'payRate' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'payStep' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'salvageTerms' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'salvageStep' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'supportTerms' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'supportStep' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'transportTerms' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'transportStep' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'commandRights' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'commandStep' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'trackCount' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'tracks' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'complication' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'oppositionComplication' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GenerateCampaignQuery, GenerateCampaignQueryVariables>
export const GetUserProfileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetUserProfile' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'userProfile' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'displayName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'role' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetUserProfileQuery, GetUserProfileQueryVariables>
export const LoginWithTokenDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'LoginWithToken' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'token' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'loginWithToken' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'token' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'token' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LoginWithTokenMutation, LoginWithTokenMutationVariables>
export const UpdateUserProfileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateUserProfile' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'displayName' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateUserProfile' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'displayName' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'displayName' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'displayName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'role' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateUserProfileMutation, UpdateUserProfileMutationVariables>
export const GetCampaignMarketDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetCampaignMarket' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'campaignId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'campaignMarket' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'campaignId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'campaignId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'campaignId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'freeMarketMarkdown' } },
                { kind: 'Field', name: { kind: 'Name', value: 'scrapperMarketMarkdown' } },
                { kind: 'Field', name: { kind: 'Name', value: 'scrapperFee' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'employerMarkets' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'factionId' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'markdown' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetCampaignMarketQuery, GetCampaignMarketQueryVariables>
export const SaveMarketMarkdownDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'SaveMarketMarkdown' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'campaignId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'marketType' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'MarketType' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'markdown' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'factionId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'saveMarketMarkdown' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'campaignId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'campaignId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'marketType' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'marketType' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'markdown' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'markdown' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'factionId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'factionId' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SaveMarketMarkdownMutation, SaveMarketMarkdownMutationVariables>
export const GetActiveCampaignsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetActiveCampaigns' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'page' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'size' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'publicActiveCampaigns' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'page' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'page' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'size' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'size' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'systemName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'trackCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'primaryEmployer' } },
                { kind: 'Field', name: { kind: 'Name', value: 'secondaryEmployer' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetActiveCampaignsQuery, GetActiveCampaignsQueryVariables>
export const GetCampaignMetadataDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetCampaignMetadata' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'publicCampaignMetadata' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'missions' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'primary' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'opponent' } },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'trackTypes' } },
                { kind: 'Field', name: { kind: 'Name', value: 'factions' } },
                { kind: 'Field', name: { kind: 'Name', value: 'employerTypes' } },
                { kind: 'Field', name: { kind: 'Name', value: 'unitStatuses' } },
                { kind: 'Field', name: { kind: 'Name', value: 'unitTypes' } },
                { kind: 'Field', name: { kind: 'Name', value: 'techBases' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'resolvedSteps' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'step' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'values' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            { kind: 'Field', name: { kind: 'Name', value: 'payRate' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'salvageRights' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'supportRights' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'transportation' } },
                            { kind: 'Field', name: { kind: 'Name', value: 'commandRights' } },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetCampaignMetadataQuery, GetCampaignMetadataQueryVariables>
export const GenerateTracksDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GenerateTracks' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'mission' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'commandRights' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'oppCommandRights' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'count' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'existing' } },
          type: {
            kind: 'ListType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ProposedTrackInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'generateTracks' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'mission' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'mission' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'commandRights' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'commandRights' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'oppCommandRights' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'oppCommandRights' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'count' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'count' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'existing' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'existing' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'complication' } },
                { kind: 'Field', name: { kind: 'Name', value: 'oppositionComplication' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GenerateTracksQuery, GenerateTracksQueryVariables>
export const CreateCampaignDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateCampaign' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CampaignCreateInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createCampaign' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'systemName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lengthInMonths' } },
                { kind: 'Field', name: { kind: 'Name', value: 'trackCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'monthlyPay' } },
                { kind: 'Field', name: { kind: 'Name', value: 'monthlyMaintenance' } },
                { kind: 'Field', name: { kind: 'Name', value: 'transportationCost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'combatPay' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'payRate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'payStep' } },
                { kind: 'Field', name: { kind: 'Name', value: 'salvageTerms' } },
                { kind: 'Field', name: { kind: 'Name', value: 'salvageStep' } },
                { kind: 'Field', name: { kind: 'Name', value: 'supportTerms' } },
                { kind: 'Field', name: { kind: 'Name', value: 'supportStep' } },
                { kind: 'Field', name: { kind: 'Name', value: 'transportTerms' } },
                { kind: 'Field', name: { kind: 'Name', value: 'transportStep' } },
                { kind: 'Field', name: { kind: 'Name', value: 'commandRights' } },
                { kind: 'Field', name: { kind: 'Name', value: 'commandStep' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateCampaignMutation, CreateCampaignMutationVariables>
export const UpdateCampaignDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateCampaign' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CampaignUpdateInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateCampaign' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'systemName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lengthInMonths' } },
                { kind: 'Field', name: { kind: 'Name', value: 'trackCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'monthlyPay' } },
                { kind: 'Field', name: { kind: 'Name', value: 'monthlyMaintenance' } },
                { kind: 'Field', name: { kind: 'Name', value: 'transportationCost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'combatPay' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'payRate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'payStep' } },
                { kind: 'Field', name: { kind: 'Name', value: 'salvageTerms' } },
                { kind: 'Field', name: { kind: 'Name', value: 'salvageStep' } },
                { kind: 'Field', name: { kind: 'Name', value: 'supportTerms' } },
                { kind: 'Field', name: { kind: 'Name', value: 'supportStep' } },
                { kind: 'Field', name: { kind: 'Name', value: 'transportTerms' } },
                { kind: 'Field', name: { kind: 'Name', value: 'transportStep' } },
                { kind: 'Field', name: { kind: 'Name', value: 'commandRights' } },
                { kind: 'Field', name: { kind: 'Name', value: 'commandStep' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateCampaignMutation, UpdateCampaignMutationVariables>
export const GetManagedCampaignsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetManagedCampaigns' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'status' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'managedCampaigns' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'status' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'status' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'systemName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'trackCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'primaryEmployer' } },
                { kind: 'Field', name: { kind: 'Name', value: 'secondaryEmployer' } },
                { kind: 'Field', name: { kind: 'Name', value: 'payRate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'salvageTerms' } },
                { kind: 'Field', name: { kind: 'Name', value: 'supportTerms' } },
                { kind: 'Field', name: { kind: 'Name', value: 'transportTerms' } },
                { kind: 'Field', name: { kind: 'Name', value: 'commandRights' } },
                { kind: 'Field', name: { kind: 'Name', value: 'payStep' } },
                { kind: 'Field', name: { kind: 'Name', value: 'salvageStep' } },
                { kind: 'Field', name: { kind: 'Name', value: 'supportStep' } },
                { kind: 'Field', name: { kind: 'Name', value: 'transportStep' } },
                { kind: 'Field', name: { kind: 'Name', value: 'commandStep' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'contracts' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'ContractFields' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'factions' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'factionName' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'tracks' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'TrackFields' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'participatingDetachments' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'DetachmentFields' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ContractFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Contract' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'employerCategory' } },
          { kind: 'Field', name: { kind: 'Name', value: 'missionType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'primaryContract' } },
          { kind: 'Field', name: { kind: 'Name', value: 'payRate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'payStep' } },
          { kind: 'Field', name: { kind: 'Name', value: 'salvageTerms' } },
          { kind: 'Field', name: { kind: 'Name', value: 'salvageStep' } },
          { kind: 'Field', name: { kind: 'Name', value: 'supportTerms' } },
          { kind: 'Field', name: { kind: 'Name', value: 'supportStep' } },
          { kind: 'Field', name: { kind: 'Name', value: 'transportTerms' } },
          { kind: 'Field', name: { kind: 'Name', value: 'transportStep' } },
          { kind: 'Field', name: { kind: 'Name', value: 'commandRights' } },
          { kind: 'Field', name: { kind: 'Name', value: 'commandStep' } },
          { kind: 'Field', name: { kind: 'Name', value: 'trackCount' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TrackFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'CampaignTrack' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'trackName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'sequenceOrder' } },
          { kind: 'Field', name: { kind: 'Name', value: 'location' } },
          { kind: 'Field', name: { kind: 'Name', value: 'nextSession' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attackerFactionId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'monthIndex' } },
          { kind: 'Field', name: { kind: 'Name', value: 'complications' } },
          { kind: 'Field', name: { kind: 'Name', value: 'afterActionNarrative' } },
          { kind: 'Field', name: { kind: 'Name', value: 'oppositionComplications' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'DetachmentFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Detachment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mercenaryCommandId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mercenaryCommandName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'campaignId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'campaignName' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetManagedCampaignsQuery, GetManagedCampaignsQueryVariables>
export const CreateDetachmentDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateDetachment' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'commandId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'campaignId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createDetachment' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'commandId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'commandId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'campaignId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'campaignId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'name' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'name' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'DetachmentFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'DetachmentFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Detachment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mercenaryCommandId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mercenaryCommandName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'campaignId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'campaignName' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateDetachmentMutation, CreateDetachmentMutationVariables>
export const DeleteDetachmentDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteDetachment' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'detachmentId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteDetachment' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'detachmentId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'detachmentId' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteDetachmentMutation, DeleteDetachmentMutationVariables>
export const AssignDetachmentToCampaignDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'AssignDetachmentToCampaign' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'detachmentId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'campaignId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'assignDetachmentToCampaign' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'detachmentId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'detachmentId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'campaignId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'campaignId' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssignDetachmentToCampaignMutation,
  AssignDetachmentToCampaignMutationVariables
>
export const JoinCampaignDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'JoinCampaign' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'token' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'detachmentId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'joinCampaign' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'token' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'token' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'detachmentId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'detachmentId' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<JoinCampaignMutation, JoinCampaignMutationVariables>
export const GetCampaignDetailsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetCampaignDetails' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'campaignId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getCampaign' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'campaignId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'systemName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lengthInMonths' } },
                { kind: 'Field', name: { kind: 'Name', value: 'trackCount' } },
                { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                { kind: 'Field', name: { kind: 'Name', value: 'primaryEmployer' } },
                { kind: 'Field', name: { kind: 'Name', value: 'secondaryEmployer' } },
                { kind: 'Field', name: { kind: 'Name', value: 'monthlyPay' } },
                { kind: 'Field', name: { kind: 'Name', value: 'monthlyMaintenance' } },
                { kind: 'Field', name: { kind: 'Name', value: 'transportationCost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'combatPay' } },
                { kind: 'Field', name: { kind: 'Name', value: 'payRate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'payStep' } },
                { kind: 'Field', name: { kind: 'Name', value: 'salvageTerms' } },
                { kind: 'Field', name: { kind: 'Name', value: 'salvageStep' } },
                { kind: 'Field', name: { kind: 'Name', value: 'supportTerms' } },
                { kind: 'Field', name: { kind: 'Name', value: 'supportStep' } },
                { kind: 'Field', name: { kind: 'Name', value: 'transportTerms' } },
                { kind: 'Field', name: { kind: 'Name', value: 'transportStep' } },
                { kind: 'Field', name: { kind: 'Name', value: 'commandRights' } },
                { kind: 'Field', name: { kind: 'Name', value: 'commandStep' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'factions' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'factionName' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'tracks' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'TrackFields' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'participatingDetachments' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'DetachmentFields' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'units' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'FragmentSpread',
                              name: { kind: 'Name', value: 'CombatUnitFields' },
                            },
                          ],
                        },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'pilots' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'FragmentSpread',
                              name: { kind: 'Name', value: 'PilotFields' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'campaignInvites' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'token' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'recipientName' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'expiresAt' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'used' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TrackFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'CampaignTrack' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'trackName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'sequenceOrder' } },
          { kind: 'Field', name: { kind: 'Name', value: 'location' } },
          { kind: 'Field', name: { kind: 'Name', value: 'nextSession' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attackerFactionId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'monthIndex' } },
          { kind: 'Field', name: { kind: 'Name', value: 'complications' } },
          { kind: 'Field', name: { kind: 'Name', value: 'afterActionNarrative' } },
          { kind: 'Field', name: { kind: 'Name', value: 'oppositionComplications' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'DetachmentFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Detachment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mercenaryCommandId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mercenaryCommandName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'campaignId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'campaignName' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CombatUnitFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'CombatUnit' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'model' } },
          { kind: 'Field', name: { kind: 'Name', value: 'variant' } },
          { kind: 'Field', name: { kind: 'Name', value: 'techBase' } },
          { kind: 'Field', name: { kind: 'Name', value: 'tonnage' } },
          { kind: 'Field', name: { kind: 'Name', value: 'asSize' } },
          { kind: 'Field', name: { kind: 'Name', value: 'bv' } },
          { kind: 'Field', name: { kind: 'Name', value: 'pv' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'detachmentId' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PilotFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Pilot' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'gunnery' } },
          { kind: 'Field', name: { kind: 'Name', value: 'piloting' } },
          { kind: 'Field', name: { kind: 'Name', value: 'asSkill' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeTokensSkill' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeAbilitySkill' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeAbilities' } },
          { kind: 'Field', name: { kind: 'Name', value: 'unitType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'wounds' } },
          { kind: 'Field', name: { kind: 'Name', value: 'handicap' } },
          { kind: 'Field', name: { kind: 'Name', value: 'totalSpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'gunnerySpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'pilotingSpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeTokensSpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeAbilitySpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'detachmentId' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetCampaignDetailsQuery, GetCampaignDetailsQueryVariables>
export const UpdateTrackDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateTrack' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'TrackUpdateInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateTrack' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'trackName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'location' } },
                { kind: 'Field', name: { kind: 'Name', value: 'nextSession' } },
                { kind: 'Field', name: { kind: 'Name', value: 'attackerFactionId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'monthIndex' } },
                { kind: 'Field', name: { kind: 'Name', value: 'complications' } },
                { kind: 'Field', name: { kind: 'Name', value: 'afterActionNarrative' } },
                { kind: 'Field', name: { kind: 'Name', value: 'oppositionComplications' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateTrackMutation, UpdateTrackMutationVariables>
export const RerollTrackDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RerollTrack' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'rerollTrack' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'trackName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'complications' } },
                { kind: 'Field', name: { kind: 'Name', value: 'oppositionComplications' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RerollTrackMutation, RerollTrackMutationVariables>
export const ReorderTracksDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ReorderTracks' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'campaignId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'trackIds' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'reorderTracks' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'campaignId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'campaignId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'trackIds' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'trackIds' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sequenceOrder' } },
                { kind: 'Field', name: { kind: 'Name', value: 'trackName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'location' } },
                { kind: 'Field', name: { kind: 'Name', value: 'nextSession' } },
                { kind: 'Field', name: { kind: 'Name', value: 'attackerFactionId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'monthIndex' } },
                { kind: 'Field', name: { kind: 'Name', value: 'complications' } },
                { kind: 'Field', name: { kind: 'Name', value: 'afterActionNarrative' } },
                { kind: 'Field', name: { kind: 'Name', value: 'oppositionComplications' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ReorderTracksMutation, ReorderTracksMutationVariables>
export const CreateInviteDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateInvite' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'campaignId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'recipientName' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createInvite' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'campaignId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'campaignId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'recipientName' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'recipientName' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'token' } },
                { kind: 'Field', name: { kind: 'Name', value: 'recipientName' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateInviteMutation, CreateInviteMutationVariables>
export const DeleteInviteDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteInvite' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteInvite' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteInviteMutation, DeleteInviteMutationVariables>
export const GetMyCommandsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetMyCommands' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'myCommands' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'CommandFields' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'detachments' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'DetachmentFields' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CommandFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'MercenaryCommand' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'commandingOfficer' } },
          { kind: 'Field', name: { kind: 'Name', value: 'totalSupportPoints' } },
          { kind: 'Field', name: { kind: 'Name', value: 'reputation' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'DetachmentFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Detachment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mercenaryCommandId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mercenaryCommandName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'campaignId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'campaignName' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetMyCommandsQuery, GetMyCommandsQueryVariables>
export const GetUnitDossierDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetUnitDossier' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'commandId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getCommand' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'commandId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'CommandFields' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'units' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'CombatUnitFields' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'pilots' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'PilotFields' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'detachments' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'DetachmentFields' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'allLedgerEntries' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'LedgerEntryFields' },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'managedCampaigns' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'status' },
                value: { kind: 'StringValue', value: 'ACTIVE', block: false },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'publicCampaignMetadata' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'unitStatuses' } },
                { kind: 'Field', name: { kind: 'Name', value: 'unitTypes' } },
                { kind: 'Field', name: { kind: 'Name', value: 'techBases' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CommandFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'MercenaryCommand' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'commandingOfficer' } },
          { kind: 'Field', name: { kind: 'Name', value: 'totalSupportPoints' } },
          { kind: 'Field', name: { kind: 'Name', value: 'reputation' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CombatUnitFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'CombatUnit' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'model' } },
          { kind: 'Field', name: { kind: 'Name', value: 'variant' } },
          { kind: 'Field', name: { kind: 'Name', value: 'techBase' } },
          { kind: 'Field', name: { kind: 'Name', value: 'tonnage' } },
          { kind: 'Field', name: { kind: 'Name', value: 'asSize' } },
          { kind: 'Field', name: { kind: 'Name', value: 'bv' } },
          { kind: 'Field', name: { kind: 'Name', value: 'pv' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'detachmentId' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PilotFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Pilot' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'gunnery' } },
          { kind: 'Field', name: { kind: 'Name', value: 'piloting' } },
          { kind: 'Field', name: { kind: 'Name', value: 'asSkill' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeTokensSkill' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeAbilitySkill' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeAbilities' } },
          { kind: 'Field', name: { kind: 'Name', value: 'unitType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'wounds' } },
          { kind: 'Field', name: { kind: 'Name', value: 'handicap' } },
          { kind: 'Field', name: { kind: 'Name', value: 'totalSpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'gunnerySpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'pilotingSpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeTokensSpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeAbilitySpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'detachmentId' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'DetachmentFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Detachment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mercenaryCommandId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mercenaryCommandName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'campaignId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'campaignName' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'LedgerEntryFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'LedgerEntry' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'timestamp' } },
          { kind: 'Field', name: { kind: 'Name', value: 'detachmentId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'reputationChange' } },
          { kind: 'Field', name: { kind: 'Name', value: 'campaignName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'monthIndex' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetUnitDossierQuery, GetUnitDossierQueryVariables>
export const EstablishCommandDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'EstablishCommand' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CommandUpdateInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'establishCommand' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'CommandFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CommandFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'MercenaryCommand' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'commandingOfficer' } },
          { kind: 'Field', name: { kind: 'Name', value: 'totalSupportPoints' } },
          { kind: 'Field', name: { kind: 'Name', value: 'reputation' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<EstablishCommandMutation, EstablishCommandMutationVariables>
export const UpdateCommandDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateCommand' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CommandUpdateInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateCommand' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'CommandFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CommandFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'MercenaryCommand' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'commandingOfficer' } },
          { kind: 'Field', name: { kind: 'Name', value: 'totalSupportPoints' } },
          { kind: 'Field', name: { kind: 'Name', value: 'reputation' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateCommandMutation, UpdateCommandMutationVariables>
export const DeleteCommandDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteCommand' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'commandId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'force' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Boolean' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteCommand' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'commandId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'commandId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'force' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'force' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteCommandMutation, DeleteCommandMutationVariables>
export const AssignAssetDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'AssignAsset' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'assetType' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'assetId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'detachmentId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'assignAsset' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'assetType' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'assetType' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'assetId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'assetId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'detachmentId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'detachmentId' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AssignAssetMutation, AssignAssetMutationVariables>
export const GetForceDataDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetForceData' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'commandId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getCommand' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'commandId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'CommandFields' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'units' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'model' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'tonnage' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'status' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'detachmentId' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'pilots' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'PilotFields' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'detachments' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'managedCampaigns' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'status' },
                value: { kind: 'StringValue', value: 'ACTIVE', block: false },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'systemName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'trackCount' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'participatingCampaigns' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'commandId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'commandId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'primaryEmployer' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'publicCampaignMetadata' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'unitStatuses' } },
                { kind: 'Field', name: { kind: 'Name', value: 'unitTypes' } },
                { kind: 'Field', name: { kind: 'Name', value: 'techBases' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CommandFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'MercenaryCommand' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'commandingOfficer' } },
          { kind: 'Field', name: { kind: 'Name', value: 'totalSupportPoints' } },
          { kind: 'Field', name: { kind: 'Name', value: 'reputation' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PilotFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Pilot' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'gunnery' } },
          { kind: 'Field', name: { kind: 'Name', value: 'piloting' } },
          { kind: 'Field', name: { kind: 'Name', value: 'asSkill' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeTokensSkill' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeAbilitySkill' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeAbilities' } },
          { kind: 'Field', name: { kind: 'Name', value: 'unitType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'wounds' } },
          { kind: 'Field', name: { kind: 'Name', value: 'handicap' } },
          { kind: 'Field', name: { kind: 'Name', value: 'totalSpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'gunnerySpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'pilotingSpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeTokensSpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeAbilitySpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'detachmentId' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetForceDataQuery, GetForceDataQueryVariables>
export const AddLedgerEntryDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'AddLedgerEntry' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'commandId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'detachmentId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'LedgerEntryInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'addLedgerEntry' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'commandId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'commandId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'detachmentId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'detachmentId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AddLedgerEntryMutation, AddLedgerEntryMutationVariables>
export const GetLedgerDataDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetLedgerData' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'commandId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'getCommand' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'commandId' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'totalSupportPoints' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'detachments' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'campaignId' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'campaignName' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetLedgerDataQuery, GetLedgerDataQueryVariables>
export const UpdateUnitDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateUnit' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CombatUnitUpdateInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateCombatUnit' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'CombatUnitFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CombatUnitFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'CombatUnit' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'model' } },
          { kind: 'Field', name: { kind: 'Name', value: 'variant' } },
          { kind: 'Field', name: { kind: 'Name', value: 'techBase' } },
          { kind: 'Field', name: { kind: 'Name', value: 'tonnage' } },
          { kind: 'Field', name: { kind: 'Name', value: 'asSize' } },
          { kind: 'Field', name: { kind: 'Name', value: 'bv' } },
          { kind: 'Field', name: { kind: 'Name', value: 'pv' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'detachmentId' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateUnitMutation, UpdateUnitMutationVariables>
export const UpdatePilotDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdatePilot' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'PilotUpdateInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updatePilot' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'PilotFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PilotFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Pilot' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'gunnery' } },
          { kind: 'Field', name: { kind: 'Name', value: 'piloting' } },
          { kind: 'Field', name: { kind: 'Name', value: 'asSkill' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeTokensSkill' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeAbilitySkill' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeAbilities' } },
          { kind: 'Field', name: { kind: 'Name', value: 'unitType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'wounds' } },
          { kind: 'Field', name: { kind: 'Name', value: 'handicap' } },
          { kind: 'Field', name: { kind: 'Name', value: 'totalSpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'gunnerySpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'pilotingSpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeTokensSpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeAbilitySpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'detachmentId' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdatePilotMutation, UpdatePilotMutationVariables>
export const AddCombatUnitDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'AddCombatUnit' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'commandId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CombatUnitUpdateInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'addCombatUnit' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'commandId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'commandId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'CombatUnitFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CombatUnitFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'CombatUnit' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'model' } },
          { kind: 'Field', name: { kind: 'Name', value: 'variant' } },
          { kind: 'Field', name: { kind: 'Name', value: 'techBase' } },
          { kind: 'Field', name: { kind: 'Name', value: 'tonnage' } },
          { kind: 'Field', name: { kind: 'Name', value: 'asSize' } },
          { kind: 'Field', name: { kind: 'Name', value: 'bv' } },
          { kind: 'Field', name: { kind: 'Name', value: 'pv' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'detachmentId' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AddCombatUnitMutation, AddCombatUnitMutationVariables>
export const HirePilotDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'HirePilot' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'commandId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'PilotUpdateInput' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'hirePilot' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'commandId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'commandId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'PilotFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PilotFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Pilot' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'gunnery' } },
          { kind: 'Field', name: { kind: 'Name', value: 'piloting' } },
          { kind: 'Field', name: { kind: 'Name', value: 'asSkill' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeTokensSkill' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeAbilitySkill' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeAbilities' } },
          { kind: 'Field', name: { kind: 'Name', value: 'unitType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'wounds' } },
          { kind: 'Field', name: { kind: 'Name', value: 'handicap' } },
          { kind: 'Field', name: { kind: 'Name', value: 'totalSpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'gunnerySpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'pilotingSpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeTokensSpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'edgeAbilitySpEarned' } },
          { kind: 'Field', name: { kind: 'Name', value: 'detachmentId' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<HirePilotMutation, HirePilotMutationVariables>
export const ImportAssetsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ImportAssets' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'commandId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'detachmentId' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'link' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'importCombatUnitsFromLink' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'commandId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'commandId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'detachmentId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'detachmentId' } },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'link' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'link' } },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'CombatUnitFields' } },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CombatUnitFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'CombatUnit' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'model' } },
          { kind: 'Field', name: { kind: 'Name', value: 'variant' } },
          { kind: 'Field', name: { kind: 'Name', value: 'techBase' } },
          { kind: 'Field', name: { kind: 'Name', value: 'tonnage' } },
          { kind: 'Field', name: { kind: 'Name', value: 'asSize' } },
          { kind: 'Field', name: { kind: 'Name', value: 'bv' } },
          { kind: 'Field', name: { kind: 'Name', value: 'pv' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } },
          { kind: 'Field', name: { kind: 'Name', value: 'detachmentId' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ImportAssetsMutation, ImportAssetsMutationVariables>
export const DeleteUnitDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteUnit' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'unitId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteUnit' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'unitId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'unitId' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteUnitMutation, DeleteUnitMutationVariables>
export const DeletePilotDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeletePilot' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'pilotId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deletePilot' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'pilotId' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'pilotId' } },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeletePilotMutation, DeletePilotMutationVariables>
