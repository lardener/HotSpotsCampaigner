# Implementation Plan - Frontend Technical Debt Refactoring

This plan details the steps to address the frontend technical debt identified in the Program Evaluation Report:
1. Deleting legacy REST api files that are now completely unused.
2. Modularizing the massive monolithic `global.d.ts` type file into domain-specific modules while maintaining seamless backwards compatibility.

## Proposed Changes

### Domain Type Modularization

We will split [global.d.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/types/global.d.ts) (16KB, 540+ lines) into the following logical domain files:
1. [NEW] [common.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/types/common.ts): Core UI input types and metadata helper types (e.g. `NumericInput`, `UnitType`, `TechBase`, `UnitStatus`).
2. [NEW] [campaign.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/types/campaign.ts): Campaign configurations, metadata definitions, invites, and tracks.
3. [NEW] [combat.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/types/combat.ts): Combat unit representations and variables.
4. [NEW] [pilot.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/types/pilot.ts): Pilot stats, SP achievements, and variables.
5. [NEW] [command.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/types/command.ts): Mercenary command attributes, detachments, and ledger listings.
6. [NEW] [user.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/types/user.ts): User authentication profiles and credentials.

The original [global.d.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/types/global.d.ts) will be refactored to act as a barrel export file, re-exporting all types from the modular files. This guarantees that all components currently importing from `global.d` remain unchanged and fully functional without risk of broken references.

### Legacy Code Deletion

The entire REST service directory is no longer utilized since the application uses GraphQL via Apollo Client. We will delete:
1. [DELETE] [apiClient.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/services/apiClient.ts)
2. [DELETE] [campaignApi.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/services/campaignApi.ts)
3. [DELETE] [campaignApi.test.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/services/campaignApi.test.ts)
4. [DELETE] [ledgerApi.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/services/ledgerApi.ts)
5. [DELETE] [ledgerApi.test.ts](file:///d:/dev/HotSpotsCampaigner/frontend/src/services/ledgerApi.test.ts)

---

## Verification Plan

### Automated Tests
*   Run the TypeScript compiler build check to ensure all type mappings resolve correctly:
    ```powershell
    npm run build --prefix frontend
    ```
*   Run vitest unit tests to confirm the client logic passes without issue:
    ```powershell
    npm run test -- --run --prefix frontend
    ```
