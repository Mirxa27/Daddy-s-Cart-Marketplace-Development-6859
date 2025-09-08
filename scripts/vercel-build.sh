#!/bin/bash

# Vercel build script for Daddy's Cart Marketplace

echo "🚀 Starting Vercel build process..."

# Set environment variables
export NODE_ENV=production

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database operations for production
if [ "$VERCEL_ENV" = "production" ]; then
  echo "🗃️ Running database migrations..."
  npx prisma migrate deploy
  
  echo "🌱 Seeding production database..."
  npm run db:seed
fi

# Build the application
echo "🏗️ Building Next.js application..."
npm run build

# Optimize build
echo "🚀 Optimizing build for production..."
# Remove development dependencies from node_modules if needed
# This is handled by Vercel automatically

echo "✅ Build completed successfully!"

# Display build info
echo "📊 Build Information:"
echo "- Environment: $VERCEL_ENV"
echo "- URL: $VERCEL_URL"
echo "- Git Branch: $VERCEL_GIT_COMMIT_REF"
echo "- Git Commit: $VERCEL_GIT_COMMIT_SHA"