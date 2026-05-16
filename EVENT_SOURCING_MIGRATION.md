# Plan: Event Sourcing & MySQL Migration

## Objective
Transition from direct relational mutations in `MercenaryCommandService` to an immutable event store using MySQL's native JSON support and a reactive projection model.

## Phase 1: Infrastructure
- [ ] Verify `r2dbc-mysql` dependency in `pom.xml` supports JSON codec for MySQL 8.0+.
- [ ] Update `schema.sql` to include an `event_store` table with a `JSON` data column.
- [ ] Implement `EventStoreRepository` to persist raw JSON events.

## Phase 2: Domain Events
- [ ] Define core events for Mercenary Commands:
    - `CommandEstablished` (Name, CO, Starting SP)
    - `CombatUnitPurchased` (Model, Tonnage, Cost)
    - `PilotHired` (Name, Skills)
    - `LedgerEntryCreated` (Amount, Description)
- [ ] Create an `Event` wrapper class with metadata (timestamp, version, userId).

## Phase 3: Projections (Read Models)
- [ ] Create a `MercenaryCommandProjection` service that consumes events to update the existing `mercenary_commands` relational table.
- [ ] Implement a replay mechanism to rebuild state from the event stream.

## Phase 4: Service Refactoring
- [ ] Refactor `MercenaryCommandService.createCommand` to emit a `CommandEstablished` event instead of calling `repository.save()`.
- [ ] Ensure all writes are appended to the Event Store first.

## Success Criteria
- Commands can be reconstructed to any point in time by replaying events.
- The `mercenary_commands` table acts as a high-performance "Read Model" derived from the event stream.