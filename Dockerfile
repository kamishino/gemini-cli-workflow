# Multi-stage build for KamiFlow CLI
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY cli-core/package*.json ./cli-core/
COPY package*.json ./

# Install dependencies
RUN cd cli-core && npm ci --only=production

# Copy source code
COPY cli-core/ ./cli-core/
COPY resources/ ./resources/
COPY .gemini/ ./.gemini/

# Build distribution
RUN cd cli-core && npm run build

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

# Expose dashboard port (if needed)
EXPOSE 3000 3001

# Set default command
ENTRYPOINT ["kamiflow"]
CMD ["--help"]
