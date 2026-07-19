## Plan: Security Hardening

TL;DR: Close three classes of gaps — (a) ad-hoc/resolver-level authorization with a reactive-transaction bug, (b) containers running as **root**, (c) Kubernetes workloads missing probes/securityContext and conflicting Ingress manifests. Harden without changing the session-cookie OAuth model.

**Steps**
- [ ] Centralize authorization: `config/SecurityConfig.java` currently does `.pathMatchers("/graphql").permitAll()` and lets each resolver enforce ownership (e.g., `service/LedgerService.addLedgerEntry` calls `isAuthorizedForCommand`). Introduce a GraphQL `Instrumentation`/`DataFetcher` interceptor (or an `@Secured`-style aspect) that resolves the `Principal` and checks entity ownership consistently. Audit every `*GraphQLController` method; confirm public queries (`publicActiveCampaigns`, `publicCampaignMetadata`, `publicPreviewCampaign`) are intentionally open. *Depends on: nothing.*
- [x] Fix reactive transaction bug: `service/LedgerService.java` (and any other service) uses `@Transactional` on `Mono`-returning methods. Spring's `@Transactional` does **not** participate in the Reactor context, so these transactions are not actually applied. Replace with `TransactionalOperator` (R2DBC) or `DatabaseClient` transactional API. Grep `service/` for `@Transactional` and convert each. *Depends on step 1 (audit together).*
- [x] Non-root containers: in `Dockerfile.backend` (runtime `eclipse-temurin:25-jre-alpine`) and `Dockerfile.frontend` (runtime `node:24.16.0-alpine` running `serve`), add a non-root `addgroup`/`adduser` and a `USER` directive; ensure the app listens on a port >1024 and `cap_drop: ALL` where possible. *Parallel with step 1.*
- [x] K8s probes & securityContext: add `livenessProbe`/`readinessProbe` (HTTP GET `/actuator/health/liveness` and `/readiness` — see Observability plan) to `ovhcloud-backend-deployment.yaml` and `ovhcloud-frontend-deployment.yaml`. Add `securityContext` (`runAsNonRoot: true`, `readOnlyRootFilesystem` where feasible, `allowPrivilegeEscalation: false`, drop `ALL` capabilities) and a `PodDisruptionBudget`. *Depends on Observability plan for probe endpoints; can stub with TCP/port probe first.*
- [x] Clean up Ingress manifests: the unused `ovhcloud-ingress.yaml` (`app-ingress`, no `host`, catch-all) has already been **deleted** by the user. Keep the frontend and backend Ingress YAMLs **separate** (do not merge them into one file): `ovhcloud-backend-ingress.yaml` (`/api` rewrite) and `ovhcloud-frontend-ingress.yaml` (host `hotspotscampaigner.app`). Review each remaining manifest for correctness — confirm the backend ingress strips the `/api` prefix (`nginx.ingress.kubernetes.io/rewrite-target: /$2`) and the frontend ingress routes `/login/oauth2/code` + `/oauth2/authorization` to the backend-service without rewrite. Remove any stale/duplicate path rules. *Parallel.*
- [x] Error sanitization: `api/GlobalErrorWebExceptionHandler.java` returns raw `ErrorAttributes` (can leak stack traces/ internals). Map to a safe error envelope (status + code + message only) and avoid detailed bodies in production. *Parallel with step 1.*
- [x] CORS review: `SecurityConfig.corsConfigurationSource` splits `CORS_ALLOWED_ORIGINS` by comma with `allowCredentials=true`. Ensure no `*` origin and document the allowed list; consider a strict `allowedOrigins` from config. *Parallel.*

**Relevant files**
- `backend/src/main/java/com/hotspotscamp/config/SecurityConfig.java` — permitAll + CORS.
- `backend/src/main/java/com/hotspotscamp/api/*GraphQLController.java` — per-resolver authz to audit.
- `backend/src/main/java/com/hotspotscamp/service/LedgerService.java` (and other `@Transactional` services) — reactive tx fix.
- `backend/src/main/java/com/hotspotscamp/api/GlobalErrorWebExceptionHandler.java` — error envelope.
- `Dockerfile.backend`, `Dockerfile.frontend` — non-root USER.
- `ovhcloud-backend-deployment.yaml`, `ovhcloud-frontend-deployment.yaml` — probes + securityContext.
- `ovhcloud-backend-ingress.yaml`, `ovhcloud-frontend-ingress.yaml` — keep separate; review/clean path rules (`ovhcloud-ingress.yaml` already deleted).

**Verification**
1. Extend `backend/src/test/java/com/hotspotscamp/api/CommandSecurityIntegrationTest.java` (and add resolver authz tests) — unauthorized calls return 401/error.
2. `kubectl exec <pod> -- id` shows non-root UID; `kubectl describe pod` shows probes Ready.
3. `curl` the GraphQL endpoint with no session → protected mutations rejected; public queries still work.
4. Confirm no stack traces in error responses.

**Decisions**
- Keep session-cookie OAuth2 model (works behind Nginx ingress with `SERVER_FORWARD_HEADERS_STRATEGY=native`).
- `jjwt` is already a dependency but appears unused — out of scope unless JWT bearer is desired later.
- Excluded: introducing a service mesh / mTLS (future consideration).

**Further Considerations**
1. Add a `NetworkPolicy` to restrict pod-to-pod traffic (DB only reachable from backend).
2. Consider an `HorizontalPodAutoscaler` for backend on CPU.
