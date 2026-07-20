## Plan: CI/CD Pipeline

TL;DR: There is currently **no CI/CD** in the repo (no `.github/workflows`, Jenkinsfile, or GitLab CI). Add GitHub Actions to build, test, scan images, and deploy backend/frontend to the OVH Kubernetes cluster. Each workflow is independently runnable so the work can be tracked separately.

**Steps**
- [x] Backend CI — `.github/workflows/backend-ci.yml`: checkout → setup JDK 25 (Temurin) → cache Maven → run `mvn -B test`. Tests use Testcontainers (MySQL) and r2dbc-h2, so the runner needs Docker (`actions/setup-java` + `docker` service or a `ubuntu` runner with Docker available). Upload Surefire reports as artifacts. *Depends on: nothing.*
- [x] Frontend CI — `.github/workflows/frontend-ci.yml`: checkout → setup Node 24.16 → `npm ci` → `npm run codegen` → `tsc -b` (typecheck) → `npm test` (vitest) → `npm run build`. *Parallel with step 1.*
- [x] Image build & scan — `.github/workflows/container-scan.yml`: build `Dockerfile.backend` and `Dockerfile.frontend`, run Trivy (or Grype) image scan, fail the job on HIGH/CRITICAL. *Parallel with steps 1–2.*
- [x] Deploy — `.github/workflows/deploy.yml` (manual `workflow_dispatch`): build & push images to `vq9701ff.c1.va1.container-registry.ovh.us/library/hotspotscampaigner-*` and `kubectl apply -f` the `ovhcloud-*.yaml` manifests. Store `ssl_cert/kubeconfig-9j736f.yml` and registry creds as encrypted secrets. *Depends on steps 1–3 (gated on green).*
- [x] Docs — add a CI/CD section + branch-protection guidance to `README.md` and `docs/Kubernetes_deployment_instructions.md`. *Parallel.*

**Relevant files**
- `backend/pom.xml` — Maven build/test entrypoint (Testcontainers MySQL, reactor-test).
- `frontend/package.json` — scripts: `codegen`, `test`, `build`.
- `Dockerfile.backend`, `Dockerfile.frontend` — image build contexts.
- `ovhcloud-*.yaml` — K8s manifests applied during deploy.
- `ssl_cert/kubeconfig-9j736f.yml`, `ssl_cert/ovhcloud-1.0.0.env.txt` — cluster access (store as secrets, do NOT commit).
- `.env.example` — documents required env vars.

**Verification**
1. Open a PR; confirm `backend-ci` and `frontend-ci` both green and `container-scan` reports no HIGH/CRITICAL.
2. Manually trigger `deploy` workflow against a staging namespace; `kubectl get pods -n battletech-campaigner` shows Running.
3. Smoke test the deployed URL (login + a GraphQL query).

**Decisions**
- GitHub Actions chosen (no existing CI, free for public/private). Pin all action versions by SHA/tag.
- Testcontainers requires Docker-in-runner; use `ubuntu-latest` with Docker available.
- Excluded: CD to production on every merge (kept manual/dispatch to avoid accidental prod pushes).

**Further Considerations**
1. Registry auth: OVH container registry credentials — store as GitHub Encrypted Secrets (recommended) vs. a deploy key.
2. Should image tags be the git SHA (recommended) or semantic versions?
