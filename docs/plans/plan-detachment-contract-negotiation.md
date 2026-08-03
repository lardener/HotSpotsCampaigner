# Plan: Detachment Contract Negotiation

## Objective

Enable detachment owners to negotiate personalized contract terms based on the campaign's baseline contract and employer reputation, with expenses and pay calculated per the detachment's negotiated contract rather than the campaign baseline.

---

## Phase 1: Database Schema & Entities

### 1.1 New Table

**`detachment_contract_overrides`**

```sql
CREATE TABLE detachment_contract_overrides (
    id VARCHAR(36) PRIMARY KEY,
    campaign_id VARCHAR(36) NOT NULL,
    employer_faction_id VARCHAR(36) NOT NULL,
    detachment_id VARCHAR(36) NOT NULL,
    owner_user_id VARCHAR(36) NOT NULL,

    -- Per-term step modifications (relative to campaign baseline)
    -- NULL means "use campaign baseline" for this term
    -- Positive = increase steps, negative = decrease steps
    pay_step_adjustment INT,
    salvage_step_adjustment INT,
    support_step_adjustment INT,
    transport_step_adjustment INT,
    command_step_adjustment INT,

    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_user_id) REFERENCES app_users(id),
    UNIQUE KEY unique_detachment_contract (detachment_id, campaign_id, employer_faction_id)
);
```

**Design note**: Each term has a step adjustment (not an absolute value). The resolved step is `baseline_step + adjustment`, resolved against the Contract Steps Table. NULL means "no override — use campaign baseline."

### 1.2 Entity Classes

**`DetachmentContractOverride.java`**

- Location: `backend/src/main/java/com/hotspotscamp/entity/DetachmentContractOverride.java`
- Fields: All database columns mapped to Lombok fields
- Implements `Persistable<UUID>` pattern
- Annotations: `@Table("detachment_contract_overrides")`, `@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`

### 1.3 Migration File

**`V2__add_detachment_contract_overrides.sql`**

- Location: `backend/src/main/resources/db/migration/`
- Creates `detachment_contract_overrides` table
- Adds indexes for performance on `campaign_id`, `detachment_id`, `owner_user_id`

---

## Phase 2: Backend Service Layer

### Core Design: Resolved Contract Terms

**The overriding principle**: Any service that needs contract terms (pay rate, salvage, support, transport, command rights) for a detachment calls `ContractTermResolver.resolve()`. If a negotiation exists for `(detachmentId, campaignId, employerFactionId)`, it returns the **negotiated** terms. Otherwise it returns the **campaign baseline** terms from `Campaign` or `Contract`.

The resolved terms are then used for all pay/expense/salvage calculations — no consumer needs to know whether the terms came from a negotiation or the baseline.

### 2.1 New Entity: `DetachmentContractOverride.java`

**Location**: `backend/src/main/java/com/hotspotscamp/entity/DetachmentContractOverride.java`

**Design note**: Stores only the per-term step adjustments (what the user negotiated). The fully resolved term values are computed on-read by `ContractTermResolver` — this avoids data redundancy and staleness if the baseline contract changes. Rule validation (Scale, Reputation, Sacrifice, em-dash) is enforced by the UI and in `validateAdjustments`.

```java
@Table("detachment_contract_overrides")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DetachmentContractOverride implements Persistable<UUID> {
    @Id private UUID id;
    @Column("campaign_id") private UUID campaignId;
    @Column("employer_faction_id") private UUID employerFactionId;
    @Column("detachment_id") private UUID detachmentId;
    @Column("owner_user_id") private UUID ownerId;

    // --- Step adjustments (what the user negotiated, relative to baseline) ---
    @Column("pay_step_adjustment") private Integer payStepAdjustment;
    @Column("salvage_step_adjustment") private Integer salvageStepAdjustment;
    @Column("support_step_adjustment") private Integer supportStepAdjustment;
    @Column("transport_step_adjustment") private Integer transportStepAdjustment;
    @Column("command_step_adjustment") private Integer commandStepAdjustment;
}
```

### 2.2 Repository: `DetachmentContractOverrideRepository.java`

**Location**: `backend/src/main/java/com/hotspotscamp/repository/DetachmentContractOverrideRepository.java`

