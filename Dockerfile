# Multi-stage build for smaller image
FROM node:20-alpine AS builder

# Install build dependencies for SQLite
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files first (for better caching)
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm install --only=production

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Copy all source code (AFTER installing dependencies for better caching)
WORKDIR /app
COPY backend ./backend
COPY frontend ./frontend

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy backend node_modules and source
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend ./backend

# Copy frontend build (static files)
COPY --from=builder /app/frontend/build ./backend/public

# Create data directory for SQLite
RUN mkdir -p /app/backend/data

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start backend
WORKDIR /app/backend
CMD ["node", "src/app.js"]
