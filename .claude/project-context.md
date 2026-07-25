# EDA Playground - Project Context

**Last Updated:** 2026-07-24
**Current Phase:** MVP Complete, First Release Preparation

---

## Current State

### What Works
- Full-stack application (React + Express)
- 7 integration templates with realistic payloads
- Monaco editor with JSON validation
- Bearer token authentication
- Response viewing with status codes
- Multi-arch container builds (amd64/arm64)
- Complete CI/CD pipeline
- OpenShift/Kubernetes deployment manifests
- Docker Compose for local development

### What's in Progress
- Making container package public on ghcr.io
- Preparing v1.0.0 release
- Testing OpenShift deployment

### Known Issues
None currently blocking. All CI checks passing.

---

## Recent Major Changes

### 2026-07-24: Project Rename and CI/CD Setup
- Renamed from "Event-Driven Ansible Development Tool" to "EDA Playground"
- Reorganized deployment directory from `deployment/` to `deploy/`
- Added comprehensive GitHub Actions workflows:
  - build-container.yml (multi-arch builds)
  - lint.yaml (6 different linters)
  - pr-checks.yaml (PR validation)
  - commitlint.yaml (commit message enforcement)
- Fixed CI failures:
  - Removed package-lock.json from .gitignore
  - Downgraded React to 18.3.1 for PatternFly compatibility
  - Removed erasableSyntaxOnly from TypeScript config (TS 6.0+ only)
  - Pinned dumb-init version in Dockerfile
  - Consolidated RUN commands in Dockerfile
  - Fixed unused catch parameter warning

### Earlier: Initial Implementation
- Built frontend with PatternFly 6
- Created backend API with Express
- Implemented integration loader with Ajv validation
- Created multi-stage Dockerfile
- Set up Kustomize deployment structure
- Added 7 initial integrations

---

## Architecture Decisions Log

### Frontend Technology Choices
**Decision:** React 18.3.1 + PatternFly 6 + Monaco Editor
**Rationale:**
- PatternFly provides AAP-like UI/UX
- Monaco is VS Code's editor, excellent JSON support
- React 18 is stable with full PatternFly compatibility
- React 19 has peer dependency conflicts

**Alternatives Considered:**
- Vue.js - Less enterprise adoption
- Vanilla JS - Too much boilerplate
- React 19 - Breaking changes, PatternFly incompatibility

### Backend Architecture
**Decision:** Node.js + Express with file-based integration library
**Rationale:**
- Same runtime as frontend (JavaScript/TypeScript)
- File-based library is easy to extend (just add JSON)
- No database required for MVP
- Can be mounted as ConfigMap in Kubernetes

**Alternatives Considered:**
- Python + Flask - Separate runtime
- Go - Overkill for simple API
- Database-backed - Too complex for MVP

### Build and Deployment
**Decision:** Multi-stage Docker build + Kustomize
**Rationale:**
- Single container is easier to deploy
- Kustomize is Kubernetes-native
- Multi-stage reduces image size
- Multi-arch supports Mac M1 and Linux servers

**Alternatives Considered:**
- Separate containers - More orchestration complexity
- Helm charts - More complex than needed
- Docker Compose only - Not production-ready

### CI/CD Strategy
**Decision:** GitHub Actions with comprehensive linting
**Rationale:**
- Free for public repos
- Native GitHub integration
- Easy to configure
- Built-in container registry (ghcr.io)

**Alternatives Considered:**
- GitLab CI - Would require migration
- Jenkins - Too heavy for this project
- No CI - Unacceptable for production

---

## Integration Library Design

### Schema-Based Validation
Each integration follows `backend/integrations/schema.json`:

```json
{
  "id": "unique-identifier",
  "name": "Display Name",
  "category": "monitoring|ticketing|scm|messaging|security|generic",
  "description": "Brief description",
  "authTypes": ["bearer", "none", "hmac"],
  "defaultAuthType": "bearer",
  "examplePayload": { /* JSON */ },
  "payloadSchema": { /* JSON Schema */ },
  "documentation": "https://...",
  "tags": ["searchable", "tags"]
}
```

### Categories
- **monitoring**: Prometheus, Splunk, SolarWinds
- **ticketing**: ServiceNow, JIRA
- **scm**: GitHub, GitLab
- **messaging**: Kafka, Slack
- **security**: (future)
- **generic**: Customizable webhook

### Adding New Integrations
1. Create JSON file in appropriate category
2. Add to `index.json` registry
3. Validate with `npm run validate-integrations`
4. Test locally
5. Submit PR

---

## Development Patterns

### State Management
Using React Context + useReducer pattern:
- `AppContext` provides global state
- Reducers handle state transitions
- No external state library needed (Redux overkill)

### API Communication
- Frontend → Backend: `/api/integrations` (GET)
- Frontend → EDA: Direct POST or via `/api/proxy`
- Proxy used to avoid CORS issues

### Error Handling
- Backend: Express error middleware
- Frontend: Try/catch with user-friendly alerts
- Validation errors shown inline

### Styling
- PatternFly components for structure
- Custom CSS for specific layouts
- Design system tokens for consistency

---

## Testing Strategy

