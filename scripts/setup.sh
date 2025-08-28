#!/bin/bash

echo "🚀 Setting up Daddy's Cart Marketplace..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate secrets if .env.local doesn't exist
if [ ! -f .env.local ]; then
    echo "🔐 Generating secrets..."
    node scripts/generate-secrets.js
else
    echo "✅ .env.local already exists"
fi

# Check if DATABASE_URL is configured
if ! grep -q "DATABASE_URL=\"postgresql://" .env.local; then
    echo ""
    echo "⚠️  Please configure your DATABASE_URL in .env.local"
    echo "   Example: DATABASE_URL=\"postgresql://user:password@localhost:5432/daddyscart\""
    echo ""
    read -p "Press enter once you've configured the database URL..."
fi

# Generate Prisma client
echo "🗃️  Generating Prisma client..."
npx prisma generate

# Push database schema
echo "🗃️  Creating database tables..."
npx prisma db push

# Seed the database
echo "🌱 Seeding database..."
npm run db:seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Super Admin Credentials:"
echo "   Email: superadmin@daddyscart.com"
echo "   Password: SuperAdmin@123!"
echo ""
echo "⚠️  IMPORTANT: Change these credentials after first login!"
echo ""
echo "🚀 To start the development server, run:"
echo "   npm run dev"
echo ""
echo "📖 For deployment instructions, see DEPLOYMENT.md"