```java
@Repository
public interface DetachmentContractOverrideRepository
    extends ReactiveCrudRepository<DetachmentContractOverride, UUID> {

    Mono<DetachmentContractOverride> findByDetachmentIdAndCampaignIdAndEmployerFactionId(
        UUID detachmentId, UUID campaignId, UUID employerFactionId
    );
}
```

### 2.3 New Service: `ContractTermResolver.java`

**Location**: `backend/src/main/java/com/hotspotscamp/service/ContractTermResolver.java`

**Responsibility**: Resolve contract terms for a specific detachment/employer combination by applying step adjustments to the baseline and looking up results in the Contract Steps Table.

```java
public class ContractTermResolver {

    /**
     * Returns resolved ContractStepValues for the given detachment + employer.
     * If a DetachmentContractOverride exists, applies its adjustments to the
     * campaign/contract baseline and resolves against the Contract Steps Table.
     * Otherwise returns the baseline values.
     */
    public ContractStepValues resolve(
        Campaign campaign,
        Contract contract,
        DetachmentContractOverride override
    );
}
```

**`ContractStepValues`** — a simple data class with the resolved values for all 5 terms:

| Field            | Type    | Source                                                                                 |
| ---------------- | ------- | -------------------------------------------------------------------------------------- |
| `payRate`        | Double  | Resolved from `contract.payStep + override.payStepAdjustment` via Contract Steps Table |
| `payStep`        | Integer | `contract.payStep + override.payStepAdjustment` (or just `contract.payStep`)           |
| `salvageTerms`   | String  | Resolved from baseline `salvageStep` + adjustment via Contract Steps Table             |
| `salvageStep`    | Integer | `contract.salvageStep + override.salvageStepAdjustment`                                |
| `supportTerms`   | String  | Resolved from baseline `supportStep` + adjustment via Contract Steps Table             |
| `supportStep`    | Integer | `contract.supportStep + override.supportStepAdjustment`                                |
| `transportTerms` | String  | Resolved from baseline `transportStep` + adjustment via Contract Steps Table           |
| `transportStep`  | Integer | `contract.transportStep + override.transportStepAdjustment`                            |
| `commandRights`  | String  | Resolved from baseline `commandStep` + adjustment via Contract Steps Table             |
| `commandStep`    | Integer | `contract.commandStep + override.commandStepAdjustment`                                |

### 2.4 New Service: `DetachmentContractService.java`

**Location**: `backend/src/main/java/com/hotspotscamp/service/DetachmentContractService.java`

**Responsibilities**: CRUD for `DetachmentContractOverride`, plus rule validation.

```java
public class DetachmentContractService {

    // Save a negotiation (create or update)
    public Mono<DetachmentContractOverride> saveOverride(
        UUID campaignId, UUID employerFactionId, UUID detachmentId,
        String userId, StepAdjustments adjustments
    );

    // Delete a negotiation
    public Mono<Void> deleteOverride(UUID overrideId, UUID ownerId);

    // Get existing override for a detachment+employer pair
    public Mono<DetachmentContractOverride> getOverride(
        UUID detachmentId, UUID campaignId, UUID employerFactionId
    );

    // Validate adjustments against book rules (Scale, Reputation, Sacrifice)
    public ValidationResult validateAdjustments(
        StepAdjustments adjustments,
        Campaign campaign,
        MercenaryCommand command,
        int scale
    );
}
```

**`StepAdjustments`** — input object for saving a negotiation (net step changes):

```java
public class StepAdjustments {
    public Integer payStepAdjustment;
    public Integer salvageStepAdjustment;
    public Integer supportStepAdjustment;
    public Integer transportStepAdjustment;
    public Integer commandStepAdjustment;
}
```

> **Rule validation note**: Sacrifices are represented as combinations of positive and negative adjustments in `StepAdjustments` (e.g., sacrificing 2 steps from support to gain 1 step on pay = `{payStepAdjustment: 1, supportStepAdjustment: -2}`). The UI enforces book rules (Scale, Reputation limits, em-dash steps). The backend `validateAdjustments` performs a secondary pass to verify the net adjustments are plausible.

### 2.5 Contract Terms Calculation Rules (from Hot Spots: Draconis Reach)

**The book text is reproduced here for reference.**

