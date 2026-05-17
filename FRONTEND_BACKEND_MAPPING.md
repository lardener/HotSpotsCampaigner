# Frontend-Backend Mapping Documentation

## Overview
This document maps all frontend drop-down fields to their corresponding backend API endpoints and source JSON files in the `backend/src/main/resources/rules/` directory.

## Data Flow
```
JSON Rules Files → CampaignService (loads on @PostConstruct) → GraphQL Resolvers (Query/Mutation) → Frontend (Apollo Client Hooks)
```

---

## Frontend Drop-down Fields

### 1. RandomCampaignGenerator Component

#### Missions Drop-down
- **Frontend Field**: `missionType` select in contract sections
- **Frontend Component**: `RandomCampaignGenerator.tsx`, line ~265
- **Backend Endpoint**: `GET /api/campaigns/metadata/missions`
- **Source JSON**: `missionTable.json`
- **Data Format**: `{ primary: string[], opponent: string[] }`
- **Example**: `{ "primary": ["Raid", "Invasion"], "opponent": ["Garrison", "Cadre Duty"] }`
- **Service Function**: `campaignApi.getMissions()`
- **State Variable**: `missions`
- **Load Trigger**: Component mount (useEffect)
- **Error Handling**: Caught in try-catch; displays `metadataError` message

#### Track Types Drop-down
- **Frontend Field**: Track selection dropdowns in "THEATER OPERATIONAL TRACKS" section
- **Frontend Component**: `RandomCampaignGenerator.tsx`, line ~249
- **Backend Endpoint**: `GET /api/campaigns/metadata/track-types`
- **Source JSON**: `trackTable.json` (extracts `groups[].entries[].value` properties)
- **Data Format**: `string[]` (e.g., `["Ambush", "Battle", "Breakthrough", "Capture", "Convoy", ...]`)
- **Service Function**: `campaignApi.getTrackTypes()`
- **State Variable**: `trackTypes`
- **Load Trigger**: Component mount (useEffect)
- **Error Handling**: Caught in try-catch; displays `metadataError` message

#### Contract Steps Drop-downs (4 total)
- **Frontend Fields**: 
  - Pay Step selector (line ~267)
  - Salvage Step selector (line ~272)
  - Support Step selector (line ~277)
  - Transport Step selector (line ~282)
  - Command Step selector (line ~287) [5 actually]

- **Backend Endpoint**: `GET /api/campaigns/metadata/resolved-steps`
- **Source JSON**: `contractStepsTable.json`
- **Data Format**: 
  ```typescript
  Record<string, {
    payRate: string,
    salvageRights: string,
    supportRights: string,
    transportation: string,
    commandRights: string
  }>
  ```
  Example: `{ "1": { payRate: "100%", salvageRights: "None", ... }, "2": { ... }, ... }`

- **Service Function**: `campaignApi.getResolvedSteps()`
- **State Variable**: `resolvedSteps`
- **Load Trigger**: Component mount (useEffect)
- **Error Handling**: Caught in try-catch; displays `metadataError` message
- **Usage Pattern**: Each step selector shows keys (step numbers), and when user selects a step, the `updateContractByStep()` function looks up the corresponding values in `resolvedSteps` and updates the contract terms display

### 2. LedgerEntryForm Component

- **Endpoint**: `POST /api/ledger/{detachmentId}`
- **Process**: Submitting a transaction triggers `MercenaryCommandService.syncTotalSupportPoints()`, which aggregates all ledger entries for the parent command to update the force-wide SP total.

### 3. ActiveCampaigns Dashboard (App.tsx)

- **Endpoint**: `GET /api/campaigns/active`
- **Parameters**: `page`, `size` (Default: 5 per page)
- **Data Transformation**: The backend joins `Campaign` and `Contract` data to provide `ActiveCampaignSummary` objects.
- **Refresh Trigger**: The `onSaveSuccess` callback in the Generator triggers a dashboard reload.

---

