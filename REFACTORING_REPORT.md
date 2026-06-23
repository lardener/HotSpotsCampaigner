# Refactoring Report: HotSpotsCampaigner

## 1. Executive Summary
The `HotSpotsCampaigner` codebase is a modern, reactive application utilizing a high-performance tech stack (Java 25/Spring Boot 3.5.14 and React 19). The backend uses **Spring Data R2DBC** for relational persistence (NOT event sourcing) with a GraphQL API layer. While the architecture is robust, several "God Object" anti-patterns, DTO placement violations, and inconsistencies in data handling have been identified across **100% of the backend codebase** (13 entities, 13 repositories, 8 services, 5 controllers, 6 DTOs fully analyzed). Refactoring these areas will significantly improve maintainability, testability, and developer velocity.

## 2. Backend Analysis

### 2.0 Architecture Overview
- **Persistence**: Spring Data R2DBC (relational, NOT event sourcing)
- **API Layer**: GraphQL controllers with `@SchemaMapping` for field resolution
- **Reactive Stack**: Project Reactor (Mono/Flux) throughout
- **Package Structure**: `com.hotspotscamp` with subpackages: `api/`, `config/`, `dto/`, `entity/`, `repository/`, `service/`, `util/`
- **Analysis Coverage**: **100% backend analyzed** - all 13 entities, 13 repositories, 8 services, 5 controllers, 6 DTOs

### 2.1 Entity Layer: 100% Pattern Consistency ✅
- **Observation**: All 13 entities follow an identical, consistent pattern:
  - All implement `Persistable<UUID>` with `@Table` annotation
  - All use identical Lombok structure: `@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`
  - All have `@Transient @Builder.Default @JsonIgnore private boolean isNew = true`
  - All override `isNew()` with `return isNew || id == null`
  - All have `setNew(boolean)` method
- **Entities**: `Campaign` (40+ fields), `CampaignFaction` (5), `CampaignInvite` (6), `CampaignTrack` (variable), `CombatUnit` (12), `Contract` (variable), `ContractAssignment` (4), `Detachment` (5), `FactionReputation` (5), `LedgerEntry` (10), `MercenaryCommand` (variable), `Pilot` (18), `User` (5)
- **Assessment**: **Excellent consistency**. No refactoring needed at entity layer.

### 2.2 Repository Layer: Consistent with Minor Inconsistencies
- **Observation**: All 13 repositories extend `ReactiveCrudRepository<Entity, UUID>` with Spring Data method naming conventions
- **Repositories**: `CampaignRepository` (1 query), `CampaignFactionRepository` (2), `CampaignInviteRepository` (2), `CampaignTrackRepository` (2), `CombatUnitRepository` (2), `ContractRepository` (2), `ContractAssignmentRepository` (3), `DetachmentRepository` (3), `FactionReputationRepository` (2), `LedgerEntryRepository` (2), `MercenaryCommandRepository` (1), `PilotRepository` (2), `UserRepository` (1)
- **Inconsistency**: `@Repository` annotation is **inconsistent** - some repositories have it (`CampaignInviteRepository`, `ContractAssignmentRepository`, `DetachmentRepository`, `FactionReputationRepository`, `LedgerEntryRepository`, `UserRepository`), others don't (`CombatUnitRepository`, `MercenaryCommandRepository`, `PilotRepository`)
- **Recommendation**: Standardize `@Repository` annotation usage across all repositories (either all have it or none, depending on whether Spring Data auto-detection is sufficient)

### 2.3 Controller Layer: Anti-Patterns and DTO Violations
- **Observation**: `CampaignGraphQLController.java` has **11 dependencies** and directly injects repositories, bypassing the service layer for field resolvers via `@SchemaMapping`
- **Observation**: `UserGraphQLController.java` contains an inline `UserProfile` record definition (should be in `dto/` package)
- **Observation**: `CommandGraphQLController.java` and `InviteGraphQLController.java` are clean with proper service delegation
- **Impact**: Controller layer violates separation of concerns when bypassing services. DTO placement violations scatter domain data across layers.
- **Recommendation**: 
    - Remove direct repository injection from controllers - all data access should go through services
    - Move `UserProfile` record to `dto/` package
    - Implement consistent error handling via AOP or base controller patterns

