# Deployment Guide

This guide covers deploying the EDA Playground to OpenShift, MicroShift, or standard Kubernetes clusters.

## Prerequisites

- OpenShift 4.x, MicroShift, or Kubernetes 1.24+
- `oc` or `kubectl` CLI installed and configured
- Access to create resources in a namespace/project

## Quick Start (OpenShift/MicroShift)

### 1. Create Project/Namespace

```bash
oc new-project eda-playground
# OR for Kubernetes
kubectl create namespace eda-playground
```

### 2. Deploy Using Kustomize

```bash
# Update the image reference in deploy/k8s/overlays/openshift/kustomization.yaml first
# Replace GITHUB_USERNAME/REPO_NAME with your repository

oc apply -k deploy/k8s/overlays/openshift/
# OR for Kubernetes
kubectl apply -k deploy/k8s/overlays/openshift/
```

### 3. Access the Application

**OpenShift (Route):**
```bash
oc get route eda-playground -o jsonpath='{.spec.host}'
# Open: https://<route-host>
```

**Kubernetes (Ingress):**
```bash
# Edit deploy/k8s/overlays/openshift/ingress.yaml with your domain first
kubectl apply -f deploy/k8s/overlays/openshift/ingress.yaml
# Open: https://eda-playground.example.com
```

## Manual Deployment

### 1. Pull Container Image

The container image is automatically built and published to GitHub Container Registry on every push to `main`:

```bash
docker pull ghcr.io/bbgrimmett2/eda-playground:latest
```

Available tags:
- `latest` - Latest build from main branch
- `main-<SHA>` - Specific commit from main
- `devel` - Latest build from devel branch
- `v1.0.0` - Semantic version tags

### 2. Deploy Resources

```bash
# ConfigMap (optional - integrations are in the image)
oc apply -f deploy/k8s/overlays/openshift/configmap.yaml

# Deployment
oc apply -f deploy/k8s/overlays/openshift/deployment.yaml

# Service
oc apply -f deploy/k8s/overlays/openshift/service.yaml

# Route (OpenShift) OR Ingress (Kubernetes)
oc apply -f deploy/k8s/overlays/openshift/route.yaml
# OR
kubectl apply -f deploy/k8s/overlays/openshift/ingress.yaml
```

### 3. Verify Deployment

```bash
# Check pod status
oc get pods -l app=eda-playground

# View logs
oc logs -l app=eda-playground -f

# Test health endpoint
oc exec -it <pod-name> -- wget -qO- http://localhost:8080/health
```

## Configuration

### Environment Variables

Set in `deploy/k8s/overlays/openshift/deployment.yaml`:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Application environment |
| `PORT` | `8080` | HTTP port to listen on |

### Resource Limits

Default resource allocation:

```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

Adjust based on your usage in `deploy/k8s/overlays/openshift/deployment.yaml`.

### Custom Integrations

Integrations are built into the container image. To add custom integrations:

1. Create a ConfigMap with your integration files:
   ```bash
   kubectl create configmap eda-playground-integrations \
     --from-file=my-integration.json=./integrations/my-integration.json
   ```

2. The ConfigMap will be mounted at `/app/integrations/custom/`

3. Update the integration loader to scan the custom directory (requires code change)

## Health Checks

The application exposes a health endpoint at `/health`:

```bash
curl https://eda-playground.example.com/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-07-24T20:00:00.000Z",
  "environment": "production"
}
```

Health probes are configured in the Deployment:
- **Liveness:** Checks every 10s, restarts if 3 consecutive failures
- **Readiness:** Checks every 5s, removes from service if 3 consecutive failures
- **Startup:** Checks every 5s for up to 150s (30 failures × 5s)

## Scaling

Scale the deployment:

```bash
oc scale deploy/k8s/overlays/openshift/eda-playground --replicas=3
```

Note: The application is stateless and safe to scale horizontally.

## Updating

### Update to Latest Image

```bash
# Update deployment to use new image
oc set image deploy/k8s/overlays/openshift/eda-playground \
  eda-playground=ghcr.io/bbgrimmett2/eda-playground:v1.1.0