## Frontend Drop-down Fields
... [Existing content] ...
### 4. Identity & Invitation System

- **Invite Token Generation**:
  - **Frontend Action**: Click "Generate Key" in Campaign View.
  - **Backend Endpoint**: `POST /api/campaigns/{campaignId}/invites`
  - **Source Table**: `campaign_invites`

- **Invite Login**:
  - **Frontend Action**: Submit token on Landing Page.
  - **Backend Endpoint**: `POST /api/auth/invite/login?token=XYZ`
  - **Logic**: Validates token -> Creates/Retrieves `User` with `ROLE_INVITED` -> Returns session token.

---

## Backend API Endpoints (All Available)

| Endpoint | Returns | Source JSON | Currently Used |
|----------|---------|-------------|-----------------|
| `GET /api/campaigns/metadata/missions` | `Map<String, List<String>>` | `missionTable.json` | ✅ Yes |
| `GET /api/campaigns/metadata/track-types` | `string[]` | `trackTable.json` | ✅ Yes |
| `GET /api/campaigns/metadata/resolved-steps` | `Record<int, Map<string, string>>` | `contractStepsTable.json` | ✅ Yes |
| `GET /api/campaigns/metadata/employer-types` | `string[]` | `employerTable.json` (distinct values) | ✅ Yes |
| `GET /api/campaigns/metadata/factions` | `string[]` | `factions.json` | ✅ Yes |
| `GET /api/campaigns/metadata/pay-rates` | `string[]` | `contractStepsTable.json` (distinct payRate values) | ❌ No |
| `GET /api/campaigns/metadata/salvage` | `string[]` | `contractStepsTable.json` (distinct salvageRights values) | ❌ No |
| `GET /api/campaigns/metadata/support` | `string[]` | `contractStepsTable.json` (distinct supportRights values) | ❌ No |
| `GET /api/campaigns/metadata/transport` | `string[]` | `contractStepsTable.json` (distinct transportation values) | ❌ No |
| `GET /api/campaigns/metadata/command` | `string[]` | `contractStepsTable.json` (distinct commandRights values) | ❌ No |
| `GET /api/campaigns/active` | `ActiveCampaignPage` | DB (Campaigns + Contracts) | ✅ Yes |
| `GET /api/campaigns/managed` | `ActiveCampaignSummary[]` | DB (Campaigns) | ✅ Yes |
| `GET /api/campaigns/participating/{commandId}` | `ActiveCampaignSummary[]` | DB (Campaigns via Detachments) | ✅ Yes |
| `POST /api/campaigns/{campaignId}/invites` | `CampaignInvite` | DB (campaign_invites) | 🆕 Planned |
| `POST /api/auth/invite/login` | `User` | DB (app_users) | 🆕 Planned |
| `GET /api/campaigns/dobless/preview` | `CampaignProposal` | Multiple tables | ✅ Yes (no drop-down, but preview) |
| `POST /api/campaigns/dobless` | `Campaign` | Multiple tables | ✅ Yes (save) |
| `GET /api/commands` | `MercenaryCommand[]` | DB (mercenary_commands) | ✅ Yes |
| `DELETE /api/commands/{commandId}` | void | DB (mercenary_commands) | ✅ Yes |
| `DELETE /api/commands/detachments/{detachmentId}` | void | DB (detachments) | ✅ Yes |
| `GET /api/commands/{commandId}/assets` | `CommandAssetsResponse` | DB (Units + Pilots) | ✅ Yes |
| `POST /api/commands/{commandId}/units` | `CombatUnit` | N/A | ✅ Yes |
| `POST /api/commands/{commandId}/pilots` | `Pilot` | N/A | ✅ Yes |
| `POST /api/ledger/{detachmentId}` | void | N/A | ✅ Yes (form submit) |
| `DELETE /api/detachments/{detachmentId}` | void | N/A | ✅ Yes |
| `GET /api/user/profile` | `Profile` | N/A | ✅ Yes (auth) |
| `POST /api/logout` | void | N/A | ✅ Yes (logout) |