> NEGOTIATING A CONTRACT
>
> The contract will have default payment and support terms. The player may negotiate some changes to these terms, using their Reputation to increase the contract terms, or by sacrificing some terms in favor of other terms.
>
> **Maximum Term Increase:** No term may be increased more than once per scale. This includes whether it is increased by Reputation or by sacrificing steps from another term. For example, at scale 3 each term may be increased at most 3 steps.
>
> **Reputation Negotiation:** For every point of Reputation (initially 1), the player may increase one contract term by one step (see Contract Steps Table, p. 28). The amount of Reputation that can be applied to a contract is a maximum of twice the Scale of the contract. At the initial Scale of 1, up to 2 Reputation can be used to modify a contract. Each player negotiates their own contract separately.
>
> **Sacrificing Terms Negotiation:** In addition, the player may sacrifice two steps in any one contract term to increase another contract term by one step. This swap can be done a maximum of twice to exchange two steps each in two different contract terms (or four in one type) to increase one or two different contract terms a total of two steps. If a step has an em dash (—), then that step cannot be selected; you must drop or raise enough steps to reach the next step, even if it is more steps than you can use. For example, it is one step to upgrade the Command Rights from House to Liaison. If you want to reach Independent Command Rights, you need to find another 3 steps to reach an 11. Steps 9 and 10 get you nothing. If you want to decrease Command Rights from House, you get nothing for steps 6, 5, or 4. You drop 4 steps to get to Integrated Command Rights.

**Summary for implementation:**

| Rule             | Effect                                                                                                            |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Scale**        | Starts at 1 for a new campaign (may increase via future expansion). Controls all limits.                          |
| **Reputation**   | 1 Reputation = +1 step on one term. Max usable = `2 × Scale`.                                                     |
| **Sacrifice**    | -2 steps from one term → +1 step on another. Max 2 sacrifices. Can be from one term (4→2) or two terms (2+2→1+1). |
| **Per-term cap** | No term increased more than `Scale` steps total (Reputation + Sacrifice combined).                                |
| **Em dash**      | Cannot stop on an em dash step; must skip to next valid step.                                                     |
| **Independent**  | Each detachment negotiates independently.                                                                         |

### 2.6 Integration: Ledger & Monthly Pay Use Resolved Terms

**Updated services** that consume contract terms:

| Service                                 | Current Behavior                                 | Updated Behavior                                                                                                |
| --------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `LedgerService.addLedgerEntry()`        | Uses campaign baseline pay/maintenance/transport | Calls `ContractTermResolver.resolve()` for the detachment's employer → uses negotiated terms if override exists |
| `CampaignService.calculateMonthlyPay()` | Uses `campaign.monthlyPay` etc.                  | For each detachment, resolves terms via employer faction → applies negotiated terms per detachment              |
| `MarketService` (salvage calculations)  | Uses campaign salvage terms                      | Resolves via `ContractTermResolver` when applicable                                                             |

**ContractTermResolver contract**:

```
resolve(campaign, contract, override) → ContractStepValues
  where override = DetachmentContractService.getOverride(detachmentId, campaignId, employerFactionId)

If override == null:
  return ContractStepValues from campaign/contract baseline

If override != null:
  resolvedPayStep = contract.payStep + override.payStepAdjustment (if not null)
  resolvedSalvageStep = contract.salvageStep + override.salvageStepAdjustment
  resolvedSupportStep = contract.supportStep + override.supportStepAdjustment
  resolvedTransportStep = contract.transportStep + override.transportStepAdjustment
  resolvedCommandStep = contract.commandStep + override.commandStepAdjustment
  return ContractStepValues from the resolved steps (looked up on Contract Steps Table)
```

---

## Phase 3: GraphQL Schema & Resolvers

### 3.1 Schema Extensions

**File**: `schema.graphqls` (project root)

Add new types. Note: `frontend/codegen.ts` reads `schema.graphqls` and generates:

- `frontend/src/types/generated.ts` — TypeScript type definitions
- `frontend/src/types/operations.ts` — Typed DocumentNodes and operation result types

Any new GraphQL type or operation added to `schema.graphqls` or `frontend/src/gql/operations.ts` will be picked up by codegen.

