#!/usr/bin/env node

/**
 * Post-deployment script for Vercel
 * This runs after the build is deployed to set up the database
 */

const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

async function postDeploy() {
  console.log('🚀 Starting post-deployment setup...');
  
  try {
    // Only run in production environment
    if (process.env.VERCEL_ENV !== 'production') {
      console.log('ℹ️ Skipping post-deploy setup (not production environment)');
      return;
    }

    // Check if database is accessible
    console.log('🔍 Checking database connection...');
    try {
      await execAsync('npx prisma db push --accept-data-loss');
      console.log('✅ Database schema updated');
    } catch (error) {
      console.error('❌ Database schema update failed:', error.message);
      throw error;
    }

    // Seed the database
    console.log('🌱 Seeding database...');
    try {
      await execAsync('npx tsx prisma/seed.ts');
      console.log('✅ Database seeded successfully');
    } catch (error) {
      console.error('❌ Database seeding failed:', error.message);
      // Don't fail deployment if seeding fails
      console.log('⚠️ Continuing without seed data...');
    }

    console.log('🎉 Post-deployment setup completed!');
    
  } catch (error) {
    console.error('❌ Post-deployment setup failed:', error);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  postDeploy();
}

module.exports = { postDeploy };