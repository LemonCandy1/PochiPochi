# Multi-stage Dockerfile for Pochi 1v1 Battle Server
FROM node:22-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm install -g tsx

# Copy source code required for battle server
COPY server ./server
COPY src/battle ./src/battle
COPY tsconfig.json ./

# Security: Run as non-root user
USER node

# Expose port (default: 4001, configurable via PORT env var)
EXPOSE 4001

ENV PORT=4001
ENV NODE_ENV=production

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/healthz || exit 1

# Start the Battle server
CMD ["tsx", "server/server.ts"]