```graphql
type DetachmentContractOverride {
  id: ID!
  campaignId: ID!
  employerFactionId: ID!
  detachmentId: ID!
  ownerId: ID!
  payStepAdjustment: Int
  salvageStepAdjustment: Int
  supportStepAdjustment: Int
  transportStepAdjustment: Int
  commandStepAdjustment: Int
}

input StepAdjustmentsInput {
  payStepAdjustment: Int
  salvageStepAdjustment: Int
  supportStepAdjustment: Int
  transportStepAdjustment: Int
  commandStepAdjustment: Int
}

type ContractStepValues {
  payStep: Int!
  payRate: Float!
  salvageStep: Int!
  salvageTerms: String!
  supportStep: Int!
  supportTerms: String!
  transportStep: Int!
  transportTerms: String!
  commandStep: Int!
  commandRights: String!
}

input DetachmentContractOverrideInput {
  campaignId: ID!
  employerFactionId: ID!
  detachmentId: ID!
  adjustments: StepAdjustmentsInput!
}
```

### 3.2 New Mutations

```graphql
mutation saveDetachmentContractOverride(
    $input: DetachmentContractOverrideInput!
): DetachmentContractOverride

mutation deleteDetachmentContractOverride($overrideId: ID!): Boolean
```

### 3.3 New Queries

```graphql
query detachmentContractOverride(
    $detachmentId: ID!,
    $campaignId: ID!,
    $employerFactionId: ID!
): DetachmentContractOverride

query resolvedContractSteps(
    $detachmentId: ID!,
    $campaignId: ID!,
    $employerFactionId: ID!
): ContractStepValues
```

### 3.4 Detachment Extension

**Extend `Detachment` type**:

```graphql
type Detachment {
  id: ID!
  name: String
  callsign: String
  mercenaryCommandId: ID
  campaignId: ID
  campaignName: String
  contractAssignments: [ContractAssignment]
  mercenaryCommandName: String
  units: [CombatUnit]
  pilots: [Pilot]
  campaignRating: Int
}
```

> The Detachment type does **not** gain a `negotiations` field. Negotiations are queried directly via the `detachmentContractOverride` query using `(detachmentId, campaignId, employerFactionId)`.

### 3.5 GraphQL Resolvers

**File**: `backend/src/main/java/com/hotspotscamp/graphql/DetachmentContractGraphQLController.java`

**Methods**:

- `saveDetachmentContractOverride()` — delegates to `DetachmentContractService.saveOverride()`, validates adjustments against book rules
- `deleteDetachmentContractOverride()` — delegates to `DetachmentContractService.deleteOverride()`
- `detachmentContractOverride()` — queries existing override via `DetachmentContractService.getOverride()`
- `resolvedContractSteps()` — returns resolved terms for a detachment+employer pair using `ContractTermResolver`

---

## Phase 4: Frontend Implementation

### 4.1 New Components

#### `ContractNegotiationView.tsx`

**Location**: `frontend/src/components/ContractNegotiationView.tsx`

**Purpose**: Main negotiation UI for detachment owners

**Features**:

- Display current campaign baseline contract
- Show available employers and their factions
- Negotiation form with sliders/inputs for per-term step adjustments:
  - Pay rate adjustment
  - Salvage terms adjustment
  - Support terms adjustment
  - Transport terms adjustment
  - Command rights adjustment
- Real-time rate calculation preview using `resolveStepValueWithGravity` (same logic as `CampaignGenerator`)
- Display negotiated terms vs baseline

#### `DetachmentContractEditor.tsx`

**Location**: `frontend/src/components/DetachmentContractEditor.tsx`

**Purpose**: Inline editor for contract terms within detachment view

**Features**:

- Editable fields for negotiated rates
- Visual comparison vs campaign baseline
- Impact summary on monthly ledger

### 4.2 GraphQL Operations

**File**: `frontend/src/gql/operations.ts`

Add new operations. Note: `frontend/codegen.ts` reads `frontend/src/gql/operations.ts` (via the `documents` glob) and generates `frontend/src/types/operations.ts` and `frontend/src/types/generated.ts`. **Do not edit the generated files directly** — edit `frontend/src/gql/operations.ts` and `schema.graphqls`, then run codegen.

