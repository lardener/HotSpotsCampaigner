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

## Success Criteria
- [x] `MainDashboard` fetches all required data (Command details + Active Campaigns) in a single request.