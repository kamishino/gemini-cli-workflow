# Multi-stage build for KamiFlow CLI (pnpm Monorepo)
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

# Set working directory
WORKDIR /app

# Copy workspace config and package files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY cli-core/package.json ./cli-core/

# Install dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy source code
COPY cli-core/ ./cli-core/
COPY resources/ ./resources/
COPY .gemini/ ./.gemini/

# Build distribution
RUN pnpm build

# Production image
FROM node:20-alpine

# Install git (required for some operations)
RUN apk add --no-cache git

# Create app directory
WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/cli-core/node_modules ./cli-core/node_modules
COPY --from=builder /app/cli-core/package.json ./cli-core/
COPY --from=builder /app/.gemini ./.gemini

# Create symlink for global access
RUN npm link ./cli-core

# Create workspace directories
RUN mkdir -p /workspace/.kamiflow

# Set working directory to workspace
WORKDIR /workspace

# Expose ports (reserved for future use)
# Note: Dashboard is deprecated as of v2.39
EXPOSE 3000

# Set default command
ENTRYPOINT ["kamiflow"]
CMD ["--help"]
