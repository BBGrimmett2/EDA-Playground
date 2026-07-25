# EDA Playground - Claude Project Context

**Project Name:** EDA Playground
**Repository:** https://github.com/BBGrimmett2/EDA-Playground
**Container Registry:** ghcr.io/bbgrimmett2/eda-playground
**Status:** MVP Development (Active)

---

## Project Overview

EDA Playground is a web-based development tool for testing Event-Driven Ansible (EDA) integrations. It allows developers to send realistic test events to EDA webhooks without writing code, using pre-built integration templates with customizable JSON payloads.

**Problem Solved:**
- Manual construction of JSON payloads for different event sources
- Complex authentication setup for each test
- Need for scripts/CLI tools to send test events
- Lack of immediate feedback when developing EDA rulebooks

**Solution:**
- Browser-based UI with PatternFly components (matches AAP look and feel)
- Pre-loaded integration library (Prometheus, ServiceNow, GitHub, Kafka, etc.)
- Monaco code editor for JSON payload editing
- Direct webhook testing with Bearer token auth
- Response viewing for troubleshooting

---

## Technology Stack

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| **Frontend** | React + TypeScript | 18.3.1 | Stable release, PatternFly compatible |
| **UI Framework** | PatternFly | 6.6.0 | Red Hat's enterprise UI framework |
| **Code Editor** | Monaco Editor | via PatternFly | Same as VS Code |
| **Build Tool** | Vite | 6.0.11 | Fast dev server and optimized builds |
| **Backend** | Node.js + Express | 20 / 4.21.2 | REST API for integrations |
| **Validation** | Ajv | 8.17.1 | JSON Schema validation |
| **Container** | Docker multi-stage | - | Node 20 Alpine base |
| **Orchestration** | OpenShift/K8s | 4.x | Kustomize-based deployment |

---

## Project Structure

```
eda-playground/
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # PatternFly UI components
│   │   ├── context/        # Global state management
│   │   ├── services/       # API client and webhook logic
│   │   └── types/          # TypeScript interfaces
│   └── package.json        # React 18, Vite 6, TypeScript 5.7
│
├── backend/                # Express API
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Integration loader
│   │   └── middleware/     # CORS, error handling
│   ├── integrations/       # JSON-based integration library
│   │   ├── monitoring/     # Prometheus, Splunk, SolarWinds
│   │   ├── ticketing/      # ServiceNow, JIRA
│   │   ├── scm/            # GitHub, GitLab
│   │   ├── messaging/      # Kafka, Slack
│   │   └── schema.json     # Integration definition schema
│   └── package.json
│
├── deploy/                 # Deployment manifests
│   ├── k8s/base/           # Base Kubernetes resources
│   ├── k8s/ocp/            # OpenShift with Route
│   ├── k8s/overlays/       # Environment-specific configs
│   └── compose/            # Docker Compose for local dev
│
├── docs/                   # Documentation
│   └── deployment-guide.md # OpenShift/K8s deployment
│
├── .github/workflows/      # CI/CD pipelines
│   ├── build-container.yml # Multi-arch container builds
│   ├── lint.yaml           # Code quality checks
│   ├── pr-checks.yaml      # PR validation
│   └── commitlint.yaml     # Conventional commits
│
├── Dockerfile              # Multi-stage build (amd64/arm64)
└── CLAUDE.md               # This file
```

---

## Current Development Status

### ✅ Completed (MVP)

1. **Core Functionality**
   - Integration selector with 7+ pre-built event sources
   - Monaco editor with JSON syntax highlighting
   - Connection form (webhook URL + Bearer token)
   - Event sending with Axios
   - Response display with status codes

2. **Integration Library**
   - Generic Webhook
   - Prometheus Alertmanager
   - ServiceNow Incident
   - GitHub Push Event
   - Kafka Message
   - Splunk ITSI
   - SolarWinds Alert

3. **Infrastructure**
   - Multi-stage Dockerfile (frontend + backend)
   - Kustomize manifests for OpenShift/K8s
   - Docker Compose for local development
   - Multi-arch builds (amd64/arm64)

4. **CI/CD**
   - Container build workflow (GitHub Actions)
   - TypeScript/Dockerfile/YAML/Markdown linting
   - PR validation (size, conflicts, required files)
   - Conventional Commits enforcement
   - Secret scanning with Gitleaks
   - Kubernetes manifest validation

### 🚧 In Progress

- [ ] First production release (v1.0.0)
- [ ] Container package visibility set to public
- [ ] OpenShift deployment testing

### 📋 Backlog (Future Enhancements)

- AAP API integration (auto-discover event streams)
- OAuth2 authentication with AAP
- Payload history and favorites
- HMAC signature support for webhooks
- Batch event sending
- Mock mode (simulate EDA responses)
- Request/response logging
- Export/import payload collections