# OR trigger a rollout with latest tag
oc rollout restart deploy/k8s/overlays/openshift/eda-playground
```

### Rollback

```bash
# View rollout history
oc rollout history deploy/k8s/overlays/openshift/eda-playground

# Rollback to previous version
oc rollout undo deploy/k8s/overlays/openshift/eda-playground

# Rollback to specific revision
oc rollout undo deploy/k8s/overlays/openshift/eda-playground --to-revision=2
```

## Troubleshooting

### Pod Not Starting

Check pod events:
```bash
oc describe pod <pod-name>
```

Common issues:
- **ImagePullBackOff:** Check image name and ensure registry is accessible
- **CrashLoopBackOff:** Check logs with `oc logs <pod-name>`
- **OOMKilled:** Increase memory limits in deployment

### Application Errors

View application logs:
```bash
# Follow logs
oc logs -l app=eda-playground -f

# Last 100 lines
oc logs -l app=eda-playground --tail=100
```

### Network Issues

Test from within the cluster:
```bash
# Create a test pod
oc run -it --rm debug --image=curlimages/curl --restart=Never -- sh

# Test service
curl http://eda-playground.eda-playground.svc.cluster.local:8080/health
```

### Route/Ingress Not Working

**OpenShift Route:**
```bash
# Check route status
oc get route eda-playground -o yaml

# Test from outside cluster
curl -k https://$(oc get route eda-playground -o jsonpath='{.spec.host}')/health
```

**Kubernetes Ingress:**
```bash
# Check ingress status
kubectl describe ingress eda-playground

# Verify ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller
```

## Security

### Network Policies

Restrict network access (example):

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: eda-playground
spec:
  podSelector:
    matchLabels:
      app: eda-playground
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: openshift-ingress
      ports:
        - protocol: TCP
          port: 8080
  egress:
    - to:
        - namespaceSelector: {}
      ports:
        - protocol: TCP
          port: 443  # Allow HTTPS to EDA webhooks
    - to:
        - namespaceSelector:
            matchLabels:
              name: openshift-dns
      ports:
        - protocol: UDP
          port: 53
```

### RBAC

The application runs with the `default` service account and requires no special permissions.

For production, create a dedicated service account:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: eda-playground
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: eda-playground
rules: []  # No special permissions needed
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: eda-playground
subjects:
  - kind: ServiceAccount
    name: eda-playground
roleRef:
  kind: Role
  name: eda-playground
  apiGroup: rbac.authorization.k8s.io
```

Then update deployment:
```yaml
spec:
  template:
    spec:
      serviceAccountName: eda-playground
```

## Monitoring

### Metrics Collection

The application doesn't expose Prometheus metrics by default. To add monitoring:

1. Install Prometheus Operator
2. Create a ServiceMonitor:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: eda-playground
spec:
  selector:
    matchLabels:
      app: eda-playground
  endpoints:
    - port: http
      path: /metrics
      interval: 30s
```

3. Add metrics library to backend (future enhancement)

### Logging

Logs are written to stdout/stderr and captured by the container runtime.

**View in OpenShift Console:**
- Navigate to Workloads → Pods
- Select the pod
- Click "Logs" tab

**Centralized Logging:**
- OpenShift Logging Operator automatically collects logs
- Access via Kibana/OpenSearch dashboard
- Search for: `kubernetes.namespace_name:"eda-playground"`

## Uninstall

Remove all resources:

```bash
# Using Kustomize
oc delete -k deploy/k8s/overlays/openshift/

# OR manually
oc delete route eda-playground
oc delete service eda-playground
oc delete deployment eda-playground
oc delete configmap eda-playground-integrations

# Delete project/namespace
oc delete project eda-playground
```

## Additional Resources

- [OpenShift Documentation](https://docs.openshift.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Kustomize Documentation](https://kustomize.io/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
