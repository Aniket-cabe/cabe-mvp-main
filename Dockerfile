# Multi-stage build for CaBE Arena Platform
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json yarn.lock pnpm-lock.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY shared/*/package.json ./shared/

# Install dependencies
RUN yarn install --frozen-lockfile

# Backend build stage
FROM base AS backend-builder

# Copy backend source
COPY backend/ ./backend/
COPY shared/ ./shared/

# Build backend
WORKDIR /app/backend
RUN yarn build

# Frontend build stage
FROM base AS frontend-builder

# Copy frontend source
COPY frontend/ ./frontend/
COPY shared/ ./shared/

# Build frontend
WORKDIR /app/frontend
RUN yarn build

# Production stage
FROM node:20-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Install production dependencies only
WORKDIR /app
COPY --from=base /app/package.json /app/yarn.lock /app/pnpm-lock.yaml ./
COPY --from=base /app/backend/package.json ./backend/
COPY --from=base /app/frontend/package.json ./frontend/

# Install production dependencies
RUN yarn install --frozen-lockfile --production

# Copy built applications
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy necessary files
COPY --from=base /app/backend/src/utils ./backend/src/utils
COPY --from=base /app/backend/scripts ./backend/scripts

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose ports
EXPOSE 3001 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Default command
CMD ["yarn", "start:cluster"]
