# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install client dependencies and build
COPY client/package*.json ./client/
RUN npm install --prefix client

COPY client/ ./client/
RUN npm run build --prefix client

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install server dependencies (production only)
COPY server/package*.json ./server/
RUN npm install --prefix server --omit=dev

COPY server/ ./server/

# Copy built client
COPY --from=builder /app/client/dist ./client/dist

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "server/index.js"]
