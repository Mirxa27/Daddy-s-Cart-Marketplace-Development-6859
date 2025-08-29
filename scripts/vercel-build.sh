#!/bin/bash

echo "🚀 Starting Vercel build process..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Run the build
echo "🔨 Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"