```typescript
export const DETACHMENT_CONTRACT_OVERRIDE_QUERY = gql`
  query DetachmentContractOverride($detachmentId: ID!, $campaignId: ID!, $employerFactionId: ID!) {
    detachmentContractOverride(
      detachmentId: $detachmentId
      campaignId: $campaignId
      employerFactionId: $employerFactionId
    ) {
      ...DetachmentContractOverrideFields
    }
  }
`

export const SAVED_DETACHMENT_CONTRACT_STEPS_QUERY = gql`
  query SavedDetachmentContractSteps(
    $detachmentId: ID!
    $campaignId: ID!
    $employerFactionId: ID!
  ) {
    resolvedContractSteps(
      detachmentId: $detachmentId
      campaignId: $campaignId
      employerFactionId: $employerFactionId
    )
  }
`

export const SAVE_DETACHMENT_CONTRACT_OVERRIDE = gql`
  mutation SaveDetachmentContractOverride($input: DetachmentContractOverrideInput!) {
    saveDetachmentContractOverride(input: $input) {
      ...DetachmentContractOverrideFields
    }
  }
`

export const DELETE_DETACHMENT_CONTRACT_OVERRIDE = gql`
  mutation DeleteDetachmentContractOverride($overrideId: ID!) {
    deleteDetachmentContractOverride(overrideId: $overrideId)
  }
`
```

### 4.3 Generated Types

Run codegen after adding the GraphQL operations and schema extensions. It will generate:

- `frontend/src/types/generated.ts` — TypeScript interfaces for `DetachmentContractOverride`, `StepAdjustmentsInput`, `ContractStepValues`, `DetachmentContractOverrideInput`
- `frontend/src/types/operations.ts` — Typed DocumentNodes and operation result types

**Do not edit generated files directly.** They are regenerated from `schema.graphqls` and `frontend/src/gql/operations.ts`.

### 4.3 State Management

**New Hook**: `useDetachmentContractOverride.ts`
**Location**: `frontend/src/hooks/useDetachmentContractOverride.ts`

**Responsibilities**:

- Load existing override for a detachment+employer pair (via `detachmentContractOverride` query)
- Handle save/delete mutations
- Local form state for adjustment inputs

The hook returns the override if it exists, or null if no negotiation has been created yet.

---

## Phase 5: Ledger Integration

### 5.1 Ledger Integration (Existing Operations Modified)

**Files**: `LedgerService.java`, `CampaignService.java`

**Design**: No new ledger entry method is needed. The existing contract payment operations (`addLedgerEntry()` and `calculateMonthlyPay()`) are modified to use `ContractTermResolver.resolve()` internally. When a negotiation exists for the detachment's employer faction, the resolved negotiated rates are used instead of the campaign baseline.

**Changes**:

- `LedgerService.addLedgerEntry()` — resolves contract terms via `ContractTermResolver.resolve()` using the detachment's employer faction before calculating charges
- `CampaignService.calculateMonthlyPay()` — resolves terms per detachment and aggregates negotiated rates
- If no negotiation exists, the resolved values match the campaign baseline (no behavioral change)

### 5.2 Monthly Pay Calculation (Consolidated with 5.1)

**File**: `backend/src/main/java/com/hotspotscamp/service/CampaignService.java`

**Changes**:

- Update `calculateMonthlyPay()` to use `ContractTermResolver` for each detachment
- Aggregate negotiated rates across all detachments for the campaign total
- No separate `addDetachmentLedgerEntry` method required

---

## Phase 6: Testing

### 6.1 Backend Tests

**Test Classes**:

- `DetachmentContractServiceTest.java`
- `ContractTermResolverTest.java`
- `DetachmentContractGraphQLControllerTest.java`

**Test Coverage**:

- Step adjustment validation against book rules (Scale, Reputation, Sacrifice)
- Resolved step values match Contract Steps Table
- Edge cases (null adjustments, em dash steps, per-term caps)
- Authorization checks
- Database transactions

### 6.2 Frontend Tests

**Test Files**:

- `ContractNegotiationView.test.tsx`
- `DetachmentContractEditor.test.tsx`
- `useDetachmentContractOverride.test.ts`

**Test Coverage**:

- Component rendering
- Form validation
- Rate calculation preview using `resolveStepValueWithGravity`
- Mutation execution
- Display of negotiated vs baseline terms

