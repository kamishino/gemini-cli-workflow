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

# Create data directory and set permissions
RUN mkdir -p /data /app/logs && chown -R node:node /data /app/logs

EXPOSE 3000

USER node

# Start server (migrations will run at startup in server.js or database.js)
CMD ["node", "src/server.js"]
