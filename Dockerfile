# Use Bun as the base image
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock ./
COPY prisma ./prisma/
RUN bun install --frozen-lockfile
RUN bunx prisma generate

# Build the application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Production image - use Node.js for standalone
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/app/db/custom.db"

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/db ./db

# Install prisma in production
RUN npm install prisma
RUN npx prisma generate

# Create db directory if needed
RUN mkdir -p /app/db

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run migrations and start server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node server.js"]