### Current (MVP)
- Manual testing in browser
- Integration validation script
- CI linting and type checking
- Docker build validation

### Future Enhancements
- Unit tests with Jest/Vitest
- Component tests with React Testing Library
- E2E tests with Playwright
- Integration tests against real EDA instance

---

## Deployment Considerations

### OpenShift/OKD
- Requires Route resource (not Ingress)
- Uses SecurityContextConstraints
- Image must run as non-root (UID 1001)
- ConfigMap for integrations library

### Kubernetes
- Requires Ingress resource
- May need nginx-ingress controller
- Less opinionated than OpenShift

### MicroShift
- Edge computing use case
- Same manifests as OpenShift
- Resource-constrained (use limits)

### Local Development
- Docker Compose simplest option
- Hot reload for frontend (Vite)
- No container rebuild needed

---

## Performance Optimizations

### Frontend
- Vite for fast HMR
- Code splitting (React.lazy if needed)
- PatternFly tree-shaking
- Monaco lazy-loaded

### Backend
- Integration cache (no repeated file reads)
- Express compression middleware
- Static file serving from built frontend

### Container
- Multi-stage build (smaller image)
- Alpine base (minimal footprint)
- Production npm install only

---

## Security Considerations

### Current Implementation
- No secrets in code (Gitleaks scanning)
- Non-root container user
- CORS configured properly
- Input validation with Ajv
- Bearer token never logged

### Future Enhancements
- HMAC signature verification
- OAuth2 with AAP
- Audit logging
- Rate limiting
- Secret scanning in payloads

---

## Roadmap

### v1.0.0 (Current Target)
- [x] MVP functionality complete
- [x] Container builds working
- [ ] Package visibility set to public
- [ ] OpenShift deployment tested
- [ ] First release tag created

### v1.1.0 (Next)
- [ ] HMAC authentication support
- [ ] Request history in UI
- [ ] Favorite payloads
- [ ] Import/export collections

### v2.0.0 (Future)
- [ ] AAP API integration
- [ ] OAuth2 authentication
- [ ] Auto-discover event streams
- [ ] Multi-user support
- [ ] Audit logging

### Long-term Ideas
- Batch event sending
- Mock mode (simulate EDA responses)
- Payload variable substitution
- WebSocket support for real-time events
- Integration marketplace

---

## Common Commands Reference

### Development
```bash
# Start frontend dev server
cd frontend && npm run dev

# Start backend dev server
cd backend && npm run dev

# Validate integrations
cd backend && npm run validate-integrations

# Build frontend
cd frontend && npm run build

# Build backend
cd backend && npm run build
```

### Docker
```bash
# Build container
docker build -t eda-playground:local .

# Run container
docker run -p 8080:8080 eda-playground:local

# Run with Docker Compose
cd deploy/compose && docker-compose up

# Build multi-arch
docker buildx build --platform linux/amd64,linux/arm64 -t eda-playground .
```

### OpenShift
```bash
# Deploy
oc apply -k deploy/k8s/ocp/

# Get route
oc get route eda-playground

# View logs
oc logs -f deployment/eda-playground

# Port forward
oc port-forward svc/eda-playground 8080:8080
```

### Git
```bash
# Create feature branch
git checkout -b feat/my-feature

# Commit with conventional format
git commit -m "feat: add new integration"

# Push and create PR
git push -u origin feat/my-feature
gh pr create --fill
```

---

## Session History

### 2026-07-24 Session Summary
**Focus:** Project rename, CI/CD setup, and fixing build failures

**Accomplished:**
1. Renamed project to "EDA Playground" across all files
2. Reorganized deployment structure (deployment/ → deploy/)
3. Added 4 GitHub Actions workflows with comprehensive checks
4. Fixed npm ci failures by committing package-lock.json
5. Fixed TypeScript build errors (erasableSyntaxOnly)
6. Fixed Dockerfile lint warnings
7. Achieved passing CI/CD pipeline
8. Created CLAUDE.md and .claude/ directory

**Key Learnings:**
- React 19 incompatible with PatternFly 6 (peer deps)
- npm ci requires committed package-lock.json
- TypeScript 6.0+ features not available in 5.7.2
- Dockerfile best practices (version pinning, RUN consolidation)
- GitHub package visibility requires manual configuration

**Decisions Made:**
- Use React 18.3.1 instead of 19.x
- Commit package-lock.json files
- Pin dumb-init version in Dockerfile
- Keep comprehensive linting in CI

**Next Steps:**
1. Make container package public
2. Merge PR #1 to main
3. Verify container publishes to ghcr.io
4. Test OpenShift deployment
5. Create v1.0.0 release

---

## Notes for Future Sessions

**When resuming work:**
1. Check git status and current branch
2. Review recent commits for context
3. Pull latest changes from origin
4. Run CI checks locally before pushing
5. Reference this file and CLAUDE.md for decisions

**Before making changes:**
1. Read existing files first
2. Understand the "why" behind current implementation
3. Check if similar issues were solved before
4. Consider impact on CI/CD pipeline
5. Update documentation if needed

**Project Philosophy:**
- Simplicity over cleverness
- Stability over latest versions
- Documentation over tribal knowledge
- Testing over hope
- Automation over manual processes
