## Explanation and Usage Notes:

1. __Namespace__ (`battletech-campaigner`): All resources are deployed into this dedicated namespace.
1. __Database__ (Managed MySQL): 
    * The application uses an external Managed MySQL instance (e.g., OVHcloud Managed Database). 
    * Connection details are stored in `ovhcloud-db-secret.yaml` (`MYSQL_USER`, `MYSQL_PASSWORD`) and `ovhcloud-backend-configmap.yaml` (`MYSQL_HOST`, `MYSQL_PORT`, etc.).
1. __Backend__ (`ovhcloud-backend-deployment.yaml`):
    * Configured for Spring Boot 3 with Reactive Stack (R2DBC).
    * Environment variables `SERVER_FORWARD_HEADERS_STRATEGY=native` and `SERVER_SERVLET_SESSION_COOKIE_SECURE=true` are required to support OAuth2 behind the Nginx Ingress.
    * `CORS_ALLOWED_ORIGINS` is mapped from the public frontend URL.
1. __Frontend__ (`ovhcloud-frontend-deployment.yaml`):
    * React application served by Nginx.
    * Environment variable `VITE_API_BASE_URL` is set to `/api` to route API calls through the ingress.
1. __Ingress__ (Split Strategy):
    * `ovhcloud-backend-ingress.yaml`: Handles `/api` routes with `nginx.ingress.kubernetes.io/rewrite-target: /$2` to strip the prefix before reaching the backend.
    * `ovhcloud-frontend-ingress.yaml`: Handles the root path (`/`) and specifically routes `/login/oauth2/code` and `/oauth2/authorization` to the backend without rewrites to preserve OAuth2 paths.
    * TLS is managed via the `hotspotscampaigner-tls` secret.

## Before Applying:

1. __Prepare the Environment:__ Ensure your `ovhcloud-1.0.0.env` (or similar) contains the correct image digests and credentials.
1. __SSL/TLS Certificate Generation:__
    Generate a CSR for your domain:
    ```bash
    docker run --rm -v "%cd%":/export alpine sh -c "apk add --no-cache openssl && openssl req -new -newkey rsa:2048 -nodes -keyout /export/private.key -out /export/request.csr -subj '/C=US/ST=Utah/L=St. George/O=HotSpots Campaigner/CN=hotspotscampaigner.app' -addext 'subjectAltName=DNS:hotspotscampaigner.app,DNS:*.hotspotscampaigner.app'"
    ```
    After receiving your certificate files (e.g., from Sectigo/OVH), concatenate them into a full chain:
    ```bash
    type your_domain.crt intermediate.crt root.crt > fullchain.pem
    ```
    Create the Kubernetes TLS secret:
    ```bash
    kubectl create secret tls hotspotscampaigner-tls --cert=fullchain.pem --key=private.key -n battletech-campaigner
    ```
1. __Ingress Controller:__ Ensure the Nginx Ingress Controller is installed:
    ```bash
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.1/deploy/static/provider/cloud/deploy.yaml
    ```

## Deployment Steps:

Apply the resources in the following order to resolve dependencies:

1. __Create the Namespace:__
    ```bash
    kubectl apply -f ovhcloud-namespace.yaml
    ```

2. __Deploy Secrets and ConfigMaps:__
    ```bash
    kubectl apply -f ovhcloud-google-secret.yaml
    kubectl apply -f ovhcloud-db-secret.yaml
    kubectl apply -f ovhcloud-backend-configmap.yaml
    kubectl apply -f ovhcloud-frontend-configmap.yaml
    ```

3. __Deploy Workloads:__
    ```bash
    kubectl apply -f ovhcloud-backend-deployment.yaml
    kubectl apply -f ovhcloud-frontend-deployment.yaml
    ```

4. __Apply Routing (Ingress):__
    ```bash
    kubectl apply -f ovhcloud-frontend-ingress.yaml
    kubectl apply -f ovhcloud-backend-ingress.yaml
    ```

## Environment Configuration Reference

The following variables are expected in your `.env` file for template substitution (if using `envsubst`) or direct secret creation:

```dotenv
MYSQL_USER=campaigner_db_user
MYSQL_PASSWORD=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
BACKEND_IMAGE=...
FRONTEND_IMAGE=...
DOMAIN_NAME=hotspotscampaigner.app
```

### Backend Configuration Highlights (`backend-config`):

| Key | Value | Description |
| :--- | :--- | :--- |
| `MYSQL_HOST` | `mysql-...ovh.us` | Managed MySQL hostname. |
| `FRONTEND_PUBLIC_URL` | `https://hotspotscampaigner.app` | Used for CORS and OAuth redirects. |
| `SERVER_FORWARD_HEADERS_STRATEGY` | `native` | Required for Ingress SSL termination. |
| `SERVER_SERVLET_SESSION_COOKIE_SECURE` | `true` | Required for HTTPS session cookies. |

## Troubleshooting OAuth2

If the "Federated Login" button redirects back to the home page without logging in:
1.  **Check Redirect URIs**: Ensure `https://hotspotscampaigner.app/login/oauth2/code/google` is authorized in the Google Cloud Console.
2.  **Verify Ingress Routing**: Ensure the `frontend-ingress` specifically routes `/login/oauth2/code` to the `backend-service` without using the rewrite-target annotation.
3.  **Logs**: Check backend logs for `state` mismatches or `redirect_uri` mismatches:
    ```bash
    kubectl logs -l app=backend -n battletech-campaigner
    ```

## CI/CD (GitHub Actions)

Images are built and deployed via the workflows in `.github/workflows/`:

- **`container-scan.yml`** — builds both images and runs Trivy; fails on HIGH/CRITICAL.
- **`deploy.yml`** — manual `workflow_dispatch`; builds/pushes to `vq9701ff.c1.va1.container-registry.ovh.us/library/hotspotscampaigner-{backend,frontend}:<git-sha>` and applies the `ovhcloud-*.yaml` manifests.

### Frontend API base URL

The frontend is compiled with `VITE_API_BASE_URL` baked in at build time. For Kubernetes the CI builds with an **empty** value, so the SPA uses the same-origin `/api` prefix and relies on the ingress to route to the backend. This is handled automatically by the workflows — there is no need to edit `Dockerfile.frontend` per environment.

### Required secrets

Store these as GitHub Encrypted Secrets (never commit them):

- `OVH_REGISTRY_USERNAME`, `OVH_REGISTRY_PASSWORD` — OVH container registry auth.
- `KUBE_CONFIG` — the kubeconfig from `ssl_cert/kubeconfig-*.yml`.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — consumed by `ovhcloud-google-secret.yaml`.

### Deploying

1.  Open the **Actions → Deploy to OVH Kubernetes** workflow.
2.  Click **Run workflow**, choose the target namespace (default `battletech-campaigner`).
3.  Wait for the rollout; verify with:
    ```bash
    kubectl -n battletech-campaigner get pods
    kubectl -n battletech-campaigner rollout status deployment/frontend-deployment
    kubectl -n battletech-campaigner rollout status deployment/backend-deployment
    ```
