# Use Node.js 20 Alpine as base image
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Build stage for backend
FROM base AS backend-builder
WORKDIR /app

# Copy backend source
COPY backend/package.json backend/
COPY backend/tsconfig.json backend/
COPY backend/src/ backend/src/
COPY shared/ shared/

# Install backend dependencies and build
RUN npm ci --workspace=backend
RUN npm run build --workspace=backend

# Build stage for frontend
FROM base AS frontend-builder
WORKDIR /app

# Copy frontend source
COPY frontend/package.json frontend/
COPY frontend/tsconfig.json frontend/
COPY frontend/src/ frontend/src/
COPY frontend/public/ frontend/public/
COPY shared/ shared/

# Install frontend dependencies and build
RUN npm ci --workspace=frontend
RUN npm run build --workspace=frontend

# Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy built applications
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy shared configurations
COPY shared/ shared/

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to nodejs user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["dumb-init", "npm", "run", "start:replit"]
