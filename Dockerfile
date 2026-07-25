# Multi-stage build for EDA Playground
# Builds both frontend and backend into a single optimized container

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend for production
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy backend source
COPY backend/ ./

# Build TypeScript
RUN npm run build

# Install production dependencies only
RUN npm ci --omit=dev

# Stage 3: Production Image
FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy backend build and node_modules from builder
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/dist ./dist
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/node_modules ./node_modules
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/package*.json ./

# Copy integrations library
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/integrations ./integrations

# Copy frontend build to public directory
COPY --from=frontend-builder --chown=nodejs:nodejs /app/frontend/dist ./public

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8080

# Environment variables
ENV NODE_ENV=production \
    PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"]
