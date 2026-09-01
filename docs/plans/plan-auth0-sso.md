# Plan: Multi-Provider SSO via Auth0 + Existing-User Migration

## Overview

Replace the single direct-Google OAuth2 registration with Auth0 as one OIDC
provider that brokers many social logins (Google, Microsoft, GitHub, Apple,
LinkedIn, etc. — each is a dashboard toggle, no per-provider keys). Keep the
existing Spring Security session-cookie model; no JWT migration.
Migrate existing Google-keyed users lazily at first Auth0 login via verified-email matching.

- [x] Phase 1: Auth0 setup
- [x] Phase 2: Backend provider config
- [x] Phase 3: Existing-user migration
- [x] Phase 4: Frontend login update
- [x] Phase 5: Deployment config
- [x] Phase 6: Tests & verification

> **Implementation status (2026-08-23)**: All code changes complete. Backend suite: 167/176 pass;
> the 9 errors are Testcontainers Docker image-pull failures (`mysql:8.0.x` unavailable in local
> Docker), unrelated to this change. Frontend Login tests pass.
> Remaining manual steps: create the Auth0 tenant/application, enable social connections, fill in
> `AUTH0_*` values in `.env` and `ssl_cert/ovhcloud-auth0-secret.yaml`, then apply the secret to
> the cluster.

## Steps

### Phase 1: Auth0 setup (manual)

1. Create Auth0 tenant + "Regular Web Application"; note domain, client ID, secret.
2. Enable desired social connections from the dashboard.

### Phase 2: Backend config

1. `backend/src/main/resources/application.yml` (+ test copy):
   - Replace `registration.google` with `registration.auth0`
     (`AUTH0_CLIENT_ID` / `AUTH0_CLIENT_SECRET`, scope `[openid, profile, email]`,
     redirect-uri `{baseUrl}/login/oauth2/code/{registrationId}`).
   - Add `provider.auth0` with `issuer-uri: https://${AUTH0_DOMAIN}/`
     (endpoint auto-discovery); user-name-attribute `sub`.
   - Optionally keep google registration behind an env flag during transition.

### Phase 3: Existing-user migration (lazy email linking)

Existing users are keyed by raw Google `sub` in `app_users.external_id`;
Auth0 identities arrive as `google-oauth2|<sub>` / `auth0|<sub>`.

1. `backend/src/main/java/com/hotspotscamp/repository/UserRepository.java`:
   add `Mono<User> findByEmail(String email)`.
2. `backend/src/main/java/com/hotspotscamp/service/UserService.java` — new overload
   `resolveOrCreateUser(String identity, String role, String email)`:
   - After external-ID lookup misses (before UUID fallback / new-user creation),
     if email non-blank → `findByEmail(email)`.
   - Found → link account: set `externalId = identity`, `setNew(false)`, save
     (project upsert pattern), log `[AUTH] Migrated legacy user ... to Auth0 identity`.
   - Not found → create new user as today, also persisting `email`.
   - Keep existing 2-arg overload delegating with null email so invite-token flows unaffected.
3. Callers pass the verified email attribute where an OAuth2User is available:
   `UserGraphQLController.userProfile`, `CampaignGraphQLController`.
4. Safety: exact lowercase email match; warn on multiple matches
   (optionally add unique index on email via Flyway).

### Phase 4: Frontend

1. `frontend/src/components/Login.tsx`: redirect `/login/oauth2/authorization/google`
   → `/login/oauth2/authorization/auth0`; update button label.
2. Update `frontend/src/tests/Login.test.tsx`.

### Phase 5: Deployment config

1. `.env.example`: add `AUTH0_DOMAIN` / `AUTH0_CLIENT_ID` / `AUTH0_CLIENT_SECRET`;
   update `OAUTH_REDIRECT_URI`.
2. `docker-compose.yml`: pass new env vars; fix hardcoded GOOGLE redirect-uri override.
3. K8s: `ovhcloud-backend-deployment.yaml` — swap google-secret refs for auth0 secret;
   create `ssl_cert/ovhcloud-auth0-secret.yaml` analog.
4. Verify ingress routes `/login/oauth2/*` + `/oauth2/authorization` to backend
   without rewrite (see docs/plans/plan-security.md).

### Phase 6: Tests

1. Unit tests for UserService migration path (found / not-found / no-email cases).
2. Update inline OAuth props in `CampaignE2ETest.java`.

## Verification

1. docker-compose up → login redirects to Auth0 Universal Login → sign in via two
   different providers → session cookie set, GraphQL profile resolves correctly.
2. Migration test: seed row with `external_id = <google-sub>` + matching email →
   login via Auth0 → same internal UUID returned, `external_id` rewritten to
   `google-oauth2|...`.
3. New user with no legacy record → created fresh with email persisted.
4. Backend `mvn test` green; frontend vitest green.

## Decisions

- Auth0 over Keycloak (no self-hosting) and native multi-provider (no per-provider setup).
- Session-cookie model retained; JWT explicitly out of scope.
- Lazy migration at login (no batch script); email match trusted as IdP-verified claim.
