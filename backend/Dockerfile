# syntax=docker/dockerfile:1

# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files first
COPY package.json yarn.lock ./
COPY backend/package.json backend/
COPY shared/eslint-config/package.json shared/eslint-config/
COPY shared/ts-config-base/package.json shared/ts-config-base/

# Install root dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the backend application
WORKDIR /app/backend
RUN yarn build

# Stage 2: Production
FROM node:22-alpine

WORKDIR /app

# Copy only production dependencies and built app
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/package.json ./package.json
COPY --from=builder /app/scripts/validate-env.js ./scripts/validate-env.js

# Expose the port Railway will assign
EXPOSE 3001

# Command to run the application
CMD ["node", "dist/index.js"]
