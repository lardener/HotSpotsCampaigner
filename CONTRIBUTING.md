# Contributing to HotSpots: Campaigner

Thank you for contributing to the tactical management of mercenary commands! This project follows specific architectural patterns to ensure high performance, real-time synchronization, and a consistent "terminal" aesthetic.

## Architectural Core

- **Reactive Backend**: We use **Spring Boot 3** with **Project Reactor**. All I/O is non-blocking.
- **GraphQL Gateway**: All client communication happens via **Spring GraphQL**. REST is deprecated.
- **Reactive Persistence**: We use **Spring Data R2DBC** for non-blocking SQL access to MySQL.
- **Apollo Frontend**: The React frontend uses **Apollo Client** for state management and API communication.

---

## Backend Coding Standards

### 1. The Reactive Rule of Thumb
**Never block.** Do not use `Thread.sleep()`, blocking HTTP clients, or standard JDBC. 
- Always return `Mono<T>` or `Flux<T>`.
- Use `.flatMap()` for sequential operations and `Mono.zip()` or `Flux.merge()` for parallel operations.
- Explicitly type your reactive chains when using `.switchIfEmpty()` or `.flatMap()` to aid readability and compilation.

### 2. Service Layer Pattern
- Business logic resides in `@Service` classes (e.g., `MercenaryCommandService.java`).
- Services should be stateless.
- Use `@Transactional` on methods that perform multiple database writes to ensure consistency.
- Use `TypeUtils` for safe type casting and `SqlUtils` for consistent UUID binding in native SQL queries.

### 3. Error Handling
- Do not throw checked exceptions. 
- Use `Mono.error(new RuntimeException("..."))` to propagate errors through the stream.
- Use `.onErrorResume()` to provide tactical fallbacks or meaningful error messages.

---

## GraphQL Patterns

### 1. Schema-First Development
- Update `src/main/resources/graphql/schema.graphqls` before implementing resolvers.
- Keep the schema and the frontend `global.d.ts` synchronized.

### 2. Mutation Design
- Use `Input` objects for mutations (e.g., `CombatUnitUpdateInput`) rather than flat argument lists.
- Return the updated object from mutations to allow Apollo's cache to update automatically.

### 3. Real-time Updates
- Use `Subscription` for data that changes frequently across different command interfaces (e.g., Ledger updates).
- Leverage `Sinks.Many` in services to broadcast updates to active subscriptions.

---

## Frontend Coding Standards

### 1. Component Structure

### 2. TypeScript and Type Safety
- All tactical data structures (Pilot, CombatUnit, Detachment) are defined in `src/types/global.d.ts`.
- Ensure numeric fields like `handicap`, `bv`, and `pv` are treated as `number` on the frontend, even if the underlying DB column is currently a string (perform conversion in the service layer).

### 3. Apollo Client Usage
- Use `useQuery` and `useMutation` hooks.
- Set `notifyOnNetworkStatusChange: true` on major queries to support global loading/sync indicators.
- Implement `optimisticResponse` for frequent UI updates (like renaming a command) to maintain the "Neural Link: Stable" feel.

### 4. Terminal Aesthetic
- Follow the "Amber/Green/Blue" theme conventions in `theme.css`.
- Use utility classes like `pulse`, `blink-fast`, and `restricted-text` for the tactical terminal look.
- Layouts should favor the `dashboard-grid` and `tactical-panel` structures.

---

## Development Workflow

### Database Changes
1. Update the Java Entity in `com.hotspotscamp.entity`.
2. Update `SchemaGenerator.java` to reflect the new DDL.
3. Create a versioned migration script in `backend/src/main/resources/sql/` if migrating existing data.

### Local Testing
Before submitting a PR, verify the full stack:
```bash
# Backend
mvn clean install
mvn test

# Frontend
npm install
npm test
```

### Commit Guidelines
- Use descriptive subjects (e.g., `feat: implement global resync in sidebar`).
- Mention any specific ruleset being addressed (e.g., `fix: CampaignGenerator.tsx logic`).

---

*“In the Hinterlands, your code is your life support. Keep it clean, keep it reactive.”*
