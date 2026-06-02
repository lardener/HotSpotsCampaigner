# Integration Test Plan: Campaign Lifecycle Workflow

## Objective
Verify the end-to-end business logic of the campaign creation, invitation, detachment creation, and ledger entry workflows using a simulated multi-user environment. This ensures that complex reactive transactions and security context switching work correctly across different user identities.

## 1. Infrastructure Requirements
To ensure tests are hermetic and reproducible, the following stack will be used:
* **Testcontainers (MySQL):** A real MySQL instance to validate R2DBC migrations and SQL syntax.
* **WebTestClient:** To execute GraphQL mutations/queries against the running application context.
* **Mock Security Context:** Spring Security test support such as `@WithMockUser` or reactive `ReactiveSecurityContextHolder` to impersonate the campaign manager and avoid Google SSO.

## 2. Test Scenario Execution Flow

### Phase A: Setup
1. **Identity Provisioning:** No database seed is required.
    * Use GraphQL mutations to build the campaign state programmatically.
    * Mock the campaign manager login in tests so the flow bypasses Google SSO.

### Phase B: Campaign & Invitation Orchestration
2. **Campaign Creation:** 
    * *Context:* `manager_user`
    * *Action:* Execute `createCampaign`.
    * *Validation:* Verify campaign exists in DB and is owned by `manager_user`.
3. **Invitation Issuance:**
    * *Context:* `manager_user`
    * *Action:* Execute `createInvitation` twice.
    * *Validation:* Verify two active invitations exist, linked to the campaign.

### Phase C: User Onboarding & Detachment Creation
4. **Invitee A Join Workflow:**
    * *Context:* `invitee_a_user`
    * *Action:* Execute `acceptInvitation` (using token from Step 3).
    * *Action:* Execute `createDetachment`.
    * *Validation:* Verify `invitee_a_user` is listed as a participant in the campaign and detachment belongs to them.
5. **Invitee B Join Workflow:**
    * *Context:* `invitee_b_user`
    * *Action:* Execute `acceptInvitation`.
    * *Action:* Execute `createDetachment`.
    * *Validation:* Verify `invitee_b_user` is listed as a participant.

### Phase D: Financial & Workflow Processing
6. **Monthly Maintenance (Ledger Entry A):**
    * *Context:* `manager_user`
    * *Action:* Execute `processMonthlyWorkflow` for `invitee_a_user`'s detachment.
    * *Validation:* Verify a new Ledger Entry exists in `invitee_a_user`'s ledger with correct calculated amounts.
7. **After Action Workflow (Ledger Entry B):**
    * *Context:* `manager_user`
    * *Action:* Execute `processAfterActionWorkflow` for `invitee_b_user`'s detachment.
    * *Validation:* Verify a new Ledger Entry exists in `invitee_b_user`'s ledger with correct calculated amounts.

## 3. Success Criteria
* **Data Integrity:** All database records (Campaign, Invitation, Detachment, LedgerEntry) reflect the expected state and ownership.
* **Security Enforcement:** Unauthorized users (e.g., `invitee_a_user` trying to access `invitee_b_user`'s detachment) are rejected with appropriate error responses.

## 4. Negative Scenarios (Unhappy Path)
* **Unauthorized Access:** Verify that a user without the `MANAGER` role cannot execute `createCampaign`.
* **Invalid Invitation:** Attempting to use an expired or non-existent invitation token fails.
* **Constraint Violations:** Attempting to create a detachment with invalid parameters or duplicate IDs triggers proper validation errors.

## 5. Edge Cases
* **Empty Campaign:** Running workflows on a campaign that has no detachments yet.
* **Zero-Value Transactions:** Ensuring ledger entries process correctly when financial changes are zero.
* **Boundary Users:** Testing behavior when the number of participants reaches the system's maximum capacity (if defined).

## 6. Test Lifecycle & Cleanup Management
* **Test Isolation:** Use `@Transactional` or database truncation after each test to ensure a clean state.
* **Security Context Reset:** Explicitly clear the `ReactiveSecurityContextHolder` in an `@AfterEach` block to prevent cross-test identity contamination.
* **Container Management:** Ensure Testcontainers MySQL instance is properly shut down via `@Container` and `@Testcontainers` annotations.


