# EDA Playground

A web-based playground for developing and testing Event-Driven Ansible (EDA) integrations. Select from common event sources, edit JSON payloads, and send test events to EDA webhooks with a single click.

![Status](https://img.shields.io/badge/status-mvp-green)
![License](https://img.shields.io/badge/license-Apache_2.0-blue)
[![Container](https://img.shields.io/badge/container-ghcr.io-blue)](https://github.com/BBGrimmett2/EDA-Playground/pkgs/container/eda-playground)

## Overview

This tool simplifies EDA plugin development by providing:

- **Pre-loaded Integration Library**: 7+ common event sources (Prometheus, ServiceNow, GitHub, Kafka, Splunk, SolarWinds)
- **Monaco Code Editor**: Syntax highlighting and validation for JSON payloads
- **PatternFly UI**: Familiar Ansible Automation Platform look and feel
- **Direct Webhook Testing**: Send events to EDA event streams with Bearer token auth
- **Extensible**: Easy-to-add new integrations via JSON definitions

## Architecture

```
React Frontend (PatternFly) ──> Express Backend ──> EDA Event Stream
                                      │
                                      └──> Integration Library (JSON)
```

**Technology Stack:**
- Frontend: React 18 + TypeScript + PatternFly 5/6
- Backend: Node.js 18+ + Express + TypeScript
- Deployment: OpenShift/MicroShift with Docker
- Integration Definitions: JSON with JSON Schema validation

## Project Status

**MVP Complete** ✅

**Phase 1: Foundation** ✅ Complete
- Project structure created
- Integration schema defined
- 7 core integrations implemented
- Validation tooling in place

**Phase 2: Backend Implementation** ✅ Complete
- Express API server with proxy endpoint
- Integration loader service
- REST endpoints for integrations
- CORS and error handling

**Phase 3: Frontend Implementation** ✅ Complete
- React + TypeScript + PatternFly UI
- Monaco code editor for JSON payloads
- State management with Context API
- Real-time validation and formatting

**Phase 4: Integration & Testing** ✅ Complete
- Proxy for CORS bypass
- Bearer token authentication
- End-to-end webhook testing
- Responsive layout

**Phase 5: Deployment** ✅ Complete
- Multi-stage Dockerfile
- GitHub Actions CI/CD
- OpenShift/Kubernetes manifests
- Comprehensive deployment documentation

## Quick Start

### Option 1: Docker Compose (Easiest for Local Testing)

```bash
cd deploy/compose
cp .env.example .env
docker-compose up -d

# Open http://localhost:8080
```

### Option 2: Deploy to OpenShift/MicroShift

```bash
# Deploy using Kustomize
oc new-project eda-playground
oc apply -k deploy/k8s/ocp/

# Get the route URL
oc get route eda-playground -o jsonpath='{.spec.host}'
```

### Option 3: Deploy to Kubernetes

```bash
kubectl create namespace eda-playground
kubectl apply -k deploy/k8s/overlays/kubernetes/
```

See [docs/deployment-guide.md](docs/deployment-guide.md) for detailed deployment instructions.

### Option 3: Development Mode

**Backend:**
```bash
cd backend
npm install
npm run validate-integrations  # Validate all integration definitions
npm run dev                     # Start on http://localhost:3001
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev                     # Start on http://localhost:5173
```

### Available Integrations

| Integration | Category | Description |
|------------|----------|-------------|
| Generic Webhook | generic | Customizable webhook for testing |
| Prometheus Alertmanager | monitoring | Alert notifications with firing/resolved status |
| ServiceNow Incident | ticketing | ITSM incident events |
| GitHub Push Event | scm | Git push webhooks for CI/CD |
| Kafka Event Message | messaging | Event streaming messages |
| Splunk ITSI | monitoring | IT Service Intelligence notable events |
| SolarWinds Alert | monitoring | Infrastructure monitoring alerts |

## Usage

1. **Select an Integration**: Choose from pre-loaded event sources in the dropdown
2. **Edit Payload**: Modify the JSON payload using the Monaco editor
3. **Configure Connection**: Enter your EDA event stream URL and authentication token
4. **Send Event**: Click "Send Event" to POST to the webhook
5. **View Response**: Check the response status and body

## Container Images

Container images are automatically built and published to GitHub Container Registry on every push to `main`:

```bash
# Pull latest
docker pull ghcr.io/bbgrimmett2/eda-playground:latest

# Pull specific version
docker pull ghcr.io/bbgrimmett2/eda-playground:v1.0.0
```

**Available Tags:**
- `latest` - Latest build from main branch
- `main-<SHA>` - Specific commit
- `devel` - Development branch
- `v*.*.*` - Semantic version releases

## Adding New Integrations

**Quick steps:**

1. Create integration file: `backend/integrations/<category>/<id>.json`
2. Follow the schema in `backend/integrations/schema.json`
3. Add entry to `backend/integrations/index.json`
4. Run `npm run validate-integrations`
5. Rebuild container or restart dev server

Example integration structure:
```json
{
  "id": "my-integration",
  "name": "My Integration",
  "category": "monitoring",
  "description": "Description of the integration",
  "authTypes": ["bearer", "none"],
  "defaultAuthType": "bearer",
  "examplePayload": {
    "event_type": "alert",
    "message": "Example event"
  }
}
```

## Contributing

This project follows the Ansible Code of Conduct.

## License

Apache License 2.0

---

**Built with ❤️ for the Ansible community**