### 2.4 Service Layer: Critical "God Service" Anti-Patterns
- **Observation**: `CampaignService.java` has **11 dependencies** (repositories + services). Contains `getCampaignMetadata()` with **30+ arguments** and `generateDoblessCampaign()` as a massive monolithic reactive chain
- **Observation**: `MercenaryCommandService.java` has **14 dependencies** and contains **5 DTO record definitions** inline (DTO placement violation)
- **Observation**: `RuleConfigurationService.java` contains **25+ DTO record definitions** inline (massive DTO violation) and loads 15+ JSON config files via `@PostConstruct`
- **Observation**: `CommandAssetsResponse.java` is a DTO **misplaced in the service package** (should be in `dto/`)
- **Impact**: Extremely difficult to unit test, high cognitive load, DTO violations break package boundaries
- **Recommendation**:
    - **Service Decomposition**: Break `CampaignService` into `CampaignLifecycleService`, `CampaignMetadataService`, `CampaignQueryService`
    - **DTO Relocation**: Move ALL inline DTO records to `dto/` package (30+ records across MercenaryCommandService, RuleConfigurationService, CommandAssetsResponse, UserGraphQLController)
    - **Reactive Refactoring**: Decompose large reactive chains into smaller, well-named private methods

### 2.5 DTO Layer: Massive Records and Service Layer Coupling
- **Observation**: `CampaignCreateInput.java` has **50+ fields** (massive input DTO)
- **Observation**: `CampaignMetadata.java` has **31 fields** and **couples to service layer** by using `RuleConfigurationService.MissionMetadata` and `RuleConfigurationService.ResolvedStepEntry` as field types
- **Observation**: `CampaignProposal.java` mixes entity references with primitives
- **Observation**: `ActiveCampaignSummary.java` (6 fields), `GeneratedTrack.java` (3 fields), `TrackUpdateInput.java` (10 fields) are clean
- **Impact**: Massive DTOs are hard to maintain. Service layer coupling in DTOs creates circular dependencies and tight coupling
- **Recommendation**:
    - Decompose `CampaignCreateInput` into focused input DTOs (e.g., `CampaignBasicInput`, `CampaignRulesInput`, `CampaignFactionsInput`)
    - **Remove service layer type references** from `CampaignMetadata` - create proper DTO types in `dto/` package
    - Keep simple DTOs as-is (ActiveCampaignSummary, GeneratedTrack, TrackUpdateInput are well-designed)

## 3. Frontend Analysis

### 3.0 Refactoring Progress

#### ✅ Completed: Pilot Calculation Logic Extraction (2025-05-22)
- **What**: Extracted `recalcDerived()` function from `PilotEditor.tsx` to centralized utility file
- **Files Changed**:
  - `frontend/src/util/pilotCalculations.ts` (NEW): Contains `recalcDerived()` function that calculates `totalSpEarned`, maps SP to skills via thresholds, calculates `asSkill` and `handicap`
  - `frontend/src/components/PilotEditor.tsx` (MODIFIED): Removed inline `recalcDerived` definition, now imports from `../util/pilotCalculations`
- **Benefit**: Separated calculation logic from UI component, improved testability, reduced component complexity
- **Status**: ✅ Compilation verified clean (get_errors: No errors found)

#### 📅 Remaining Frontend Refactoring Tasks
- [ ] Extract pricing logic from `CombatUnitEditor.tsx`
- [ ] Extract financial calculations from `AfterActionReportEditor.tsx`
- [ ] Standardize GraphQL client usage across all API services
- [ ] Modularize `global.d.ts` into domain-specific type files

### 3.1 API Client & GraphQL Inconsistency
- **Observation**: Inconsistent GraphQL consumption. `campaignApi.ts` performs manual `fetch` requests for certain operations (e.g., `previewCampaign`), while other parts of the app use Apollo Client or standard `fetch`.
- **Observation**: Redundant URL construction and manual `fetchVoid` implementations in `ledgerApi.ts`.
- **Impact**: Increased bundle size, inconsistent error handling, and difficulty in implementing global interceptors (e.g., for auth or logging).
- **Recommendation**:
    - **Unified GraphQL Client**: Standardize all GraphQL operations through a single, configured **Apollo Client** instance.
    - **Centralized API Wrapper**: Refactor `apiClient.ts` to be the single source of truth for all network requests, abstracting away URL construction and error handling.

### 3.2 Type Management
- **Observation**: `global.d.ts` is acting as a centralized "God File" for all domain types (CampaignMetadata, CombatUnit, Pilot, etc.).
- **Impact**: Potential for merge conflicts and difficulty in navigating large type files.
- **Recommendation**: Modularize types into domain-specific files (e.g., `src/types/campaign.ts`, `src/types/combat.ts`) and use barrel exports if necessary.

## 4. Summary of Recommendations

| Category | Recommendation | Impact | Priority |
| :--- | :--- | :--- | :--- |
| **Backend** | **Service Decomposition** (Break up God Services) | High | **Critical** |
| **Frontend** | **Unified GraphQL Client** (Standardize Apollo) | High | **High** |
| **Backend** | **Reactive Chain Refactoring** (Decompose complex chains) | High | **Medium** |
| **Backend** | **Automated Mapping** (Implement MapStruct) | Medium | **Medium** |
| **Frontend** | **Modular Type Definitions** (Domain-specific types) | Medium | **Low** |
| **Backend** | **AOP for Cross-Cutting Concerns** (Logging/Validation) | Medium | **Low** |
