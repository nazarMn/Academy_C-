# ─── Build Stage ─────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --production

# ─── Runtime Stage ───────────────────────────────────
FROM node:20-alpine

# Install g++ compiler for C++ code execution
RUN apk add --no-cache g++ musl-dev

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy frontend files
COPY index.html ./
COPY css/ ./css/
COPY js/ ./js/

# Copy backend
COPY backend/src/ ./backend/src/
COPY backend/data/ ./backend/data/
COPY backend/scripts/ ./backend/scripts/
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY backend/package.json ./backend/

# Create temp directory for code execution
RUN mkdir -p /tmp/cpp_exec && chown -R appuser:appgroup /tmp/cpp_exec
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

WORKDIR /app/backend
CMD ["node", "src/server.js"]
