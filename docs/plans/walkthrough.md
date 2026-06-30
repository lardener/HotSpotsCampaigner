# Walkthrough - Frontend Technical Debt Refactoring

This document summarizes the refactoring changes implemented to resolve the frontend technical debt and optimize types and client dependencies.

---

## 1. Summary of Changes

### 1.1 Unused Legacy Code Deletion
We removed the legacy REST services and testing files under `frontend/src/services` that are no longer in use, as the application now operates entirely on a GraphQL API via Apollo Client:
*   [apiClient.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/services/apiClient.ts) (DELETED)
*   [campaignApi.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/services/campaignApi.ts) (DELETED)
*   [campaignApi.test.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/services/campaignApi.test.ts) (DELETED)
*   [ledgerApi.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/services/ledgerApi.ts) (DELETED)
*   [ledgerApi.test.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/services/ledgerApi.test.ts) (DELETED)

We also updated [App.tsx](file:///d:/dev/HotSpotsCampaigner/frontend/src/App.tsx) to perform logout using a direct, native `fetch` command to Spring Security's `/api/logout` endpoint, eliminating any residual REST dependencies.

### 1.2 Monolithic Types Modularization
We split the monolithic 16KB type definition file [global.d.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/types/global.d.ts) into focused, domain-specific modules:
1. [common.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/types/common.ts): Shared UI inputs, entity helper typings, and type definitions.
2. [campaign.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/types/campaign.ts): Campaign configurations, metadata definitions, invites, and tracks.
3. [combatUnit.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/types/combatUnit.ts): Combat unit representations and variables (named `combatUnit.ts` per request).
4. [pilot.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/types/pilot.ts): Pilot stats, SP achievements, and variables.
5. [command.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/types/command.ts): Mercenary command attributes, detachments, and ledger listings.
6. [user.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/types/user.ts): User authentication profiles and credentials.

The main [global.d.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/types/global.d.ts) now acts as a barrel export file exporting all of these types, ensuring full backward-compatibility and zero breakages in components.

### 1.3 Financial Calculation Bug Fixes
During vitest verification, we identified and corrected two bugs in [financialUtils.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/util/financialUtils.ts):
1. **Missing `payRate` Multiplier**: In `calculateAwardFinancials`, we multiplied `payRate` back into the payment award calculation.
2. **Hardcoded Salvage Ratio**: In `calculateUnitFinancials`, we replaced the hardcoded `0.5` salvage value with the dynamic salvage ratio `pvSellUnitMultiplier / pvPurchaseUnitMultiplier` (defaulting to `0.5`).

---

## 2. Verification & Validation Results

### 2.1 Compilation Check
We ran the frontend production build using `npm run build`, which compiled all React components and TypeScript definitions with zero errors:
```
dist/index.html                   0.49 kB │ gzip:   0.31 kB
dist/assets/index-BZ35Arn-.css   17.23 kB │ gzip:   4.01 kB
dist/assets/index-BmCmrvZ3.js   902.04 kB │ gzip: 262.48 kB
✓ built in 4.15s
```

### 2.2 Unit Tests (Vitest)
We updated [App.test.tsx](file:///d:/dev/HotSpotsCampaigner/frontend/src/App.test.tsx) to subclass `ApolloClient` inside the test environment and mock the `query` method directly. We then ran the test suite, which completed successfully:
```
 Test Files  8 passed (8)
      Tests  27 passed (27)
   Start at  09:57:31
   Duration  1.45s (transform 578ms, setup 571ms, import 2.12s, tests 461ms, environment 3.78s)
```
All 27/27 tests passed.
