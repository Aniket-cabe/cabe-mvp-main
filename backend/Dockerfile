# Backend-specific Dockerfile for Railway deployment
FROM node:22-bullseye AS builder

WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json ./
COPY .yarn .yarn
COPY .pnp.cjs .pnp.cjs
COPY .pnp.loader.mjs .pnp.loader.mjs
COPY .npmrc ./
COPY .yarnrc ./

# Copy workspace package files
COPY backend/package.json backend/
COPY shared/eslint-config/package.json shared/eslint-config/
COPY shared/ts-config-base/package.json shared/ts-config-base/

# Install dependencies
RUN yarn config set registry https://registry.npmjs.org/ && \
    yarn install --network-timeout 300000 --network-concurrency 1 || \
    npm install

# Copy source code
COPY . .

# Build backend only
WORKDIR /app/backend
RUN yarn build || npm run build

# Production runtime
FROM node:22-bullseye AS runtime

WORKDIR /app

ENV NODE_ENV=production

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy built application
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package.json ./package.json
COPY --from=builder /app/scripts/validate-env.js ./scripts/validate-env.js
COPY --from=builder /app/scripts/health-check.js ./scripts/health-check.js
COPY --from=builder /app/scripts/railway-start.js ./scripts/railway-start.js
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3000
ENV PORT=3000

# Health check with longer start period and more retries
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=10 \
  CMD node scripts/health-check.js

# Start command using Railway start script
CMD ["node", "scripts/railway-start.js"]
