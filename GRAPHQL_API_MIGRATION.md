# Plan: GraphQL API Migration

## Objective
Eliminate over-fetching in the `MainDashboard` by replacing `forceApi.ts` and `campaignApi.ts` with a unified GraphQL interface.

## Phase 1: Schema Definition
- [x] Create `src/main/resources/graphql/schema.graphqls`.
- [x] Define types for `MercenaryCommand`, `CombatUnit`, and `Campaign`.
- [x] Define queries: `getCommand(id)`, `myCommands`, `activeCampaigns`.
- [x] Define mutations: `establishCommand`, `addUnitToForce`.

## Phase 2: Backend Resolvers
- [x] Implement `@Controller` classes using Spring GraphQL annotations (`@QueryMapping`, `@SchemaMapping`).
- [x] Integrate with existing Reactive Services (returning `Mono` and `Flux`).

## Phase 3: Frontend Integration
- [x] Install `@apollo/client` and `graphql`.
- [x] Setup `ApolloProvider` in `App.tsx`.
- [x] Refactor `MainDashboard.tsx` to use `useQuery` hooks instead of `useEffect` with manual fetch calls.

## Phase 4: Real-time Subscriptions
- [x] Implement WebSocket support in Spring Security.
- [x] Add `Subscription` type for ledger updates (notifying players when SP changes).

## Phase 5: Tactical Command & Force Organization
- [x] Implement `commandAssets(commandId: ID!)` query to fetch units and pilots.
- [x] Implement mutations in `MercenaryCommandGraphQLController`:
    - [x] `assignAsset(assetType: String!, assetId: ID!, detachmentId: ID)`
    - [x] `addCombatUnit(commandId: ID!, input: CombatUnitInput!)`
    - [x] `hirePilot(commandId: ID!, input: PilotInput!)`
    - [x] `deleteDetachment(detachmentId: ID!)`
- [x] Refactor `ForceDashboard.tsx` to replace all `forceApi.ts` calls with Apollo hooks (`useQuery`, `useMutation`).

## Phase 6: Campaign Generation & Metadata Refactor
- [x] Complete `campaignMetadata` query to include all fields required by the generator (factions, employer types).
- [x] Refactor `RandomCampaignGenerator.tsx` to use `useQuery` for metadata and `useMutation` for campaign creation.
- [x] Replace the REST preview endpoint with the `previewCampaign` GraphQL query.

## Phase 7: Deprecation & REST Cleanup
- [x] Audit remaining REST endpoints in `CampaignController` and `MercenaryCommandService`.
- [x] Remove `CampaignController.java` and related REST DTOs.
- [x] Delete legacy frontend services: `forceApi.ts`, `campaignApi.ts`, and `apiClient.ts`.

## Success Criteria
- [x] `MainDashboard` fetches all required data (Command details + Active Campaigns) in a single request.
 - [x] Zero dependencies on `forceApi.ts` or `campaignApi.ts` in the frontend.
 - [x] REST controllers removed from backend, leaving GraphQL as the sole entry point.

## Phase 8: Invitation & User System Finalization
- [x] Migrate `loginWithToken` from `InviteController` to a GraphQL mutation (Identity-as-Invite flow).
- [x] Ensure `UserGraphQLController` parity with the legacy `UserController` for profile attributes.

## Phase 9: Final REST Controller Deletion
- [x] Delete `AssetController.java`.
- [x] Delete `DetachmentController.java`.
- [x] Delete `LedgerController.java`.
- [x] Delete `MercenaryCommandController.java`.
- [x] Delete `UserController.java`.
- [x] Delete `InviteController.java`.