---

## Development Workflows

### Local Development

```bash
# Backend
cd backend
npm install
npm run dev              # Starts on http://localhost:3001

# Frontend
cd frontend
npm install
npm run dev              # Starts on http://localhost:5173
```

### Adding New Integrations

1. Create JSON file: `backend/integrations/<category>/<id>.json`
2. Follow schema in `backend/integrations/schema.json`
3. Add entry to `backend/integrations/index.json`
4. Validate: `cd backend && npm run validate-integrations`
5. Test locally with dev server

**Example Structure:**
```json
{
  "id": "my-integration",
  "name": "My Integration",
  "category": "monitoring",
  "description": "Brief description",
  "authTypes": ["bearer", "none"],
  "defaultAuthType": "bearer",
  "examplePayload": { /* realistic JSON */ },
  "payloadSchema": { /* optional JSON Schema */ },
  "documentation": "https://docs.example.com",
  "tags": ["tag1", "tag2"]
}
```

### Container Builds

```bash
# Build locally
docker build -t eda-playground:local .

# Run locally
docker run -p 8080:8080 eda-playground:local

# Test
curl http://localhost:8080/health
```

**Automated Builds (GitHub Actions):**
- On push to `main`: Builds and pushes with `latest` tag
- On version tag (v*.*.*): Builds with semver tags
- On PR: Builds for validation only (no push)
- Manual trigger: Supports pre-release tags

### Deployment to OpenShift

```bash
# Create namespace
oc new-project eda-playground

# Deploy
oc apply -k deploy/k8s/ocp/

# Check status
oc get pods -n eda-playground
oc get route -n eda-playground

# View logs
oc logs -f deployment/eda-playground -n eda-playground
```

---

## Git Workflow

### Branch Strategy

- `main` - Production-ready code, protected branch
- `devel` - Active development, integration branch
- `feat/*` - Feature branches
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: Add HMAC signature support for webhooks
fix: Resolve CORS issue in proxy endpoint
docs: Update deployment guide for MicroShift
chore: Update dependencies to latest stable
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`

### Pull Request Process

1. Create feature branch from `main`
2. Make changes and commit
3. Push to origin
4. Open PR to `main` (use PR template)
5. Wait for CI checks (all must pass):
   - Build and push container (validation only on PR)
   - TypeScript lint
   - Dockerfile lint
   - YAML lint
   - Markdown lint
   - Secret detection
   - Kubernetes validation
   - PR metadata checks
6. Merge when approved

---

## Key Architectural Decisions

### Why PatternFly?
Matches Ansible Automation Platform UI/UX, providing familiar experience for AAP users. Enterprise-ready with accessibility support.

### Why Monaco Editor?
Same editor as VS Code, excellent JSON support with syntax highlighting, validation, and formatting.

### Why File-Based Integration Library?
- Easy to add new integrations (just JSON files)
- No database required
- Can be mounted as ConfigMap in K8s
- Version controlled with Git
- Community contributions via PRs

### Why Proxy Endpoint?
Browser CORS restrictions prevent direct calls to arbitrary webhook URLs. Backend proxy forwards requests server-side, adding proper CORS headers.

### Why Multi-Stage Docker Build?
- Optimized image size (only production dependencies)
- Separate frontend build from backend
- Security (runs as non-root user)
- Single container for easy deployment

### Why Kustomize?
- Kubernetes-native configuration management
- Base + overlays pattern for environments
- No templating language to learn
- Built into kubectl/oc

---

## Dependencies and Versions

### Why These Specific Versions?

**React 18.3.1** (not 19.x):
- Stable release with full PatternFly 6 compatibility
- React 19 has peer dependency conflicts with PatternFly
- Downgraded from 19.2.7 to fix npm ci failures

**Vite 6.0.11** (not 8.x):
- Stable release compatible with React 18
- Vite 8 requires newer TypeScript/React versions
- Downgraded to resolve build issues

**TypeScript 5.7.2** (not 6.x):
- Latest stable before TS 6.0 breaking changes
- Removed `erasableSyntaxOnly` flag (TS 6.0+ only)
- Compatible with Vite 6 and React 18

**Node 20 Alpine**:
- LTS version, widely supported
- Alpine for minimal image size
- Matches GitHub Actions runner version

**Pinned dumb-init 1.2.5-r3**:
- Proper signal handling in containers
- Version pinning required by Dockerfile linting

---

## Common Issues and Solutions

### npm ci fails with "no package-lock.json"
- **Cause:** package-lock.json was in .gitignore
- **Fix:** Removed from .gitignore, committed lock files
- **Why:** npm ci requires committed lock files for deterministic builds

### Build fails with "Unknown compiler option 'erasableSyntaxOnly'"
- **Cause:** TypeScript option only available in TS 6.0+
- **Fix:** Removed from tsconfig.app.json and tsconfig.node.json
- **Why:** Using TS 5.7.2 for stability

### Container not appearing in GitHub Packages
- **Cause:** Build workflow only validates on PRs, doesn't push
- **Fix:** Merge PR to main to trigger push
- **Why:** `push: ${{ github.event_name != 'pull_request' }}`

### CORS errors when sending to EDA webhook
- **Cause:** Browser security prevents cross-origin requests
- **Fix:** Use backend proxy at `/api/proxy`
- **Alternative:** Configure EDA to allow CORS (not recommended)

---

## Testing Checklist

### Before Committing
- [ ] TypeScript compiles without errors: `npm run build`
- [ ] Linter passes: `npm run lint`
- [ ] All changes tested locally
- [ ] Commit message follows Conventional Commits

### Before Creating PR
- [ ] Branch is up to date with main
- [ ] PR template filled out completely
- [ ] All CI checks pass locally
- [ ] No secrets or sensitive data committed

### Before Merging
- [ ] All GitHub Actions checks pass
- [ ] PR approved by maintainer
- [ ] No merge conflicts
- [ ] Documentation updated if needed

---

## Environment Variables

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:3001  # Backend API URL
```

