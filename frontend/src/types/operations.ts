import { gql } from '@apollo/client';

/**
 * Shared GraphQL Operations
 * 
 * Central repository for all Query and Mutation strings used across 
 * the frontend. This reduces duplication and ensures consistent 
 * data structures between services and components.
 */

// ==================== Fragments ====================

export const FRAGMENT_COMBAT_UNIT = gql`
  fragment CombatUnitFields on CombatUnit {
    id
    type
    model
    variant
    techBase
    tonnage
    asSize
    bv
    pv
    status
    detachmentId
  }
`;

export const FRAGMENT_PILOT = gql`
  fragment PilotFields on Pilot {
    id
    name
    gunnery
    piloting
    asSkill
    edgeTokensSkill
    edgeAbilitySkill
    edgeAbilities
    unitType
    wounds
    handicap
    totalSpEarned
    gunnerySpEarned
    pilotingSpEarned
    edgeTokensSpEarned
    edgeAbilitySpEarned
    detachmentId
  }
`;

export const FRAGMENT_CONTRACT = gql`
  fragment ContractFields on Contract {
    id
    employerCategory
    missionType
    primaryContract
    payRate
    payStep
    salvageTerms
    salvageStep
    supportTerms
    supportStep
    transportTerms
    transportStep
    commandRights
    commandStep
    trackCount
  }
`;

export const FRAGMENT_TRACK = gql`
  fragment TrackFields on CampaignTrack {
    id
    trackName
    sequenceOrder
    location
    nextSession
    attackerFactionId
    monthIndex
    complications
    afterActionNarrative
    oppositionComplications
  }
`;

export const FRAGMENT_COMMAND = gql`
  fragment CommandFields on MercenaryCommand {
    id
    name
    commandingOfficer
    totalSupportPoints
    reputation
  }
`;

export const FRAGMENT_DETACHMENT = gql`
  fragment DetachmentFields on Detachment {
    id
    name
    mercenaryCommandId
    mercenaryCommandName
    campaignId
    campaignName
    campaignRating
  }
`;

export const FRAGMENT_LEDGER_ENTRY = gql`
  fragment LedgerEntryFields on LedgerEntry {
    id
    timestamp
    detachmentId
    description
    amount
    reputationChange
    campaignName
    monthIndex
  }
`;

// ==================== User & Auth ====================

export const GET_USER_PROFILE = gql`
  query GetUserProfile {
    userProfile {
      id
      name
      email
      displayName
      role
    }
  }
`;

export const LOGIN_WITH_TOKEN = gql`
  mutation LoginWithToken($token: String!) {
    loginWithToken(token: $token)
  }
`;

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($displayName: String!) {
    updateUserProfile(displayName: $displayName) {
      id
      displayName
      role
    }
  }
`;

// ==================== Campaign Operations ====================

export const GET_ACTIVE_CAMPAIGNS = gql`
  query GetActiveCampaigns($page: Int, $size: Int) {
    publicActiveCampaigns(page: $page, size: $size) {
      id
      name
      systemName
      status
      trackCount
      primaryEmployer
      secondaryEmployer
      participatingDetachments {
        ...DetachmentFields
      }
    }
  }
  ${FRAGMENT_DETACHMENT}
`;

export const GET_METADATA = gql`
  query GetCampaignMetadata {
    publicCampaignMetadata {
      missions {
        primary
        opponent
      }
      trackTypes
      factions
      employerTypes
      unitStatuses
      unitTypes
      techBases
      resolvedSteps {
        step
        values {
          payRate
          salvageRights
          supportRights
          transportation
          commandRights
        }
      }
      armorMultiplier
      internalMultiplier
      crippledMultiplier
      destroyedMultiplier
      nonMechModifier
      mixedTechModifier
      clanTechModifier
      omnimechReconfigureModifier
      purchaseUnitMultiplier
      sellUnitMultiplier
      rearmCostPerTon
      rearmCostPerTonAlphaStrike
      hireMechWarriorCost
      hireNamedPilotCost
      hireBattleArmorCost
      healMechWarriorPerWoundBoxCost
      healMechWarriorPerMonthCost
      healBattleArmorCost
      trainFormationCommanderCost
      changeFormationTrainingCost
      learnFirstAbilityCost
      learnSecondAbilityCost
      learnThirdAbilityCost
      replaceAbilityCost
    }
  }
