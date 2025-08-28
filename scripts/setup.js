#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Daddy\'s Cart Marketplace...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');
  const envExample = fs.readFileSync(path.join(process.cwd(), '.env.example'), 'utf8');
  fs.writeFileSync(envPath, envExample);
  console.log('✅ .env.local created. Please update it with your actual values.\n');
} else {
  console.log('✅ .env.local already exists.\n');
}

// Install dependencies if node_modules doesn't exist
if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed.\n');
  } catch (error) {
    console.error('❌ Error installing dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed.\n');
}

// Check if DATABASE_URL is set
require('dotenv').config({ path: envPath });
if (!process.env.DATABASE_URL) {
  console.log('⚠️  DATABASE_URL not set in .env.local');
  console.log('Please set your database URL and run the setup again.\n');
  console.log('For Neon (recommended):');
  console.log('1. Create account at https://neon.tech');
  console.log('2. Create a new project');
  console.log('3. Copy the connection string');
  console.log('4. Set DATABASE_URL in .env.local\n');
  process.exit(1);
}

console.log('🗄️  Setting up database...');

try {
  // Generate Drizzle schema
  console.log('📋 Generating database schema...');
  execSync('npm run db:generate', { stdio: 'inherit' });
  console.log('✅ Database schema generated.\n');

  // Run migrations
  console.log('🔄 Running database migrations...');
  execSync('npm run db:migrate', { stdio: 'inherit' });
  console.log('✅ Database migrations completed.\n');

  // Seed database
  console.log('🌱 Seeding database with initial data...');
  execSync('node -r ts-node/register src/lib/db/seed.ts', { stdio: 'inherit' });
  console.log('✅ Database seeded successfully.\n');

} catch (error) {
  console.error('❌ Error setting up database:', error.message);
  console.log('\nTroubleshooting:');
  console.log('1. Make sure your DATABASE_URL is correct');
  console.log('2. Ensure the database server is running');
  console.log('3. Check your network connection');
  console.log('4. Verify database permissions\n');
  process.exit(1);
}

console.log('🎉 Setup completed successfully!\n');
console.log('Next steps:');
console.log('1. Update your .env.local with actual API keys');
console.log('2. Run "npm run dev" to start development server');
console.log('3. Visit http://localhost:3000 to see your marketplace');
console.log('4. Login with admin@daddyscart.com / SuperAdmin123!\n');

console.log('📚 Documentation:');
console.log('- README.md for detailed instructions');
console.log('- Check the /admin panel for settings');
console.log('- Configure Stripe for payments');
console.log('- Set up UploadThing for file uploads\n');

console.log('🚀 Happy building!');