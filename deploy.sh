#!/bin/bash

echo "🚀 Starting Vercel Deployment Process..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your environment variables."
    exit 1
fi

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Verify database connection
echo ""
echo "🔍 Verifying database connection..."
node scripts/verify-database.js

if [ $? -ne 0 ]; then
    echo "❌ Database verification failed!"
    exit 1
fi

echo ""
echo "✅ Pre-deployment checks passed!"
echo ""
echo "📋 Next steps:"
echo "1. Run: vercel --prod"
echo "2. Set environment variables in Vercel Dashboard:"
echo "   - DATABASE_URL (from .env.local)"
echo "   - NEXTAUTH_URL (your Vercel URL)"
echo "   - NEXTAUTH_SECRET (generate with: node scripts/generate-secrets.js)"
echo "   - JWT_SECRET (generate with: node scripts/generate-secrets.js)"
echo ""
echo "📚 For detailed instructions, see VERCEL_PRODUCTION_DEPLOYMENT.md"