`;

export const PREVIEW_CAMPAIGN_RAW = `
  query PreviewCampaign($input: CampaignCreateInput!) {
    publicPreviewCampaign(input: $input) {
      campaign {
        name
        systemName
        trackCount
        lengthInMonths
        monthlyPay
        monthlyMaintenance
        transportationCost
        combatPay
      }
      armorMultiplier
      internalMultiplier
      crippledMultiplier
      destroyedMultiplier
      nonMechModifier
      mixedTechModifier
      clanTechModifier
      omnimechReconfigureModifier
      purchaseUnitMultiplier
      sellUnitMultiplier
      rearmCostPerTon
      rearmCostPerTonAlphaStrike
      hireMechWarriorCost
      hireNamedPilotCost
      hireBattleArmorCost
      healMechWarriorPerWoundBoxCost
      healMechWarriorPerMonthCost
      healBattleArmorCost
      trainFormationCommanderCost
      changeFormationTrainingCost
      learnFirstAbilityCost
      learnSecondAbilityCost
      learnThirdAbilityCost
      replaceAbilityCost
      contracts {
        employerCategory
        missionType
        primaryContract
        payRate
        payStep
        salvageTerms
        salvageStep
        supportTerms
        supportStep
        transportTerms
        transportStep
        commandRights
        commandStep
        trackCount
      }
      tracks {
        name
        complication
        oppositionComplication
      }
    }
  }
`;

export const PREVIEW_CAMPAIGN = gql(PREVIEW_CAMPAIGN_RAW);

export const GENERATE_TRACKS = gql`
  query GenerateTracks($mission: String!, $commandRights: String!, $oppCommandRights: String!, $count: Int!, $existing: [ProposedTrackInput]) {
    generateTracks(mission: $mission, commandRights: $commandRights, oppCommandRights: $oppCommandRights, count: $count, existing: $existing) {
      name
      complication
      oppositionComplication
    }
  }
`;

export const CREATE_CAMPAIGN = gql`
  mutation CreateCampaign($input: CampaignCreateInput!) {
    createCampaign(input: $input) {
      id
      name
      systemName
      description
      lengthInMonths
      trackCount
      monthlyPay
      monthlyMaintenance
      transportationCost
      combatPay
      status
      payRate
      payStep
      salvageTerms
      salvageStep
      supportTerms
      supportStep
      transportTerms
      transportStep
      commandRights
      commandStep
      armorMultiplier
      internalMultiplier
      crippledMultiplier
      destroyedMultiplier
      nonMechModifier
      mixedTechModifier
      clanTechModifier
      omnimechReconfigureModifier
      purchaseUnitMultiplier
      sellUnitMultiplier
      rearmCostPerTon
      rearmCostPerTonAlphaStrike
      hireMechWarriorCost
      hireNamedPilotCost
      hireBattleArmorCost
      healMechWarriorPerWoundBoxCost
      healMechWarriorPerMonthCost
      healBattleArmorCost
      trainFormationCommanderCost
      changeFormationTrainingCost
      learnFirstAbilityCost
      learnSecondAbilityCost
      learnThirdAbilityCost
      replaceAbilityCost
    }
  }
`;

export const UPDATE_CAMPAIGN = gql`
  mutation UpdateCampaign($id: ID!, $input: CampaignUpdateInput!) {
    updateCampaign(id: $id, input: $input) {
      id
      name
      systemName
      description
      lengthInMonths
      trackCount
      monthlyPay
      monthlyMaintenance
      transportationCost
      combatPay
      status
      payRate
      payStep
      salvageTerms
      salvageStep
      supportTerms
      supportStep
      transportTerms
      transportStep
      commandRights
      commandStep
      armorMultiplier
      internalMultiplier
      crippledMultiplier
      destroyedMultiplier
      nonMechModifier
      mixedTechModifier
      clanTechModifier
      omnimechReconfigureModifier
      purchaseUnitMultiplier
      sellUnitMultiplier
      rearmCostPerTon
      rearmCostPerTonAlphaStrike
      hireMechWarriorCost
      hireNamedPilotCost
      hireBattleArmorCost
      healMechWarriorPerWoundBoxCost
      healMechWarriorPerMonthCost
      healBattleArmorCost
      trainFormationCommanderCost
      changeFormationTrainingCost
      learnFirstAbilityCost
      learnSecondAbilityCost
      learnThirdAbilityCost
      replaceAbilityCost
    }
  }