---

## Service Layer Implementation

### campaignApi.ts
All campaign-related endpoints are wrapped in functions:
- `getMissions()` → calls endpoint, returns `string[]`
- `getTrackTypes()` → calls endpoint, returns `string[]`
- `getResolvedSteps()` → calls endpoint, returns `ResolvedSteps`
- `previewCampaign(params)` → calls GET with query params, returns `CampaignProposal`
- `saveCampaign(params)` → calls POST with query params, returns void
- `getProfile()` → calls endpoint, returns `Profile`
- `logout()` → calls endpoint, returns void

### ledgerApi.ts
- `createLedgerEntry(detachmentId, entry)` → POST to `/api/ledger/{detachmentId}`, returns void

### apiClient.ts
- Shared helper functions for building URLs and handling fetch responses
- Automatic `credentials: 'include'` for all requests
- Error handling: throws if response is not `ok`

---

## Frontend Component Integration

### RandomCampaignGenerator.tsx
1. **Component Mount** → `useEffect` calls `campaignApi.getMissions()`, `campaignApi.getTrackTypes()`, `campaignApi.getResolvedSteps()` in parallel
2. **State Management**:
   - `metadataLoading` — shows loading state during metadata fetch
   - `metadataError` — displays error banner if metadata fetch fails
   - `previewError` — displays error banner if preview fails
   - `saveError` — displays error banner if save fails
3. **User Actions**:
   - Click "GENERATE CONTRACT OFFERS" → calls `campaignApi.previewCampaign(getQueryParams())`
   - Select mission in drop-down → updates local state (data already loaded from backend)
   - Click "CONFIRM & SAVE CAMPAIGN" → calls `campaignApi.saveCampaign(getSaveParams())`

### App.tsx
1. **Component Mount** → `useEffect` calls `campaignApi.getProfile()`
2. **State Management**:
   - `authError` — displays if profile fetch fails
3. **User Actions**:
   - Click "Logout" → calls `campaignApi.logout()` then redirects

### LedgerEntryForm.tsx
1. **Form Submit** → calls `ledgerApi.createLedgerEntry(detachmentId, { description, amount })`
2. **State Management**:
   - `submissionError` — displays if ledger entry creation fails

---

## Data Validation

### Currently Validated
- ✅ All drop-down data arrives from backend (no hardcoded values in frontend)
- ✅ Drop-down options match what's available in respective JSON files
- ✅ Contract steps (1-9+) correspond to entries in `contractStepsTable.json`

### Not Yet Validated
- ❌ Actual API responses tested in integration environment
- ❌ Null/undefined value handling during live API calls

---

## Notes

### Current Scope (Per Requirements)
- Focused on existing drop-downs only (missions, track-types, resolved-steps)
- Not adding new drop-downs from unused endpoints (factions, employer-types, pay-rates, etc.)
- This keeps frontend functionality stable while improving code organization

### Future Considerations
1. **Caching**: Metadata endpoints could be called once at app start and cached in a Context/Redux store
2. **Missing Drop-downs**: If business logic requires factions or employer types in the UI, those endpoints are ready to be integrated
3. **Error Retry Logic**: Current error handling displays messages but does not offer retry buttons; could be added if needed
4. **Type Safety**: `ResolvedSteps` types are defined in `campaignApi.ts`; API responses are fully typed

---

## Testing Summary

### Unit Tests (campaignApi.test.ts, ledgerApi.test.ts)
- ✅ All endpoint functions mock fetch and verify correct URL + headers
- ✅ Error cases tested (network failures, invalid responses)
- ✅ Query parameter building tested

### Component Tests (RandomCampaignGenerator.test.tsx, LedgerEntryForm.test.tsx, App.test.tsx)
- ✅ Metadata loading and error display
- ✅ Form submission and error feedback
- ✅ Authentication flow

*Note: Tests are in place but `npm test` execution is pending due to terminal environment limitations.*
