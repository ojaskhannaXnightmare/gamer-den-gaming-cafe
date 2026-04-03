#!/bin/bash

# Railway startup script for Gamer's Den

echo "🚀 Starting Gamer's Den..."

# Create data directory if it doesn't exist
mkdir -p /app/data

# Set default DATABASE_URL if not set
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:/app/data/custom.db"
  echo "📦 Using SQLite database at /app/data/custom.db"
fi

# Run database migrations
echo "📊 Pushing database schema..."
npx prisma db push --skip-generate

# Run seed to ensure admin user exists
echo "🌱 Running seed to create admin user..."
npx tsx prisma/seed.ts || echo "Seed completed or already seeded"

# Start the application
echo "🎮 Starting server..."
exec node server.js
