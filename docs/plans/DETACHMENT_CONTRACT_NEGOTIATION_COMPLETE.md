# Detachment Contract Negotiation - Implementation Summary

## Overview

This document summarizes the implementation of the detachment contract negotiation feature for HotSpots Campaigner. This feature allows players to negotiate per-detachment contract terms that override the baseline contract terms offered by employer factions.

## Implementation Phases

### Phase 1: Database Schema & Entities

**Files Created:**

- `backend/src/main/resources/db/migration/V1.1__detachment_contract_overrides.sql` - Initial migration
- `backend/src/main/resources/db/migration/V2__add_detachment_contract_overrides.sql` - Enhanced migration with FK constraints
- `backend/src/main/java/com/hotspotscamp/entity/DetachmentContractOverride.java` - JPA entity

**Schema:**

```sql
CREATE TABLE detachment_contract_overrides (
    id UUID PRIMARY KEY,
    campaign_id UUID NOT NULL,
    employer_faction_id UUID NOT NULL,
    detachment_id UUID NOT NULL,
    owner_user_id UUID NOT NULL,
    pay_step_adjustment INT,
    salvage_step_adjustment INT,
    support_step_adjustment INT,
    transport_step_adjustment INT,
    command_step_adjustment INT,
    salvage_terms VARCHAR(50),
    support_terms VARCHAR(50),
    transport_terms VARCHAR(50),
    command_rights VARCHAR(50),
    negotiation_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (campaign_id, detachment_id, employer_faction_id)
);
```

### Phase 2: Backend Service Layer

**Files Created:**

- `backend/src/main/java/com/hotspotscamp/service/DetachmentContractNegotiationService.java` - Core negotiation service
- `backend/src/main/java/com/hotspotscamp/service/DetachmentContractCalculation.java` - Calculation result DTO
- `backend/src/main/java/com/hotspotscamp/service/DetachmentContractLedgerService.java` - Ledger integration service
- `backend/src/main/java/com/hotspotscamp/repository/DetachmentContractOverrideRepository.java` - R2DBC repository

**Key Features:**

- Save/update negotiation overrides per detachment + employer faction
- Calculate final contract terms by applying step adjustments to baseline
- Validate step adjustments are within -3 to +3 range
- Clamp final steps to 0-10 range
- Support for term overrides (salvage, support, transport, command rights)

### Phase 3: GraphQL Schema & Resolvers

**Files Modified:**

- `backend/src/main/resources/graphql/schema.graphqls` - Added types and mutations

**New GraphQL Types:**

```graphql
type DetachmentContractNegotiation {
  id: ID!
  campaignId: ID!
  detachmentId: ID!
  employerFactionId: ID!
  payStepAdjustment: Int
  salvageStepAdjustment: Int
  supportStepAdjustment: Int
  transportStepAdjustment: Int
  commandStepAdjustment: Int
  salvageTerms: String
  supportTerms: String
  transportTerms: String
  commandRights: String
  notes: String
  createdAt: String
  updatedAt: String
}

input NegotiateContractInput {
  campaignId: ID!
  detachmentId: ID!
  employerFactionId: ID!
  payStepAdjustment: Int
  salvageStepAdjustment: Int
  supportStepAdjustment: Int
  transportStepAdjustment: Int
  commandStepAdjustment: Int
  salvageTerms: String
  supportTerms: String
  transportTerms: String
  commandRights: String
  notes: String
}
```

**New GraphQL Operations:**

```graphql
getDetachmentContractNegotiations(campaignId: ID!): [DetachmentContractNegotiation!]!
negotiateDetachmentContract(input: NegotiateContractInput!): DetachmentContractNegotiation!
deleteDetachmentContractNegotiation(campaignId: ID!, detachmentId: ID!): Boolean
```

**Files Created:**

- `backend/src/main/java/com/hotspotscamp/api/DetachmentContractNegotiationController.java` - GraphQL controller

### Phase 4: Frontend Implementation

**Files Created:**

- `frontend/src/types/detachmentContract.ts` - TypeScript types and constants
- `frontend/src/gql/operations/detachmentContract.ts` - GraphQL operations
- `frontend/src/hooks/useDetachmentContractNegotiation.ts` - React hooks
- `frontend/src/components/DetachmentContractNegotiationForm.tsx` - Negotiation form component

**Key Features:**

- Step adjustment selectors (-3 to +3) with live preview of final values
- Term override dropdowns for salvage, support, transport, and command rights
- Notes field for negotiation context
- Form pre-populated with existing negotiations
- Delete negotiation capability
- Baseline values displayed alongside adjustments

### Phase 5: Ledger Integration

**Files Created:**

- `backend/src/main/java/com/hotspotscamp/service/DetachmentContractLedgerService.java` - Ledger service

**Features:**

- Creates ledger entries for negotiation actions
- Tracks override activations
- Queryable by detachment or campaign

### Phase 6-7: Testing & Documentation

**Files Created:**

- `backend/src/test/java/com/hotspotscamp/service/DetachmentContractNegotiationServiceTest.java` - Unit tests
- `docs/plans/DETACHMENT_CONTRACT_NEGOTIATION_COMPLETE.md` - This document

**Test Coverage:**

- `saveNegotiation` - Save and validation tests
- `findByDetachmentAndEmployer` - Find by detachment + employer
- `calculateWithOverrides` - Step adjustment application
- `deleteByDetachment` - Delete negotiation tests

## Usage

### Backend API

```graphql
# Query negotiations for a campaign
query {
  getDetachmentContractNegotiations(campaignId: "uuid-here") {
    id
    detachmentId
    employerFactionId
    payStepAdjustment
    salvageTerms
    notes
  }
}

# Negotiate contract terms
mutation {
  negotiateDetachmentContract(
    input: {
      campaignId: "uuid-here"
      detachmentId: "uuid-here"
      employerFactionId: "uuid-here"
      payStepAdjustment: 2
      salvageTerms: "Full"
      notes: "Negotiated better pay"
    }
  ) {
    id
    payStepAdjustment
    salvageTerms
  }
}

# Delete negotiation
mutation {
  deleteDetachmentContractNegotiation(campaignId: "uuid-here", detachmentId: "uuid-here")
}
```

### Frontend Usage

```tsx
import { DetachmentContractNegotiationForm } from './components/DetachmentContractNegotiationForm'

;<DetachmentContractNegotiationForm
  campaignId="uuid-here"
  detachmentId="uuid-here"
  employerFactionId="uuid-here"
  employerFactionName="Lyran Alliance"
  baselinePayStep={5}
  baselineSalvageStep={3}
  baselineSupportStep={4}
  baselineTransportStep={2}
  baselineCommandStep={1}
  baselineSalvageTerms="Full"
  baselineSupportTerms="Shared"
  baselineTransportTerms="Free"
  baselineCommandRights="Independent"
  onNegotiationSaved={() => console.log('Saved!')}
/>
```

## Testing

Run the backend tests:

```bash
cd backend
mvn test -Dtest=DetachmentContractNegotiationServiceTest
```

## Next Steps

1. Add integration tests for the GraphQL controller
2. Add frontend component tests
3. Integrate with the CampaignTheaterView to display negotiation status
4. Add negotiation history tracking
5. Consider adding negotiation cost calculations (SP cost for better terms)
