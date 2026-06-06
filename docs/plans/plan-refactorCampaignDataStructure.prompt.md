# Refactoring Plan: Eliminate RepairRules and ActivityCosts DTOs

**Goal:** Simplify the data model by eliminating the intermediate Data Transfer Objects (`RepairRules` and `ActivityCosts`) and migrating all their fields directly into the core `Campaign` entity. This will streamline data access across the backend, API (GraphQL), and frontend.

## 🎯 Scope of Change
*   **Target DTOs for Removal:** `RepairRules`, `ActivityCosts`.
*   **Target Entity for Modification:** `Campaign` (in Java).
*   **Affected Layers:** Backend Services (Java), GraphQL Schema, Frontend Components (TypeScript/React).

## 🗺️ Detailed Refactoring Steps

### Step 1: Backend Entity Update (Java)
*   **File:** `backend/src/main/java/com/hotspotscamp/entity/Campaign.java`
*   **Action:** Add all relevant fields from `RepairRules` and `ActivityCosts` directly as members of the `Campaign` class. Ensure proper type handling (e.g., using primitives or appropriate wrapper types).

### Step 2: DTO Removal & Cleanup
*   **Files:** All files defining or importing `RepairRules` and `ActivityCosts`.
*   **Action:** Remove the definitions for these two DTOs entirely from the codebase. Update all imports to reflect the removal.

### Step 3: GraphQL Schema Update (API Layer)
*   **File:** `schema.graphqls`
    1.  There are two `schema.graphqls` files.  Update them both to match.
*   **Action:**
    1.  Remove the type definitions for `RepairRules` and `ActivityCosts`.
    2.  Flatten their attributes into the main `Campaign` type definition, making them direct fields of `Campaign`.

### Step 4: Backend Service Refactoring (Java)
*   **Files:** `MercenaryCommandService.java`, `CampaignGenerationService.java`, etc.
*   **Action:**
    1.  Update method signatures and logic to stop accepting or constructing the removed DTOs.
    2.  Replace all instances of accessing nested DTO fields (e.g., `campaign.getRepairRules().getArmorMultiplier()`) with direct field access on the `Campaign` object (e.g., `campaign.getArmorMultiplier()`).

### Step 5: Frontend Adaptation (TypeScript/React)
*   **Files:** `frontend/src/components/` and `frontend/src/types/`.
*   **Action:** Update data fetching and component rendering logic to consume the flattened structure from the GraphQL API, removing any reliance on the old nested DTO shapes. **Specific Usage Found:** Component `CampaignTheaterView.tsx` uses nested types (lines 15, 16, 89, 90). GraphQL fragments in `frontend/src/types/operations.ts` fetch these fields (lines 228-229), which must be updated to query flattened Campaign fields directly.

## ✅ Verification Criteria
1.  All usages of `RepairRules` and `ActivityCosts` are removed or replaced by direct field access on `Campaign`.
2.  The `schema.graphqls` accurately reflects the flattened structure.
3.  Backend services compile and execute successfully with the new data model.
4.  Frontend components render correctly using the updated API response shape.