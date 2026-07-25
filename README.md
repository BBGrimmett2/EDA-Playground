# EDA Playground

**A web-based development tool for testing Event-Driven Ansible integrations**

Send realistic test events to your EDA webhooks without writing code. Select from pre-built integration templates, customize JSON payloads, and validate your automation workflows—all from a browser.

![Status](https://img.shields.io/badge/status-mvp-green)
![License](https://img.shields.io/badge/license-Apache_2.0-blue)
[![Container](https://img.shields.io/badge/container-ghcr.io-blue)](https://github.com/BBGrimmett2/EDA-Playground/pkgs/container/eda-playground)

---

## Why EDA Playground?

Developing Event-Driven Ansible integrations requires repeatedly sending test events to validate rulebook logic. Instead of:
- Manually crafting JSON payloads from documentation
- Writing scripts to simulate webhook calls
- Configuring authentication for each test

---

## Features

<!-- I would like to add the OAuth to AAP in this as well -->
- **Integration Library**: Prometheus, ServiceNow, GitHub, Kafka, Splunk, SolarWinds, and more
- **Live Editing**: Modify JSON payloads with real-time validation
- **Direct Testing**: Send events directly to EDA event stream webhooks
- **Response Viewing**: See exactly what your webhook returns
- **Extensible**: Add custom integrations via JSON configuration
- **Container-Ready**: Deploy to OpenShift, Kubernetes, or run locally with Docker

## Quick Start

**Run locally with Docker Compose:**
```bash
cd deploy/compose
docker-compose up -d
# Open http://localhost:8080
```

**Deploy to OpenShift/MicroShift:**
```bash
# Production
oc apply -k deploy/k8s/overlays/prod/

# Development (with self-signed cert support)
oc apply -k deploy/k8s/overlays/dev/

# Get your URL
oc get route eda-playground -n eda-playground
```

**Use the pre-built container:**
```bash
docker pull ghcr.io/bbgrimmett2/eda-playground:latest
docker run -p 8080:8080 ghcr.io/bbgrimmett2/eda-playground:latest
```

**Detailed instructions:** [Deployment Guide](docs/deployment-guide.md) | [Deploy Directory](deploy/README.md)

---

## How It Works

1. **Select an Integration** → Choose from 7+ pre-configured event sources
2. **Edit the Payload** → Customize JSON in the Monaco editor
3. **Enter Webhook Details** → Paste your EDA event stream URL and auth token
4. **Send & Validate** → Click "Send Event" and view the response

---

## Available Integrations

| Integration | Category | Example Use Case |
|------------|----------|------------------|
| **Prometheus Alertmanager** | Monitoring | Test alert firing/resolved webhooks |
| **ServiceNow Incident** | Ticketing | Validate ITSM incident creation |
| **GitHub Push Event** | SCM | Simulate CI/CD pipeline triggers |
| **Kafka Event Message** | Messaging | Test event stream processing |
| **Splunk ITSI** | Monitoring | IT service intelligence events |
| **SolarWinds Alert** | Monitoring | Infrastructure monitoring alerts |
| **Generic Webhook** | Generic | Customizable for any event type |

**Want to add more?** See [Adding Integrations](#adding-integrations)

---

## Adding Integrations

Create a new integration in 3 steps:

1. **Create JSON file**: `backend/integrations/<category>/<integration-id>.json`
2. **Define the structure**:
   ```json
   {
     "id": "monitoring-alert",
     "name": "Monitoring Alert System",
     "category": "monitoring",
     "description": "Generic monitoring system webhook for infrastructure alerts",
     "authTypes": ["bearer", "hmac", "none"],
     "defaultAuthType": "bearer",
     "examplePayload": {
       "alert_id": "alert_12345",
       "status": "firing",
       "severity": "critical",
       "timestamp": "2026-07-24T14:30:00Z",
       "source": {
         "name": "web-server-01",
         "region": "us-east-1",
         "environment": "production"
       },
       "metric": {
         "name": "cpu_usage_percent",
         "value": 95.8,
         "threshold": 90
       },
       "message": "CPU usage exceeded threshold on web-server-01",
       "runbook_url": "https://runbooks.example.com/high-cpu",
       "tags": ["infrastructure", "compute", "performance"]
     },
     "payloadSchema": {
       "type": "object",
       "required": ["alert_id", "status", "severity"],
       "properties": {
         "alert_id": { "type": "string" },
         "status": { "enum": ["firing", "resolved"] },
         "severity": { "enum": ["info", "warning", "critical"] }
       }
     },
     "documentation": "https://docs.example.com/webhooks/alerts",
     "tags": ["monitoring", "alerts", "infrastructure", "generic"]
   }
   ```
3. **Validate & test**:
   ```bash
   cd backend
   npm run validate-integrations
   npm run dev  # Test locally
   ```

**Full guide:** Check the integration schema in `backend/integrations/schema.json`

---

## Development

**Run locally:**
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

**Stack:**
- Frontend: React 18 + TypeScript + PatternFly 6
- Backend: Node.js 20 + Express + TypeScript
- Container: Multi-arch (amd64/arm64) Docker image
- Deployment: Kubernetes/OpenShift via Kustomize

---

## Contributing

Contributions welcome! This project follows the [Ansible Code of Conduct](https://docs.ansible.com/ansible/latest/community/code_of_conduct.html).

**Guidelines:**
- Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, etc.)
- PRs require passing CI checks (linting, security, build validation)
- See [PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md)

---

## Documentation

- [Deployment Guide](docs/deployment-guide.md) - OpenShift, Kubernetes, Docker
- [Deploy Directory](deploy/README.md) - Manifest overview

---

## License

Apache License 2.0 - See [LICENSE](LICENSE) for details.