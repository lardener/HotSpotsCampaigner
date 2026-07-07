# Plan: Retire Legacy Frontend GraphQL and Domain Type Files

## Objective
Remove the last legacy frontend type surface built from handwritten GraphQL/domain files and migrate all remaining consumers to generated GraphQL types and typed Apollo operations.

## Background
The frontend currently still depends on two legacy type files:
- `frontend/src/types/global.d.ts`
- `frontend/src/types/graphql.d.ts`

These files were written before the GraphQL codegen migration. The new source of truth is the generated GraphQL type file at `frontend/src/types/generated.ts`, plus typed document definitions in `frontend/src/types/operations.ts`.

## Scope
- Replace remaining imports from `../types/global.d` and `../types/graphql.d` across frontend components, hooks, utilities, and tests.
- Prefer generated types from `frontend/src/types/generated.ts`.
- Prefer typed Apollo documents from `frontend/src/types/operations.ts` for query/mutation payload typing.
- Remove `global.d.ts` and `graphql.d.ts` once all consumers are migrated.

## Approach

### 1. Audit remaining legacy consumers
- Identify all frontend files importing from `../types/global.d`.
- Identify all frontend files importing from `../types/graphql.d`.
- Confirm which of those imports are still required vs. unused.

### 2. Replace legacy GraphQL response aliases
- For each consumer of `graphql.d.ts`:
  - Replace response alias types such as `MetadataDataFull`, `CampaignDetailsData`, `UnitDossierData`, `GetMyCommandsData`, `ManagedCampaignsData`, `ForceData`, `LedgerData`, `CreateInviteData`, `EstablishCommandData`, `UpdateUnitData`, `UpdatePilotData`, `DeleteUnitData`, etc.
  - Use generated query/mutation result types from `frontend/src/types/generated.ts`, or the corresponding request/response type aliases from `frontend/src/types/operations.ts`.
  - Prefer strongly typed document nodes with `TypedDocumentNode<...>` if the operation is already defined in `frontend/src/types/operations.ts`.

### 3. Replace legacy global domain types
- For each consumer of `global.d.ts`:
  - Replace domain types with generated GraphQL types where the shape is available in `generated.ts`.
  - If a type is a UI-only helper and not present in generated types, keep it in a minimal typed helper module and stop using the legacy barrel file.
  - Verify `operations.ts` can provide many shared shape aliases already, including:
    - `CampaignCreateInput`
    - `CommandUpdateInput`
    - `PilotUpdateInput`
    - `ProposedTrack`
    - `ResolvedStepValues`
    - `CampaignProposal`
    - `CampaignInvite`
    - `MercenaryCommand`
    - `Detachment`
    - `CombatUnit`
    - `Pilot`
    - `Campaign` / `CampaignDetail`

### 4. Remove legacy type files
- After all imports are migrated and the frontend compiles cleanly, remove:
  - `frontend/src/types/global.d.ts`
  - `frontend/src/types/graphql.d.ts`
- Keep the generated surfaced file `frontend/src/types/generated.ts` as the current type source.

## Validation
- Run the frontend TypeScript compiler and ensure no type errors remain:
  - `npm run build --prefix frontend`
- Execute frontend tests targeting affected components if available:
  - `npm run test -- --run --prefix frontend`
- Confirm no remaining legacy imports exist in `frontend/src/**/*.{ts,tsx}`.

## Success Criteria
- No frontend code imports `global.d.ts` or `graphql.d.ts`.
- TypeScript build passes.
- Existing GraphQL operations and Apollo hooks continue to type-check correctly.
- Legacy handwritten domain types are removed from the active frontend type surface.

---

## File-by-File Migration Checklist

### Type Mapping Reference
**Legacy types → Generated equivalents:**
| Legacy Type | Generated Type | Source |
|---|---|---|
| `CombatUnit` | `CombatUnit` | `generated.ts` |
| `Pilot` | `Pilot` | `generated.ts` |
| `Detachment` | `Detachment` | `generated.ts` |
| `MercenaryCommand` | `MercenaryCommand` | `generated.ts` |
| `Command` | `MercenaryCommand` | `generated.ts` |
| `CampaignDetail` | `Campaign` | `generated.ts` |
| `CampaignCreateInput` | `CampaignCreateInput` | `generated.ts` |
| `LedgerEntry` | `LedgerEntry` | `generated.ts` |
| `LedgerEntryInput` | `LedgerEntryInput` | `generated.ts` |
| `Contract` | `Contract` | `generated.ts` |
| `ProposedTrack` | `ProposedTrack` | `generated.ts` |
| `TrackDetail` | `CampaignTrack` | `generated.ts` |
| `CampaignInvite` | `CampaignInvite` | `generated.ts` |
| `CampaignFaction` | `CampaignFaction` | `generated.ts` |
| `Proposal` | `CampaignProposal` | `generated.ts` |
| `ActiveCampaignSummary` | `ActiveCampaignSummary` | `generated.ts` |
| `UserAccount` | `UserProfile` | `generated.ts` |
| `CombatUnitUpdateInput` | `CombatUnitUpdateInput` | `generated.ts` |
| `CommandUpdateInput` | `CommandUpdateInput` | `generated.ts` |

