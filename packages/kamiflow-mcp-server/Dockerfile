# KamiFlow MCP Server - Docker Image
# Multi-stage build for production

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy cli-core (dependency)
COPY cli-core ./cli-core

# Copy package files for mcp-server
COPY packages/kamiflow-mcp-server/package*.json ./packages/kamiflow-mcp-server/

# Install dependencies
WORKDIR /app/packages/kamiflow-mcp-server
RUN npm ci

# Copy source and build
COPY packages/kamiflow-mcp-server .
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install dumb-init
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy cli-core (dependency) needed for runtime if referenced by file:
COPY --from=builder /app/cli-core ./cli-core

WORKDIR /app/packages/kamiflow-mcp-server

# Copy package files
COPY packages/kamiflow-mcp-server/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built files from builder
COPY --from=builder /app/packages/kamiflow-mcp-server/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Create .kamiflow directory for registry
RUN mkdir -p /home/node/.kamiflow && \
    chown -R nodejs:nodejs /home/node/.kamiflow

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))" || exit 1

EXPOSE 3000

ENV NODE_ENV=production \
    PORT=3000 \
    KAMIFLOW_REGISTRY=/home/node/.kamiflow/projects.json

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
