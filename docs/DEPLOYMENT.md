# Deployment Guide

This document describes how to use GitHub Actions to deploy new versions of the HotSpots: Campaigner application to the OVHcloud Managed Kubernetes (MKS) cluster.

## Overview

The deployment process is manual and is triggered via the `deploy.yml` workflow. It follows a "Build -> Push -> Apply Manifests" pattern, ensuring that every deployment is tied to a specific Git commit SHA for traceability and easy rollbacks.

## Prerequisites: Required GitHub Secrets

Before the first deployment, the following secrets must be configured in your GitHub repository settings (**Settings > Secrets and variables > Actions**):

| Secret Name             | Description                                                                                                        |
| :---------------------- | :----------------------------------------------------------------------------------------------------------------- |
| `OVH_REGISTRY_USERNAME` | Username for the OVH Container Registry (`vq9701ff.c1.va1.container-registry.ovh.us/library`).                     |
| `OVH_REGISTRY_PASSWORD` | Password for the OVH Container Registry.                                                                           |
| `KUBE_CONFIG`           | The full text content of your Kubernetes configuration file (e.g., the file found in `ssl_cert/kubeconfig-*.yml`). |

> **Note:** Ensure that the identity configured in the `KUBE_CONFIG` has sufficient permissions to manage resources in the target namespace.

## How to Trigger a Deployment

Deployments are not automatic on push to `main` to prevent accidental production changes. They must be triggered manually:

1.  Navigate to the **Actions** tab in the GitHub repository.
2.  On the left sidebar, select the **Deploy to OVH Kubernetes** workflow.
3.  Click the **Run workflow** button in the top right.
4.  In the **Target namespace** input, enter the desired Kubernetes namespace (e.g., `battletech-campaigner`).
5.  Click **Run workflow**.

## Workflow Steps

When a deployment is triggered, the following steps are executed:

### 1. Build & Push Images

The workflow builds two Docker images using the current Git SHA (`${{ github.sha }}`) as the unique tag:

- **Backend:** `hotspotscampaigner-backend:<git-sha>`
- **Frontend:** `hotspotscampaigner-frontend:<git-sha>`

**Note on Frontend Configuration:** The frontend is built with an empty `VITE_API_BASE_URL`. This instructs the React application to use relative paths (e.g., `/api/...`), which are then routed to the backend by the NGINX Ingress. This avoids hardcoding URLs and ensures the app works seamlessly within the Kubernetes networking.

### 2. Update Kubernetes Manifests

The workflow dynamically updates the image tags in the following files before applying them:

- `ovhcloud-backend-deployment.yaml`
- `ovhcloud-frontend-deployment.yaml`

This is done using `sed` during the CI run so that the manifests in the repository remain generic.

### 3. Apply Manifests

The following resources are applied to the cluster via `kubectl`:

- **Namespace:** `ovhcloud-namespace.yaml`
- **ConfigMaps:** `ovhcloud-backend-configmap.yaml`, `ovhcloud-frontend-configmap.yaml`
- **Secrets:** `ovhcloud-backend-secret.yaml`, `ovhcloud-google-secret.yaml`
- **Deployments:** `ovhcloud-backend-deployment.yaml`, `ovhcloud-frontend-deployment.yaml`
- **Ingress:** `ovhcloud-backend-ingress.yaml`, `ovhcloud-frontend-ingress.yaml`, `ovhcloud-ingress.yaml`

### 4. Rollout Verification

The workflow monitors the rollout of both the backend and frontend deployments. The job will only be marked as successful if both deployments reach a "Ready" state within 300 seconds.

## Troubleshooting

If a deployment fails:

1.  **Check GitHub Action Logs:** Look at the specific step that failed (e.g., `Build & push` or `Apply Kubernetes manifests`) to identify the error.
2.  **Verify Registry Access:** Ensure `OVH_REGISTRY_USERNAME` and `OVH_REGISTRY_PASSWORD` are correct and have upload permissions.
3.  **Check Kubernetes Status:** If the workflow times out during "Wait for rollout", log in to the cluster and check the deployment status manually:
    ```bash
    kubectl rollout status deployment/backend-deployment -n <your-namespace>
    kubectl get pods -n <your-namespace>
    ```
4.  **Inspect Logs:** If pods are crashing, check the container logs:
    ```bash
    kubectl logs deployment/backend-deployment -n <your-namespace>
    ```

## Configuration & Secrets Summary

| Component          | Configuration Source | Secret/Config Name                               |
| :----------------- | :------------------- | :----------------------------------------------- |
| **Backend**        | K8s Secret           | `ovhcloud-backend-secret.yaml`                   |
|                    | K8s Secret           | `ovhcloud-google-secret.yaml` (Google OAuth)     |
|                    | K8s ConfigMap        | `ovhcloud-backend-configmap.yaml`                |
| **Frontend**       | K8s ConfigMap        | `ovhcloud-frontend-configmap.yaml`               |
| **Infrastructure** | K8s Namespace        | `ovhcloud-namespace.yaml`                        |
|                    | K8s Ingress          | `ovhcloud-ingress.yaml` (and component-specific) |