`;

export const GET_MANAGED_CAMPAIGNS = gql`
  query GetManagedCampaigns($status: String) {
    managedCampaigns(status: $status) {
      id
      name
      systemName
      description
      status
      trackCount
      primaryEmployer
      secondaryEmployer
      payRate
      salvageTerms
      supportTerms
      transportTerms
      commandRights
      payStep
      salvageStep
      supportStep
      transportStep
      commandStep
      armorMultiplier
      internalMultiplier
      crippledMultiplier
      destroyedMultiplier
      nonMechModifier
      mixedTechModifier
      clanTechModifier
      omnimechReconfigureModifier
      purchaseUnitMultiplier
      sellUnitMultiplier
      rearmCostPerTon
      rearmCostPerTonAlphaStrike
      hireMechWarriorCost
      hireNamedPilotCost
      hireBattleArmorCost
      healMechWarriorPerWoundBoxCost
      healMechWarriorPerMonthCost
      healBattleArmorCost
      trainFormationCommanderCost
      changeFormationTrainingCost
      learnFirstAbilityCost
      learnSecondAbilityCost
      learnThirdAbilityCost
      replaceAbilityCost
      contracts {
        ...ContractFields
      }
      factions {
        id
        factionName
      }
      tracks {
        ...TrackFields
      }
      participatingDetachments {
        ...DetachmentFields
      }
    }
  }
  ${FRAGMENT_CONTRACT}
  ${FRAGMENT_TRACK}
  ${FRAGMENT_DETACHMENT}
`;

export const CREATE_DETACHMENT = gql`
  mutation CreateDetachment($commandId: ID!, $campaignId: ID, $name: String!) {
    createDetachment(commandId: $commandId, campaignId: $campaignId, name: $name) {
      ...DetachmentFields
    }
  }
  ${FRAGMENT_DETACHMENT}
`;

export const DELETE_DETACHMENT = gql`
  mutation DeleteDetachment($detachmentId: ID!) {
    deleteDetachment(detachmentId: $detachmentId)
  }
`;

export const ASSIGN_DETACHMENT = gql`
  mutation AssignDetachmentToCampaign($detachmentId: ID!, $campaignId: ID) {
    assignDetachmentToCampaign(detachmentId: $detachmentId, campaignId: $campaignId)
  }
`;

export const JOIN_CAMPAIGN = gql`
  mutation JoinCampaign($token: String!, $detachmentId: ID!) {
    joinCampaign(token: $token, detachmentId: $detachmentId)
  }
`;

export const GET_CAMPAIGN_DETAILS = gql`
  query GetCampaignDetails($campaignId: ID!) {
    getCampaign(id: $campaignId) {
      id
      name
      systemName
      description
      lengthInMonths
      trackCount
      status
      primaryEmployer
      secondaryEmployer
      monthlyPay
      monthlyMaintenance
      transportationCost
      combatPay
      payRate
      payStep
      salvageTerms
      salvageStep
      supportTerms
      supportStep
      transportTerms
      transportStep
      commandRights
      commandStep
      armorMultiplier
      internalMultiplier
      crippledMultiplier
      destroyedMultiplier
      nonMechModifier
      mixedTechModifier
      clanTechModifier
      omnimechReconfigureModifier
      purchaseUnitMultiplier
      sellUnitMultiplier
      rearmCostPerTon
      rearmCostPerTonAlphaStrike
      hireMechWarriorCost
      hireNamedPilotCost
      hireBattleArmorCost
      healMechWarriorPerWoundBoxCost
      healMechWarriorPerMonthCost
      healBattleArmorCost
      trainFormationCommanderCost
      changeFormationTrainingCost
      learnFirstAbilityCost
      learnSecondAbilityCost
      learnThirdAbilityCost
      replaceAbilityCost
      factions {
        id
        factionName
      }
      tracks {
        ...TrackFields
      }
      participatingDetachments {
        ...DetachmentFields
        units {
          ...CombatUnitFields
        }
        pilots {
          ...PilotFields
        }
      }
      campaignInvites {
        id
        token
        recipientName
        expiresAt
        used
      }
    }
  }
  ${FRAGMENT_TRACK}
  ${FRAGMENT_COMBAT_UNIT}
  ${FRAGMENT_PILOT}
  ${FRAGMENT_DETACHMENT}
