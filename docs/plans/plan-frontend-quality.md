## Plan: Frontend Quality & Tooling

TL;DR: The frontend lacks linting/formatting, contains scaffolding **junk test files**, has empty `services/` and `hooks/` folders (Apollo client is wired inside `App.tsx`), and no code-splitting. Add ESLint+Prettier, remove junk, expand tests, split the bundle, and centralize the API client.

**Steps**
- [x] Remove junk tests: delete `frontend/src/temp-vite.test.js`, `temp-vite.test.ts`, `temp-vite.test2.js`, `temp-vite-globals.test.js` — they are leftover scaffolding and pollute `npm test`. *Depends on: nothing.*
- [x] Add lint/format: add `eslint` + `typescript-eslint` + `prettier` (and `eslint-config-prettier`), create `eslint.config.js` and `.prettierrc`, and add `lint`/`format` scripts to `frontend/package.json`. Wire `npm run lint` into the frontend CI workflow. *Parallel with step 1.*
- [x] Expand tests: add a `frontend/vitest.config.ts` (none exists today; `setupTests.ts` is present but unreferenced by config) referencing `src/setupTests.ts`. Add component tests for `Login.tsx`, `LedgerEntryForm.tsx`, `CampaignGenerator.tsx` using `@testing-library/react` + `vitest`. Tests must import their GraphQL operations from the generated `src/types/operations.ts` (typed document nodes) rather than building raw `gql` template strings inline. *Depends on step 2 (lint clean).*
- [x] Code-splitting: lazy-load heavy views (`MarketView.tsx`, `CampaignTheaterView.tsx`, `GlobalIntelView.tsx`, `MercenaryRegistryView.tsx`) via `React.lazy` + `Suspense` in `App.tsx`/`MainDashboard.tsx` to shrink the initial bundle. *Parallel.*
- [x] Centralize API client: move the Apollo client construction (currently inline in `src/App.tsx`: `HttpLink` + `GraphQLWsLink` + `splitLink`) into `src/services/apollo.ts`; add `src/hooks/useUserProfile.ts` (the profile fetch logic in `App.tsx`) and any shared hooks. Populate the currently-empty `src/services` and `src/hooks` folders. All query/mutation documents (including the profile query moved into `useUserProfile.ts`) must be imported from the generated `src/types/operations.ts` — do not hand-write `gql` strings. *Parallel.*
- [x] Type-safety hygiene: `codegen.ts` already generates strict `src/types/generated.ts` + `src/types/operations.ts` from `../schema.graphqls`; keep `operations.ts` as the single source of queries (it already is) — every component, hook, and test imports its typed document nodes from `src/types/operations.ts`, never raw `gql` strings. Ensure CI runs `npm run codegen` before typecheck (already in `build`/`test`). *Parallel.*

**Relevant files**
- `frontend/package.json` — add lint/format scripts + devDeps.
- `frontend/src/temp-vite*.test.*` — delete (junk).
- `frontend/src/App.tsx` — extract Apollo client + profile hook.
- `frontend/src/services/` (empty) — add `apollo.ts`.
- `frontend/src/hooks/` (empty) — add `useUserProfile.ts` etc.
- `frontend/src/components/*.tsx` — lazy-load heavy views; add component tests.
- `frontend/codegen.ts`, `frontend/src/types/operations.ts`, `frontend/src/types/generated.ts` — keep generated.
- `frontend/src/setupTests.ts` — reference from new `vitest.config.ts`.
- `frontend/tsconfig.json` — already `strict` + `noUnusedLocals`/`noUnusedParameters` (good).

**Verification**
1. `npm run lint` exits 0; `npm run format -- --check` clean.
2. `npm test` runs only real tests (junk removed) and new component tests pass.
3. `npm run build` emits multiple chunks (code-split confirmed in build output).
4. Manual smoke: login flow, ledger entry, campaign generator still work.

**Decisions**
- Keep Apollo Client 4 (already adopted) — no migration to urql/TanStack Query.
- Excluded: component library / design-system refactor (out of scope).

**Further Considerations**
1. Add a `lint` job result gate in the frontend CI (see CI/CD plan).
2. Consider `eslint-plugin-react-hooks` + `eslint-plugin-jsx-a11y` for correctness/accessibility.
