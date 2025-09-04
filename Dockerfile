# Stage 1: install deps & build
FROM node:22-bullseye AS builder
WORKDIR /app
COPY package.json yarn.lock ./
COPY frontend/package.json frontend/ 
COPY backend/package.json backend/
# install root workspace deps
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Stage 2: runtime image for backend
FROM node:22-bullseye AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/node_modules ./node_modules
COPY backend/package.json ./backend/package.json
EXPOSE 3000
ENV PORT=3000
CMD ["yarn","start:backend"]