`;

export const UPDATE_TRACK = gql`
  mutation UpdateTrack($id: ID!, $input: TrackUpdateInput!) {
    updateTrack(id: $id, input: $input) {
      id
      trackName
      location
      nextSession
      attackerFactionId
      monthIndex
      complications
      afterActionNarrative
      oppositionComplications
    }
  }
`;

export const REROLL_TRACK = gql`
  mutation RerollTrack($id: ID!) {
    rerollTrack(id: $id) {
      id
      trackName
      complications
      oppositionComplications
    }
  }
`;

export const REORDER_TRACKS = gql`
  mutation ReorderTracks($campaignId: ID!, $trackIds: [ID!]!) {
    reorderTracks(campaignId: $campaignId, trackIds: $trackIds) {
      id
      sequenceOrder
      trackName
      location
      nextSession
      attackerFactionId
      monthIndex
      complications
      afterActionNarrative
      oppositionComplications
    }
  }
`;

export const CREATE_INVITE = gql`
  mutation CreateInvite($campaignId: ID!, $recipientName: String) {
    createInvite(campaignId: $campaignId, recipientName: $recipientName) {
      token
      recipientName
    }
  }
`;

export const DELETE_INVITE = gql`
  mutation DeleteInvite($id: ID!) {
    deleteInvite(id: $id)
  }
`;

// ==================== Command & Force Management ====================

export const GET_MY_COMMANDS = gql`
  query GetMyCommands {
    myCommands {
      ...CommandFields
      detachments {
        ...DetachmentFields
      }
    }
  }
  ${FRAGMENT_COMMAND}
  ${FRAGMENT_DETACHMENT}
`;

export const GET_UNIT_DOSSIER = gql`
  query GetUnitDossier($commandId: ID!) {
    getCommand(id: $commandId) {
      ...CommandFields
      units {
        ...CombatUnitFields
      }
      pilots {
        ...PilotFields
      }
      detachments {
        ...DetachmentFields
      }
      allLedgerEntries {
        ...LedgerEntryFields
      }
    }
    managedCampaigns(status: "ACTIVE") {
      id
      name
    }
    publicCampaignMetadata {
      unitStatuses
      unitTypes
      techBases
      armorMultiplier
      internalMultiplier
      crippledMultiplier
      destroyedMultiplier
      nonMechModifier
      mixedTechModifier
      clanTechModifier
      omnimechReconfigureModifier
      purchaseUnitMultiplier
      sellUnitMultiplier
      rearmCostPerTon
      rearmCostPerTonAlphaStrike
      hireMechWarriorCost
      hireNamedPilotCost
      hireBattleArmorCost
      healMechWarriorPerWoundBoxCost
      healMechWarriorPerMonthCost
      healBattleArmorCost
      trainFormationCommanderCost
      changeFormationTrainingCost
      learnFirstAbilityCost
      learnSecondAbilityCost
      learnThirdAbilityCost
      replaceAbilityCost
    }
  }
  ${FRAGMENT_COMMAND}
  ${FRAGMENT_COMBAT_UNIT}
  ${FRAGMENT_PILOT}
  ${FRAGMENT_LEDGER_ENTRY}
  ${FRAGMENT_DETACHMENT}
`;

export const ESTABLISH_COMMAND = gql`
  mutation EstablishCommand($input: CommandUpdateInput!) {
    establishCommand(input: $input) {
      ...CommandFields
    }
  }
  ${FRAGMENT_COMMAND}
`;

export const UPDATE_COMMAND = gql`
  mutation UpdateCommand($id: ID!, $input: CommandUpdateInput!) {
    updateCommand(id: $id, input: $input) {
      ...CommandFields
    }
  }
  ${FRAGMENT_COMMAND}
`;

export const DELETE_COMMAND = gql`
  mutation DeleteCommand($commandId: ID!, $force: Boolean) {
    deleteCommand(commandId: $commandId, force: $force)
  }