**UI-only types (not in generated.ts, need helper module):**
| Type | Usage |
|---|---|
| `NumericInput` | `<HTMLInputElement, number>` for form inputs |
| `UnitType` | Enum for mech/battle armor/vehicle |
| `TechBase` | Enum for clan/inner sphere |
| `UnitStatus` | Enum for operational/crippled/destroyed |
| `GQLResponse` | Helper for GQL response wrapping |
| `CampaignDetailSummary` | UI helper for campaign summary |
| `DetachmentAarState` | UI helper for AAR state |
| `ContractPreview` | UI helper for contract preview |
| `ResolvedStepValues` | UI helper for resolved steps |
| `RepairRulesInput` | UI helper for repair rules |
| `PublicCampaignMetadataMinimal` | UI helper for minimal metadata |
| `PublicCampaignMetadataWithRules` | UI helper for full metadata |
| `Profile` | UI helper for user profile |

**GraphQL response aliases → Generated equivalents:**
| Legacy Alias | Generated Type | Source |
|---|---|---|
| `ActiveCampaignsData` | `PublicActiveCampaignsQuery` | `generated.ts` |
| `PreviewData` | `PublicPreviewCampaignQuery` | `generated.ts` |
| `GenerateTracksData` | `GenerateTracksQuery` | `generated.ts` |
| `MetadataDataFull` | `PublicCampaignMetadataQuery` | `generated.ts` |
| `MetadataDataMinimal` | `PublicCampaignMetadataQuery` | `generated.ts` |
| `CampaignDetailsData` | `GetCampaignQuery` | `generated.ts` |
| `UserProfileData` | `UserProfileQuery` | `generated.ts` |
| `UnitDossierData` | `GetCommandQuery` | `generated.ts` |
| `GetMyCommandsData` | `MyCommandsQuery` | `generated.ts` |
| `ManagedCampaignsData` | `ManagedCampaignsQuery` | `generated.ts` |
| `ForceData` | `GetCommandQuery` | `generated.ts` |
| `LedgerData` | `GetCommandQuery` | `generated.ts` |
| `CreateCampaignData` | `CreateCampaignMutation` | `generated.ts` |
| `UpdateCampaignData` | `UpdateCampaignMutation` | `generated.ts` |
| `CreateDetachmentData` | `CreateDetachmentMutation` | `generated.ts` |
| `DeleteDetachmentData` | `DeleteDetachmentMutation` | `generated.ts` |
| `AssignDetachmentData` | `AssignDetachmentToCampaignMutation` | `generated.ts` |
| `JoinCampaignData` | `JoinCampaignMutation` | `generated.ts` |
| `UpdateTrackData` | `UpdateTrackMutation` | `generated.ts` |
| `RerollTrackData` | `RerollTrackMutation` | `generated.ts` |
| `ReorderTracksData` | `ReorderTracksMutation` | `generated.ts` |
| `EstablishCommandData` | `EstablishCommandMutation` | `generated.ts` |
| `UpdateCommandData` | `UpdateCommandMutation` | `generated.ts` |
| `DeleteCommandData` | `DeleteCommandMutation` | `generated.ts` |
| `AssignAssetData` | `AssignAssetMutation` | `generated.ts` |
| `AddUnitData` | `AddCombatUnitMutation` | `generated.ts` |
| `UpdateUnitData` | `UpdateUnitMutation` | `generated.ts` |
| `ImportAssetsData` | `ImportAssetsMutation` | `generated.ts` |
| `HirePilotData` | `HirePilotMutation` | `generated.ts` |
| `UpdatePilotData` | `UpdatePilotMutation` | `generated.ts` |
| `AddLedgerEntryData` | `AddLedgerEntryMutation` | `generated.ts` |
| `DeleteUnitData` | `DeleteUnitMutation` | `generated.ts` |
| `DeletePilotData` | `DeletePilotMutation` | `generated.ts` |
| `CreateInviteData` | `CreateInviteMutation` | `generated.ts` |
| `DeleteInviteData` | `DeleteInviteMutation` | `generated.ts` |
| `LoginWithTokenData` | `LoginWithTokenMutation` | `generated.ts` |
| `UpdateUserProfileData` | `UpdateUserProfileMutation` | `generated.ts` |

