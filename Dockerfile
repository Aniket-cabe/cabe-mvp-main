# Multi-stage Dockerfile for CaBE Arena Monorepo
# Supports both frontend and backend services

# Stage 1: Dependencies and Build
FROM node:22-bullseye AS builder

WORKDIR /app

# Copy root package files
COPY package.json ./
COPY .yarn .yarn
COPY .pnp.cjs .pnp.cjs
COPY .pnp.loader.mjs .pnp.loader.mjs

# Copy workspace package files
COPY frontend/package.json frontend/
COPY backend/package.json backend/
COPY shared/eslint-config/package.json shared/eslint-config/
COPY shared/ts-config-base/package.json shared/ts-config-base/

# Install dependencies using Yarn PnP
RUN yarn install --immutable

# Copy source code
COPY . .

# Build both frontend and backend
RUN yarn build:backend
RUN yarn build:frontend

# Stage 2: Backend Runtime
FROM node:22-bullseye AS backend-runtime

WORKDIR /app

ENV NODE_ENV=production

# Copy built backend and dependencies
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package.json ./package.json
COPY --from=builder /app/scripts/validate-env.js ./scripts/validate-env.js
COPY --from=builder /app/node_modules ./node_modules

# Expose port for Railway
EXPOSE 3000
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/health || exit 1

# Start backend service
CMD ["yarn", "start:backend"]

# Stage 3: Frontend Runtime
FROM nginx:alpine AS frontend-runtime

# Copy built frontend
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port for Railway
EXPOSE 3000
ENV PORT=3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
