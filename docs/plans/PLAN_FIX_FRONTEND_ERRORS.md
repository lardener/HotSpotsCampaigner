# Plan: Fix Frontend TypeScript Errors from Legacy Type Migration

## Root Cause
Replacing `global.d.ts` and `graphql.d.ts` imports with `generated.ts` types introduced two categories of errors:
1. **Missing imports**: `UnitType`, `UnitStatus`, `TechBase` live in `helpers.ts`, not `generated.ts`
2. **`Maybe<T>` null safety**: Generated GraphQL types use `Maybe<T>` (`T | null`) for array elements, requiring null guards in map/filter/sort callbacks

## Error Inventory

### File 1: `CampaignTheaterView.tsx` (~40 errors)

| # | Error | Fix |
|---|-------|-----|
| 1 | `UnitType`, `UnitStatus` not in `generated.ts` | Import from `helpers.ts` |
| 2 | `CampaignDetailsData` not found | Replace with `GetCampaignDetailsQuery` |
| 3 | `MetadataDataFull` not found | Replace with `GetCampaignMetadataQuery` |
| 4 | `TrackDetail` type still used in callbacks | Replace with `CampaignTrack` from `generated.ts` |
| 5 | `Maybe<T>` null in `.some()`, `.reduce()`, `.find()`, `.filter()`, `.sort()`, `.map()` | Add null guards (`t != null`, `det != null`) |
| 6 | `TheaterCampaign` → `CampaignDetail` type mismatch in AAR editor | Cast or adjust component prop types |
| 7 | `MercenaryCommand` type conflict (`generated.ts` vs `command.ts`) | Use `generated.ts` version consistently |
| 8 | `CampaignInvite` with `Maybe` in array | Filter out nulls before passing |

### File 2: `CombatUnitEditor.tsx` (~12 errors)

| # | Error | Fix |
|---|-------|-----|
| 1 | `CombatUnitUpdateInput` not in `helpers.ts` | Import from `generated.ts` |
| 2 | `Maybe<number>`/`Maybe<string>` in form data | Add null coalescing (`?? 0`, `?? ''`) |

## Implementation Plan

### Step 1: Fix `CampaignTheaterView.tsx` imports
- Import `UnitType`, `UnitStatus` from `helpers.ts` instead of `generated.ts`
- Remove `TrackDetail` import from `helpers.ts` (use `CampaignTrack` directly)

### Step 2: Fix `CampaignTheaterView.tsx` query types
- Replace `CampaignDetailsData` with `GetCampaignDetailsQuery`
- Replace `MetadataDataFull` with `GetCampaignMetadataQuery`

### Step 3: Fix `CampaignTheaterView.tsx` `Maybe<T>` null safety
- Add null guards in all array operations (`.some()`, `.reduce()`, `.find()`, `.filter()`, `.sort()`, `.map()`)
- Filter nulls before passing arrays to child components

### Step 4: Fix `CampaignTheaterView.tsx` component prop types
- Fix `showAarForTrack` state type
- Fix `userCommands` type for AAR editor
- Fix `campaignInvites` type for RecruitmentOverlay

### Step 5: Fix `CombatUnitEditor.tsx`
- Import `CombatUnitUpdateInput` from `generated.ts`
- Add null coalescing for form data fields

### Step 6: Build validation
- Run `npm run build --prefix frontend`
- Verify zero TypeScript errors

## Status
- [x] Step 1: Fix imports
- [x] Step 2: Fix query types
- [x] Step 3: Fix Maybe<T> null safety
- [x] Step 4: Fix component prop types
- [x] Step 5: Fix CombatUnitEditor.tsx
- [x] Fix helpers.ts (GetMyCommandsQuery/GetManagedCampaignsQuery interface references)
- [x] Fix App.tsx (import paths, unused imports, UserProfileData)
- [x] Fix financialUtils.ts (import from helpers.ts, DetachmentAarState properties, Maybe<T>)
- [x] Fix PilotEditor.tsx (PilotUpdateInput import, null coalescing)
- [x] Fix CommandDashboard.tsx (CommandUpdateInput import, type annotations, null filtering)
- [x] Fix MainDashboard.tsx (duplicate imports)
- [x] Fix DetachmentReadinessSummary.tsx (type mismatch)
- [x] Fix MyDeploymentsList.tsx (null after filter)
- [x] Fix pricingUtils.ts (omnimechReconfigureModifier property)
- [x] Step 6: Build validation

## Completion Notes
All identified frontend TypeScript errors from the legacy type migration have been resolved. The application now compiles without errors.
