# Multi-stage Dockerfile for Railway deployment
# Stage 1: install deps & build
FROM node:22-bullseye AS builder

WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json yarn.lock ./
COPY frontend/package.json frontend/ 
COPY backend/package.json backend/
COPY shared/eslint-config/package.json shared/eslint-config/
COPY shared/ts-config-base/package.json shared/ts-config-base/

# Install root workspace dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build both backend and frontend
RUN yarn build:backend
RUN yarn build:frontend

# Stage 2: runtime image for backend service
FROM node:22-bullseye AS backend-runtime

WORKDIR /app

ENV NODE_ENV=production

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy built backend application
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/scripts ./scripts

# Expose port
EXPOSE 3000
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start backend
CMD ["yarn", "start:backend"]

# Stage 3: runtime image for frontend service
FROM nginx:alpine AS frontend-runtime

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built frontend
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx-frontend.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 3000
ENV PORT=3000

# Health check for frontend
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]