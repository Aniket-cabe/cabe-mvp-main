# Frontend-specific Dockerfile for Railway deployment
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json ./
COPY .yarn .yarn
COPY .pnp.cjs .pnp.cjs
COPY .pnp.loader.mjs .pnp.loader.mjs
COPY .npmrc ./
COPY .yarnrc ./

# Copy workspace package files
COPY frontend/package.json frontend/
COPY shared/eslint-config/package.json shared/eslint-config/
COPY shared/ts-config-base/package.json shared/ts-config-base/

# Install dependencies
RUN yarn config set registry https://registry.npmjs.org/ && \
    yarn install --network-timeout 300000 --network-concurrency 1

# Copy source code
COPY . .

# Build frontend only
WORKDIR /app/frontend
RUN yarn build

# Production runtime with nginx
FROM nginx:alpine AS runtime

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built frontend
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx-frontend.conf /etc/nginx/nginx.conf

# Create a startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'echo "Starting nginx on port ${PORT:-3000}..."' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

# Expose port
EXPOSE 3000
ENV PORT=3000

# Health check for frontend (check if nginx is responding)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=5 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start nginx
CMD ["/start.sh"]
