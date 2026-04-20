# ── Stage 1: Install dependencies ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ── Stage 2: Production image ──────────────────────────────────────────────────
FROM node:20-alpine

LABEL maintainer="AUPP DevOps Team"
LABEL description="AUPP Learning Management System API"
LABEL version="1.0.0"

WORKDIR /app

# Create a non-root user for security
RUN addgroup -g 1001 appgroup && \
    adduser  -u 1001 -G appgroup -s /bin/sh -D appuser

# Copy production dependencies and source
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Set ownership
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
