## Plan: Database Migrations (Flyway)

TL;DR: Schema is currently managed by `schema.sql`, which **drops every table on each init** (`DROP TABLE IF EXISTS` over all tables in the schema) and is mounted into the MySQL container's initdb. This is destructive and not versioned. Replace it with versioned **Flyway** migrations for safe, repeatable, auditable schema evolution.

**Steps**
- [x] Add dependencies to `backend/pom.xml`: `spring-boot-starter-flyway`, `org.flywaydb:flyway-core`, `org.flywaydb:flyway-mysql`. *Depends on: nothing.*
- [x] Convert `schema.sql` into `backend/src/main/resources/db/migration/V1__init_schema.sql`. Remove the destructive preamble (`SET FOREIGN_KEY_CHECKS=0`, the dynamic `DROP TABLE` block, `SET SESSION group_concat_max_len`). Keep the `CREATE TABLE` statements; Flyway guarantees they run once. *Depends on step 1.*
- [x] Remove the erroneous mount in `docker-compose.yml` mysql service: `./backend/src/main/resources/graphql/schema.graphqls:/docker-entrypoint-initdb.d/schema.sql:ro` (it mounts the GraphQL schema as SQL — wrong). MySQL initdb is no longer needed once Flyway runs at app startup. *Depends on step 2.*
- [x] Pin the database image: change `Dockerfile.database` `FROM mysql:latest` to a pinned major (e.g., `mysql:8.4`). *Parallel with step 1.*
- [x] Add Flyway config to `backend/src/main/resources/application.yml`: `spring.flyway.enabled=true`, `locations=classpath:db/migration`, and `baseline-on-migrate=true` so the existing OVH production DB is baselined without dropping data. *Depends on step 2.*
- [x] Keep `sync-schema.ps1` for GraphQL schema sync only (it copies `backend/src/main/resources/graphql/schema.graphqls` → root `schema.graphqls` for frontend codegen). Clarify its purpose in a comment; it is unrelated to DB schema. *Parallel.*

**Relevant files**
- `schema.sql` — current destructive init script (source for V1 migration).
- `backend/pom.xml` — add Flyway deps.
- `backend/src/main/resources/application.yml` — Flyway config (compiled copy at `backend/target/classes/application.yml`).
- `backend/src/main/resources/graphql/schema.graphqls` — GraphQL schema (separate concern).
- `docker-compose.yml` — remove bad initdb mount.
- `Dockerfile.database` — pin MySQL version.
- `sync-schema.ps1` — GraphQL schema sync (keep).

**Verification**
1. Fresh MySQL container + app boot: Flyway creates schema from V1; app starts clean.
2. Existing OVH DB: apply with `baseline-on-migrate` → no data loss, `flyway_schema_history` created.
3. `mvn test` still green (tests use r2dbc-h2 / Testcontainers MySQL, independent of initdb).

**Decisions**
- Flyway over Liquibase (SQL-native, simpler, matches existing `schema.sql` style).
- Baseline existing prod DB rather than re-create.
- Excluded: backfilling/migrating existing row data (schema-only change).

**Further Considerations**
1. Future schema changes become `V2__*.sql`, `V3__*.sql` — document the naming convention in `docs/`.
2. Consider a `flyway validate` step in CI to catch drift.
