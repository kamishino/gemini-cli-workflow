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

# Run database migrations
RUN node src/migrate.js || true

EXPOSE 3000

USER node

CMD ["node", "src/server.js"]
