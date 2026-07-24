# Event-Driven Ansible Development Tool

A web-based playground for developing and testing Event-Driven Ansible (EDA) integrations. Select from common event sources, edit JSON payloads, and send test events to EDA webhooks with a single click.

![Status](https://img.shields.io/badge/status-in_development-yellow)
![License](https://img.shields.io/badge/license-Apache_2.0-blue)

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

**Phase 1: Foundation** ✅ Complete
- Project structure created
- Integration schema defined
- 7 core integrations implemented
- Validation tooling in place

**Phase 2: Backend Implementation** 🚧 In Progress
- Express API server
- Integration loader service
- REST endpoints
- CORS and error handling

**Phase 3-5:** Frontend, Testing, Deployment (Planned)

## Quick Start

### Backend Development

```bash
cd backend
npm install
npm run validate-integrations  # Validate all integration definitions
npm run dev                     # Start development server
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

## Adding New Integrations

See [docs/adding-integrations.md](docs/adding-integrations.md) (coming soon)

**Quick steps:**

1. Create integration file: `backend/integrations/<category>/<id>.json`
2. Follow the schema in `backend/integrations/schema.json`
3. Add entry to `backend/integrations/index.json`
4. Run `npm run validate-integrations`

## Contributing

This project follows the Ansible Code of Conduct.

## License

Apache License 2.0

---

**Built with ❤️ for the Ansible community**