---

## Phase 7: Documentation & Polish

### 7.1 API Documentation

- Update GraphQL schema documentation
- Add Javadoc for new services
- Document negotiation rules and modifiers

### 7.2 User Documentation

- Add tooltips in UI explaining negotiation terms
- Create help section for negotiation rules
- Document rate calculation logic

### 7.3 Migration & Deployment

- Update Docker Compose with new database migration
- Test Flyway migration
- Update Kubernetes manifests if needed

---

## Implementation Checklist

### Phase 1: Database

- [ ] Create `detachment_contract_overrides` table schema
- [ ] Write Flyway migration `V2__add_detachment_contract_overrides.sql`
- [ ] Create `DetachmentContractOverride.java` entity
- [ ] Test database migration locally

### Phase 2: Backend Service

- [ ] Create `DetachmentContractService.java`
- [ ] Create `ContractTermResolver.java`
- [ ] Create `DetachmentContractOverrideRepository.java`
- [ ] Implement rate calculation algorithm (Contract Steps Table lookup with gravity)
- [ ] Implement negotiation validation (Scale, Reputation, Sacrifice, em-dash rules)
- [ ] Write backend unit tests

### Phase 3: GraphQL Layer

- [ ] Extend `schema.graphqls` with new types (DetachmentContractOverride, ContractStepValues)
- [ ] Create `DetachmentContractGraphQLController.java`
- [ ] Add mutations: `saveDetachmentContractOverride`, `deleteDetachmentContractOverride`
- [ ] Add queries: `detachmentContractOverride`, `resolvedContractSteps`
- [ ] Test GraphQL API with GraphiQL

### Phase 4: Frontend

- [ ] Generate TypeScript types from schema (run codegen)
- [ ] Create `useDetachmentContractOverride.ts` hook
- [ ] Build `ContractNegotiationView.tsx` component
- [ ] Build `DetachmentContractEditor.tsx` component
- [ ] Add navigation to dashboard
- [ ] Write frontend tests

### Phase 5: Ledger Integration

- [ ] Update `LedgerService.addLedgerEntry()` to use `ContractTermResolver.resolve()`
- [ ] Update `CampaignService.calculateMonthlyPay()` to resolve terms per detachment
- [ ] Test ledger entries with negotiated rates
- [ ] Verify monthly pay calculations

### Phase 6: Testing

- [ ] Run all backend tests
- [ ] Run all frontend tests
- [ ] Integration testing with live database
- [ ] Performance testing for rate calculations

### Phase 7: Documentation

- [ ] Add API documentation
- [ ] Update user guides
- [ ] Add UI tooltips
- [ ] Deploy to test environment

---

## Technical Notes

### Dependencies

- No new external dependencies required
- Uses existing Spring WebFlux, R2DBC, Apollo Client

### Performance Considerations

- Negotiation rate calculations are computed on-demand (not cached)
- Database queries use indexed foreign keys
- Frontend caches negotiation data via Apollo Client

### Security

- Authorization checks in GraphQL resolvers
- Only detachment owner can submit negotiations
- Employer faction can only respond to their own negotiations
- Rate modifications capped at ±50% to prevent exploitation

### Future Enhancements (Out of Scope)

- AI-powered negotiation suggestions
- Automated negotiation based on campaign rules
- Multi-cycle negotiation tracking
- Negotiation templates for common scenarios

---

## Success Criteria

1. **Functional**: Detachment owners can negotiate personalized contract terms
2. **Accurate**: Rate calculations match "Hot Spots: Draconis Reach" rules
3. **Integrated**: Negotiated rates applied to ledger entries and monthly pay
4. **User-Friendly**: Intuitive UI with real-time rate previews
5. **Tested**: Comprehensive backend and frontend test coverage
6. **Documented**: API and user documentation complete

---

## References

- Hot Spots: Draconis Reach - Contract negotiation rules
- Existing contract system: `backend/src/main/java/com/hotspotscamp/entity/Contract.java`
- Existing detachment system: `backend/src/main/java/com/hotspotscamp/entity/Detachment.java`
- Rule tables: `backend/src/main/resources/rules/`
- Current migration: `backend/src/main/resources/db/migration/V1__init_schema.sql`