`;

export const ASSIGN_ASSET = gql`
  mutation AssignAsset($assetType: String!, $assetId: ID!, $detachmentId: ID) {
    assignAsset(assetType: $assetType, assetId: $assetId, detachmentId: $detachmentId)
  }
`;

export const GET_FORCE_DATA = gql`
  query GetForceData($commandId: ID!) {
    getCommand(id: $commandId) {
      ...CommandFields
      units {
        id
        model
        tonnage
        status
        detachmentId
      }
      pilots {
        ...PilotFields
      }
      detachments {
        ...DetachmentFields
      }
    }
    managedCampaigns(status: "ACTIVE") {
      id
      name
      systemName
      trackCount
      participatingDetachments {
        ...DetachmentFields
      }
    }
    participatingCampaigns(commandId: $commandId) {
      id
      name
      primaryEmployer
      participatingDetachments {
        ...DetachmentFields
      }
    }
    publicCampaignMetadata {
      unitStatuses
      unitTypes
      techBases
      armorMultiplier
      internalMultiplier
      crippledMultiplier
      destroyedMultiplier
      nonMechModifier
      mixedTechModifier
      clanTechModifier
      omnimechReconfigureModifier
      pvPurchaseUnitMultiplier
      pvSellUnitMultiplier
      rearmCostPerTon
      rearmCostPerTonAlphaStrike
      hireMechWarriorCost
      hireNamedPilotCost
      hireBattleArmorCost
      healMechWarriorPerWoundBoxCost
      healMechWarriorPerMonthLimit
      healBattleArmorCost
      trainFormationCommanderCost
      changeFormationTrainingCost
      learnCommandAbility1Cost
      learnCommandAbility2Cost
      learnCommandAbility3Cost
      replaceCommandAbilityCost
    }
  }
  ${FRAGMENT_COMMAND}
  ${FRAGMENT_PILOT}
  ${FRAGMENT_DETACHMENT}
`;

// ==================== Ledger Operations ====================

export const ADD_LEDGER_ENTRY = gql`
  mutation AddLedgerEntry($commandId: ID!, $detachmentId: ID, $input: LedgerEntryInput!) {
    addLedgerEntry(commandId: $commandId, detachmentId: $detachmentId, input: $input) {
      id
    }
  }
`;

export const GET_LEDGER_DATA = gql`
  query GetLedgerData($commandId: ID!) {
    getCommand(id: $commandId) {
      id
      name
      totalSupportPoints
      detachments {
        id
        name
        campaignId
        campaignName
      }
    }
  }
`;

export const UPDATE_UNIT = gql`
  mutation UpdateUnit($id: ID!, $input: CombatUnitUpdateInput!) {
    updateCombatUnit(id: $id, input: $input) {
      ...CombatUnitFields
    }
  }
  ${FRAGMENT_COMBAT_UNIT}
`;

export const UPDATE_PILOT = gql`
  mutation UpdatePilot($id: ID!, $input: PilotUpdateInput!) {
    updatePilot(id: $id, input: $input) {
      ...PilotFields
    }
  }
  ${FRAGMENT_PILOT}
`;

export const ADD_COMBAT_UNIT = gql`
  mutation AddCombatUnit($commandId: ID!, $input: CombatUnitUpdateInput!) {
    addCombatUnit(commandId: $commandId, input: $input) {
      ...CombatUnitFields
    }
  }
  ${FRAGMENT_COMBAT_UNIT}
`;

export const HIRE_PILOT = gql`
  mutation HirePilot($commandId: ID!, $input: PilotUpdateInput!) {
    hirePilot(commandId: $commandId, input: $input) {
      ...PilotFields
    }
  }
  ${FRAGMENT_PILOT}
`;

export const IMPORT_ASSETS = gql`
  mutation ImportAssets($commandId: ID!, $detachmentId: ID, $link: String!) {
    importCombatUnitsFromLink(commandId: $commandId, detachmentId: $detachmentId, link: $link) {
      ...CombatUnitFields
    }
  }
  ${FRAGMENT_COMBAT_UNIT}
`;

export const DELETE_UNIT = gql`
  mutation DeleteUnit($unitId: ID!) {
    deleteUnit(unitId: $unitId)
  }
`;

export const DELETE_PILOT = gql`
  mutation DeletePilot($pilotId: ID!) {
    deletePilot(pilotId: $pilotId)
  }
`;