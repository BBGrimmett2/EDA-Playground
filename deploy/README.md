# Deployment Options

This directory contains deployment configurations for different environments.

## Directory Structure

```
deploy/
├── k8s/                    # Kubernetes/OpenShift manifests
│   ├── base/              # Base resources (all platforms)
│   │   ├── configmap.yaml
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── kustomization.yaml
│   ├── ocp/               # OpenShift/MicroShift (short path)
│   │   ├── route.yaml
│   │   └── kustomization.yaml
│   └── overlays/
│       ├── openshift/     # OpenShift (alternative path)
│       │   ├── route.yaml
│       │   └── kustomization.yaml
│       └── kubernetes/    # Vanilla K8s (Ingress)
│           ├── ingress.yaml
│           └── kustomization.yaml
├── compose/               # Docker Compose for local testing
│   ├── docker-compose.yml
│   └── .env.example
└── README.md             # This file
```

## Quick Start

### Option 1: Docker Compose (Local Testing)

```bash
cd deploy/compose

# Copy environment file
cp .env.example .env

# Edit .env if needed (e.g., change HOST_PORT)
vim .env

# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Access at http://localhost:8080
```

**Stopping:**
```bash
docker-compose down
```

**Rebuilding after code changes:**
```bash
docker-compose up -d --build
```

### Option 2: OpenShift/MicroShift

```bash
# Create project
oc new-project eda-playground

# Deploy using Kustomize (short path)
oc apply -k deploy/k8s/ocp/

# OR use the overlays path
# oc apply -k deploy/k8s/overlays/openshift/

# Get the route
oc get route eda-playground -o jsonpath='{.spec.host}'
```

### Option 3: Kubernetes (with Ingress)

```bash
# Create namespace
kubectl create namespace eda-playground

# Deploy using Kustomize
kubectl apply -k deploy/k8s/overlays/kubernetes/

# Get the ingress
kubectl get ingress -n eda-playground
```

## Configuration

### Docker Compose

Edit `compose/.env` to customize:
- `HOST_PORT` - Port to expose on host (default: 8080)

### Kubernetes/OpenShift

Before deploying, update image reference in `k8s/base/kustomization.yaml`:

```yaml
images:
  - name: ghcr.io/bbgrimmett2/eda-playground
    newTag: latest
```

Replace `GITHUB_USERNAME/REPO_NAME` with your actual repository.

### Environment Variables

The container accepts these environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Application environment |
| `PORT` | `8080` | HTTP port to listen on |

## Custom Integrations

### Docker Compose

Uncomment the volumes section in `compose/docker-compose.yml`:

```yaml
volumes:
  - ./integrations:/app/integrations/custom:ro
```

Then create `compose/integrations/` directory and add your JSON files.

### Kubernetes

Create a ConfigMap with your integration files:

```bash
kubectl create configmap eda-playground-integrations \
  --from-file=my-integration.json=./my-integration.json \
  -n eda-playground
```

The deployment will automatically mount ConfigMaps at `/app/integrations/custom/`.

## Updating

### Docker Compose

```bash
cd deploy/compose

# Pull latest image
docker-compose pull

# Restart
docker-compose up -d
```

### Kubernetes/OpenShift

```bash
# Update to specific version
cd deploy/k8s/base
kustomize edit set image ghcr.io/bbgrimmett2/eda-playground:v1.1.0

# Apply changes
oc apply -k ../overlays/openshift/
```

## Troubleshooting

### Docker Compose

**Check logs:**
```bash
docker-compose logs -f
```

**Check health:**
```bash
curl http://localhost:8080/health
```

**Restart:**
```bash
docker-compose restart
```

### Kubernetes/OpenShift

See the main [Deployment Guide](../../docs/deployment-guide.md) for detailed troubleshooting.

## See Also

- [Main Deployment Guide](../../docs/deployment-guide.md) - Comprehensive deployment documentation
- [README](../../README.md) - Project overview