### Files to Migrate (36 unique files)
**Note:** Some files import from BOTH `global.d` and `graphql.d`. Process both imports in a single pass.

- [x] `App.tsx` (global.d: `UserAccount`, graphql.d: `UserProfileData`) ✓ MIGRATED
- [x] `ActiveCampaignsList.tsx` (graphql.d: `ActiveCampaignsData`) ✓ MIGRATED
- [x] `AfterActionReportEditor.tsx` (global.d: `CombatUnit, Pilot, DetachmentAarState, CampaignDetail, TrackDetail, NumericInput, UnitStatus, Detachment, Contract, MercenaryCommand`, graphql.d: `MetadataDataMinimal, AddLedgerEntryData, UpdateUnitData, UpdatePilotData, UpdateTrackData, DeleteUnitData`) ✓ MIGRATED
- [x] `CampaignGenerator.tsx` (global.d: `CampaignCreateInput, ContractPreview, ProposedTrack, Proposal, ResolvedStepValues`, graphql.d: `MetadataDataFull, PreviewData, GenerateTracksData, CreateCampaignData, UpdateCampaignData`) ✓ MIGRATED
- [x] `CampaignTheaterView.tsx` (global.d: multiple, graphql.d: `MetadataDataFull, CampaignDetailsData`) ✓ MIGRATED
- [x] `CombatUnitEditor.tsx` (global.d: `CombatUnit, CombatUnitUpdateInput, UnitType, UnitStatus, TechBase`, graphql.d: `MetadataDataFull`) ✓ MIGRATED
- [x] `CommandDashboard.tsx` (global.d: `CombatUnit, Pilot, Detachment, CommandUpdateInput`, graphql.d: `UnitDossierData`) ✓ MIGRATED
- [x] `CreateCommandForm.tsx` (global.d: `CommandUpdateInput`, graphql.d: `EstablishCommandData`) ✓ MIGRATED
- [x] `DetachmentReadinessSummary.tsx` (global.d: `CombatUnit, Pilot, UnitType`) ✓ MIGRATED
- [x] `EditableTrackCard.tsx` (global.d: `CampaignDetail, TrackDetail`, graphql.d: `MetadataDataFull`) ✓ MIGRATED
- [x] `ForceDashboard.tsx` (global.d: `CombatUnit, Pilot`, graphql.d: `ForceData`) ✓ MIGRATED
- [x] `LedgerDashboard.tsx` (graphql.d: `LedgerData`) ✓ MIGRATED
- [x] `LedgerEntryForm.tsx` (global.d: `NumericInput`) ✓ MIGRATED
- [x] `MainDashboard.tsx` (global.d: `Detachment, UserAccount`, graphql.d: `GetMyCommandsData, ManagedCampaignsData`) ✓ MIGRATED
- [x] `MercenaryRegistryView.tsx` (global.d: `MercenaryCommand`) ✓ MIGRATED
- [x] `MonthlyExpensesEditor.tsx` (global.d: `Detachment, CampaignDetailSummary, NumericInput`) ✓ MIGRATED
- [x] `MyDeploymentsList.tsx` (global.d: `MercenaryCommand`) ✓ MIGRATED
- [x] `NewCampaignView.tsx` (graphql.d: `UpdateCampaignData`) ✓ MIGRATED
- [x] `PilotEditor.tsx` (global.d: `Pilot, PilotUpdateInput`) ✓ MIGRATED
- [x] `PublicCampaignTheaterView.tsx` (graphql.d: `CampaignDetailsData`) ✓ MIGRATED
- [x] `RecruitmentOverlay.tsx` (graphql.d: `CreateInviteData`) ✓ MIGRATED
- [x] `useHscActionHandler.tsx` (graphql.d: `MetadataDataFull`, global.d: `CampaignDetail, MercenaryCommand, CombatUnit, Pilot, Detachment, UnitType, TechBase`) ✓ MIGRATED
- [x] `cache.ts` (global.d: `Command, Detachment, CampaignDetail`) ✓ MIGRATED
- [x] `contractUtils.ts` (global.d: `NumericInput`) ✓ MIGRATED
- [x] `financialUtils.ts` (global.d: `CombatUnit, CampaignDetail, DetachmentAarState, UnitStatus`) ✓ MIGRATED
- [x] `pilotCalculations.ts` (global.d: `Pilot`) ✓ MIGRATED
- [x] `pricingUtils.ts` (global.d: `CombatUnit, PublicCampaignMetadataWithRules`) ✓ MIGRATED
- [x] `Create `types/helpers.ts` for UI-only helper types ✓ MIGRATED
