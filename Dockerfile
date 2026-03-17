# Gamer's Den - Gaming Cafe Website
# Dockerfile for Railway Deployment

# ============================================
# Stage 1: Install dependencies
# ============================================
FROM oven/bun:1-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
COPY prisma ./prisma/

# Install dependencies
RUN bun install --frozen-lockfile
RUN bunx prisma generate

# ============================================
# Stage 2: Build the application
# ============================================
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/app/db/custom.db"

# Generate Prisma client and build
RUN bunx prisma generate
RUN bun run build

# ============================================
# Stage 3: Production runner
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/app/db/custom.db"
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install SQLite
RUN apk add --no-cache sqlite

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/db ./db

# Copy Prisma client from builder (already generated with correct version)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy prisma CLI from builder
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Ensure db directory exists and has permissions
RUN mkdir -p /app/db && chmod -R 755 /app/db

# Expose port
EXPOSE 3000

# Start script - run migrations then start server
CMD sh -c "npx prisma db push --accept-data-loss --skip-generate && node server.js"
