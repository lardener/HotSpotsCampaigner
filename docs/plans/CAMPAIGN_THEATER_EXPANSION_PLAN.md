# Plan: Campaign Theater & Recruitment Expansion

## Objective
Transform the `CampaignTheaterView` into a full management console and implement an "Invite-as-Identity" flow that allows detachments to join campaigns via secure tokens.

## Phase 1: Data & Schema Enhancements
- [x] **Schema Update**: Add `description` to `Campaign` and `CampaignInput`.
- [x] **Mutation**: Implement `joinCampaign(token: String!, detachmentId: ID!)` in `schema.graphqls`.
- [x] **Persistence**: Update `MercenaryCommandService.java` to handle token validation and detachment assignment.

## Phase 2: Theater Management Console (`CampaignTheaterView`)
- [x] **Data Parity**: Ensure the view displays the same contract metadata as the `RandomCampaignGenerator` (Pay rates, Salvage, etc.).
- [x] **Location/Intel**: 
    - Add `systemName` input (Location).
    - Add a large `description` textarea for mission briefings/lore.
- [x] **Recruitment**: 
    - Integrate `createInvite` mutation to generate tokens.
    - Display active tokens for the manager to share.
- [x] **Detachment Management**: 
    - List all `participatingDetachments`.
    - Add "Remove" functionality to eject a detachment from the theater.

## Phase 3: Recruitment & Joining (`CommandDashboard`)
- [x] **Recruitment UI**: When a detachment is selected in "Detachment Mode" and is unassigned, show an input for an Invitation Token.
- [x] **Logic**: Call `joinCampaign` mutation upon token submission to link the detachment to the theater.

## Phase 4: Restricted Manager View
- [x] **Navigation**: Update `MainDashboard` tree logic. Clicking a detachment under "Managed Campaigns" opens the `CommandDashboard` with `isManagerView={true}`.
- [x] **UI Restrictions**:
    - [x] Disable/Hide top-level command stats (CO Name, Total SP, Reputation) in Manager View.
    - [x] Allow the Manager to create Ledger Entries for the detachment (Contract payments/penalties).
    - [x] Allow the Manager to adjust unit/pilot status (Damage/Injuries) but not delete assets.

## Phase 5: Navigation Tree Integration
- [x] **Hierarchy**: Ensure detachments appear nested under their respective Campaigns in the "Managed Campaigns" root.
- [x] **Routing**: Clicking these nodes must route specifically to the restricted dashboard view rather than the owner's full registry view.

## Success Criteria
- [x] Campaign Managers can issue invites that allow new users to join the system.
- [x] Players can join managed theaters using tokens.
- [x] Managers can audit and update the dossiers of detachments under their contract without gaining control over the player's entire Mercenary Command.