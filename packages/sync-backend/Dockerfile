FROM node:18-alpine

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY src ./src

# Create data directory
RUN mkdir -p /data /app/logs

EXPOSE 3000

# Run as root to avoid volume permission issues on self-hosted installs
# USER node (Commented out for compatibility)

# Start server
CMD ["node", "src/server.js"]
