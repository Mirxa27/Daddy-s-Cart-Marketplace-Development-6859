#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function verifyDatabase() {
  console.log('🔍 Verifying database connection...\n');

  const prisma = new PrismaClient();

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!\n');

    // Count records
    const users = await prisma.user.count();
    const products = await prisma.product.count();
    const categories = await prisma.category.count();
    const stores = await prisma.store.count();
    const orders = await prisma.order.count();

    console.log('📊 Database Statistics:');
    console.log(`  - Users: ${users}`);
    console.log(`  - Products: ${products}`);
    console.log(`  - Categories: ${categories}`);
    console.log(`  - Stores: ${stores}`);
    console.log(`  - Orders: ${orders}`);

    // Check admin user
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (admin) {
      console.log(`\n👤 Admin user found: ${admin.email}`);
    }

    console.log('\n✨ Database is ready for production!');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();