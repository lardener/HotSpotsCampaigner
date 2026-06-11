## Explanation and Usage Notes:

1. __Namespace__ (hotspotscampaigner): All resources are deployed into a dedicated namespace for better organization and isolation.
1. __MySQL__ (mysql-credentials, mysql-pvc, mysql-statefulset, mysql-service):
    * A Secret stores the MySQL credentials. Remember to change MYSQL_ROOT_PASSWORD to a strong, unique password.
    * A PersistentVolumeClaim requests storage for MySQL data, ensuring data persistence across pod restarts. You'll need a StorageClass configured in your Kubernetes cluster for this to provision a volume.
    * A StatefulSet is used for MySQL to provide stable network identifiers and persistent storage.
    * A Service exposes MySQL internally to other pods in the cluster.
1. __Backend__ (backend-google-oauth-secrets, backend-config, backend-deployment, backend-service):
    * backend-google-oauth-secrets: A Secret for your Google OAuth client ID and secret. Update these placeholders with your actual credentials.
    * backend-config: A ConfigMap holds non-sensitive configuration like the R2DBC URL for MySQL and Kafka bootstrap servers.
    * backend-deployment: Deploys your Spring Boot application.
        * Image: hotspotscampaigner/backend:latest is a placeholder. You'll need to build your Spring Boot application into a Docker image and push it to a registry accessible by your Kubernetes cluster.
        * Environment Variables: These are populated from the ConfigMap and Secret.
        * Probes: Basic livenessProbe and readinessProbe are included for health checks.
        * Resources: Basic CPU and memory requests/limits are set. Adjust these based on your application's actual needs.
    * backend-service: Exposes the backend application internally.
1. __Frontend__ (frontend-config, frontend-deployment, frontend-service):
    * frontend-config: A ConfigMap for frontend environment variables, such as the GraphQL API URL. It's configured to use a relative path /api/graphql, assuming the Ingress will handle routing.
    * frontend-deployment: Deploys your React application, typically served by Nginx.
        * Image: hotspotscampaigner/frontend:latest is a placeholder. You'll need to build your React application into a Docker image (e.g., using Nginx to serve the static build files) and push it to a registry.
    * frontend-service: Exposes the frontend application internally.
1. __Ingress__ (hotspotscampaigner-ingress):
    * This resource manages external access to your services.
    * host: your-domain.com: IMPORTANT: Replace your-domain.com with your actual domain if you're deploying to a public environment. For local testing (e.g., Minikube), you might remove the host field or configure your /etc/hosts file.
    * TLS: The tls section is commented out. Uncomment and configure it if you want to enable HTTPS with cert-manager or similar.
    * Rules:
        * Requests to /api/graphql are routed to the backend service.
        * All other requests (/) are routed to the frontend service.
    * Annotations: Example annotations for Nginx Ingress Controller and cert-manager are provided. You might need to adjust these based on your specific Ingress Controller.

### Before Applying:

1. __Build Docker Images:__ Ensure you have Docker images for your backend and frontend applications, and they are pushed to a registry accessible by your Kubernetes cluster. Update the image fields accordingly.
1. __Update Secrets:__ Change the placeholder values for MYSQL_ROOT_PASSWORD, GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET to your actual, secure values.
1. __Configure Ingress Host:__ If deploying to a public domain, update your-domain.com in the Ingress resource. Ensure your domain's DNS points to your Ingress Controller's external IP.
1. __StorageClass:__ Ensure your Kubernetes cluster has a default StorageClass configured, or specify one in the mysql-pvc if needed.
1. __Ingress Controller:__ Make sure an Ingress Controller (e.g., Nginx Ingress Controller) is installed in your cluster.

#### To apply this file to your Kubernetes cluster, save it as kubernetes-deployment.yaml and run:
```bash
kubectl apply -f kubernetes-deployment.yaml
```