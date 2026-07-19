# HotSpots Campaigner — Engineering Upgrade Plans (Index)

This folder contains separate, independently-trackable plan files for the engineering upgrades agreed with the user. Each can be implemented and reviewed on its own branch/PR.

## Areas & Files
1. [ ] **CI/CD Pipeline** → `plan-cicd.md` — no CI exists today; add GitHub Actions (build/test/scan/deploy).
2. [x] **Database Migrations** → `plan-db-migrations.md` — replace destructive `schema.sql` (drops all tables) with versioned Flyway migrations.
3. [ ] **Security Hardening** → `plan-security.md` — centralize resolver authz, fix reactive `@Transactional` bug, non-root containers, K8s probes/securityContext, consolidate Ingress. *(Steps 2–7 done; step 1 authz interceptor pending.)*
4. [ ] **Observability** → `plan-observability.md` — add Actuator + Micrometer/Prometheus, quiet logs, structured logging, safe error envelope.
5. [ ] **Frontend Quality** → `plan-frontend-quality.md` — ESLint/Prettier, remove junk test files, expand tests, code-splitting, centralize Apollo client.

## Suggested Execution Order (dependencies)
- Phase A (independent, can run in parallel): CI/CD, DB Migrations, Frontend Quality.
- Phase B (depends on A/others): Security Hardening (probes depend on Observability endpoints; authz audit standalone).
- Phase C: Observability (probe endpoints consumed by Security plan's K8s probes).

## Cross-cutting Notes
- `Dockerfile.database` uses unpinned `mysql:latest` — pin in DB Migrations plan.
- `docker-compose.yml` mounts the GraphQL schema as `schema.sql` into initdb — removed in DB Migrations plan (Flyway takes over).
- Three conflicting Ingress manifests — consolidated in Security plan.
- `jjwt` dependency is present but unused — noted, out of scope unless JWT bearer is wanted.
- All plans keep the existing session-cookie OAuth2 + R2DBC reactive architecture; no framework rewrites.

## Verification (global)
- Each plan lists its own verification steps. After all phases: `docker compose up --build` works, `mvn test` + `npm test` green in CI, K8s pods Ready with probes, no root containers, metrics endpoint live.