### Backend (.env)
```bash
PORT=3001                           # Server port
NODE_ENV=development                # Environment
CORS_ORIGIN=http://localhost:5173   # Frontend origin
```

### Container Runtime
```bash
PORT=8080                           # Application port
NODE_ENV=production                 # Always production in container
```

---

## Useful Commands

### Development
```bash
# Install all dependencies
npm install --prefix frontend && npm install --prefix backend

# Run both frontend and backend
npm run dev --prefix frontend &
npm run dev --prefix backend &

# Validate integrations
npm run validate-integrations --prefix backend

# Format code
npm run format --prefix frontend
npm run format --prefix backend
```

### Docker
```bash
# Build multi-arch image
docker buildx build --platform linux/amd64,linux/arm64 -t eda-playground .

# Run with custom port
docker run -p 9090:8080 eda-playground:latest

# Shell into running container
docker exec -it <container-id> sh
```

### OpenShift/Kubernetes
```bash
# Apply base manifests
kubectl apply -k deploy/k8s/base/

# Apply OpenShift overlay
oc apply -k deploy/k8s/ocp/

# Port-forward for local testing
kubectl port-forward svc/eda-playground 8080:8080

# View logs
kubectl logs -f deployment/eda-playground

# Exec into pod
kubectl exec -it deployment/eda-playground -- sh
```

---

## CI/CD Pipeline Details

### build-container.yml
- **Triggers:** Push to main, version tags, PRs, manual
- **Actions:**
  - Multi-arch build (amd64/arm64)
  - Push to ghcr.io (only on main/tags)
  - Cache layers with GitHub Actions cache
  - Generate build summary
- **Secrets Required:** GITHUB_TOKEN (auto-provided)

### lint.yaml
- **Triggers:** Push, PRs
- **Checks:**
  - yamllint (K8s manifests)
  - markdownlint (documentation)
  - oxlint + tsc (TypeScript)
  - hadolint (Dockerfile)
  - kubeconform (K8s validation)
  - gitleaks (secret detection)

### pr-checks.yaml
- **Triggers:** PRs
- **Checks:**
  - PR metadata (description, title length)
  - PR size (lines changed)
  - Merge conflicts
  - Required files exist
  - Dependency changes

### commitlint.yaml
- **Triggers:** PRs
- **Checks:**
  - PR title follows Conventional Commits
  - Commit messages properly formatted

---

## Contact and Collaboration

**Maintainer:** BBGrimmett2
**Issues:** https://github.com/BBGrimmett2/EDA-Playground/issues
**Contributing:** See PULL_REQUEST_TEMPLATE.md
**Code of Conduct:** Follows [Ansible Code of Conduct](https://docs.ansible.com/ansible/latest/community/code_of_conduct.html)

---

## Notes for Claude

When working on this project:

1. **Always read files before editing** - Use Read tool first to understand context
2. **Use exact versions** - Package versions are pinned for stability
3. **Follow Conventional Commits** - All commits must use proper format
4. **Validate before committing** - Run linters and build checks
5. **Test Docker builds** - Container must build successfully
6. **Update documentation** - Keep README and this file in sync
7. **Consider the plan** - Reference `/Users/bgrimmet/.claude/plans/validated-petting-cupcake.md`

**Project Goals:**
- Simplicity over complexity
- Enterprise-ready (PatternFly, OpenShift, proper CI/CD)
- Easy to extend (add new integrations)
- Developer-friendly (good DX with fast feedback)

**Working Style:**
- Fix root causes, not symptoms
- Document decisions in this file
- Keep changes focused and atomic
- Prioritize stability over latest versions
