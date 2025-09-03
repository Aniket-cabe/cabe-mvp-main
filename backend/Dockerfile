# syntax=docker/dockerfile:1

# -------- Builder stage --------
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source
COPY . .

# Build TypeScript → dist
RUN npm run build

# -------- Runtime stage --------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy only what we need to run
COPY --from=builder /app/dist ./dist
COPY package.json ./

# Install production deps only
RUN npm install --omit=dev

# Railway provides PORT
ENV PORT=3001
EXPOSE 3001

# Start the server
CMD ["node", "dist/index.js"]
