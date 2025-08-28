import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create Super Admin
  const hashedPassword = await bcrypt.hash('SuperAdmin@123!', 12);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@daddyscart.com' },
    update: {},
    create: {
      email: 'superadmin@daddyscart.com',
      password: hashedPassword,
      name: 'Super Administrator',
      role: 'SUPER_ADMIN',
      emailVerified: new Date(),
      isActive: true,
    },
  });

  console.log('Super Admin created:', { 
    id: superAdmin.id, 
    email: superAdmin.email,
    password: 'SuperAdmin@123!' 
  });

  // Create default categories
  const categories = [
    { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and accessories' },
    { name: 'Clothing', slug: 'clothing', description: 'Fashion and apparel' },
    { name: 'Home & Garden', slug: 'home-garden', description: 'Home decor and garden supplies' },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors', description: 'Sports equipment and outdoor gear' },
    { name: 'Books', slug: 'books', description: 'Books and educational materials' },
    { name: 'Toys & Games', slug: 'toys-games', description: 'Toys, games, and entertainment' },
    { name: 'Health & Beauty', slug: 'health-beauty', description: 'Health and beauty products' },
    { name: 'Food & Beverages', slug: 'food-beverages', description: 'Food items and drinks' },
    { name: 'Automotive', slug: 'automotive', description: 'Auto parts and accessories' },
    { name: 'Jewelry', slug: 'jewelry', description: 'Jewelry and watches' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('Categories created');

  // Create default settings
  const defaultSettings = [
    {
      key: 'site_name',
      value: JSON.stringify('Daddy\'s Cart Marketplace'),
      description: 'The name of the marketplace',
      group: 'general',
    },
    {
      key: 'site_description',
      value: JSON.stringify('Your premier online marketplace for everything you need'),
      description: 'Site description for SEO',
      group: 'general',
    },
    {
      key: 'currency',
      value: JSON.stringify({ code: 'USD', symbol: '$' }),
      description: 'Default currency',
      group: 'payment',
    },
    {
      key: 'tax_rate',
      value: JSON.stringify(0.08),
      description: 'Default tax rate (8%)',
      group: 'payment',
    },
    {
      key: 'shipping_fee',
      value: JSON.stringify(5.99),
      description: 'Default shipping fee',
      group: 'shipping',
    },
    {
      key: 'free_shipping_threshold',
      value: JSON.stringify(50),
      description: 'Order amount for free shipping',
      group: 'shipping',
    },
    {
      key: 'commission_rate',
      value: JSON.stringify(0.10),
      description: 'Platform commission rate (10%)',
      group: 'vendor',
    },
    {
      key: 'stripe_public_key',
      value: JSON.stringify(''),
      description: 'Stripe publishable key',
      group: 'payment',
    },
    {
      key: 'stripe_secret_key',
      value: JSON.stringify(''),
      description: 'Stripe secret key',
      group: 'payment',
    },
    {
      key: 'smtp_host',
      value: JSON.stringify('smtp.gmail.com'),
      description: 'SMTP server host',
      group: 'email',
    },
    {
      key: 'smtp_port',
      value: JSON.stringify(587),
      description: 'SMTP server port',
      group: 'email',
    },
    {
      key: 'smtp_user',
      value: JSON.stringify(''),
      description: 'SMTP username',
      group: 'email',
    },
    {
      key: 'smtp_password',
      value: JSON.stringify(''),
      description: 'SMTP password',
      group: 'email',
    },
    {
      key: 'contact_email',
      value: JSON.stringify('contact@daddyscart.com'),
      description: 'Contact email address',
      group: 'general',
    },
    {
      key: 'support_email',
      value: JSON.stringify('support@daddyscart.com'),
      description: 'Support email address',
      group: 'general',
    },
    {
      key: 'maintenance_mode',
      value: JSON.stringify(false),
      description: 'Enable/disable maintenance mode',
      group: 'general',
    },
    {
      key: 'allow_vendor_registration',
      value: JSON.stringify(true),
      description: 'Allow vendors to register',
      group: 'vendor',
    },
    {
      key: 'require_vendor_approval',
      value: JSON.stringify(true),
      description: 'Require admin approval for vendor accounts',
      group: 'vendor',
    },
    {
      key: 'max_product_images',
      value: JSON.stringify(10),
      description: 'Maximum number of images per product',
      group: 'product',
    },
    {
      key: 'enable_reviews',
      value: JSON.stringify(true),
      description: 'Enable product reviews',
      group: 'product',
    },
    {
      key: 'enable_wishlist',
      value: JSON.stringify(true),
      description: 'Enable wishlist feature',
      group: 'features',
    },
    {
      key: 'google_analytics_id',
      value: JSON.stringify(''),
      description: 'Google Analytics tracking ID',
      group: 'analytics',
    },
    {
      key: 'facebook_pixel_id',
      value: JSON.stringify(''),
      description: 'Facebook Pixel ID',
      group: 'analytics',
    },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('Default settings created');

  // Create some sample brands
  const brands = [
    { name: 'Apple', slug: 'apple', website: 'https://apple.com' },
    { name: 'Samsung', slug: 'samsung', website: 'https://samsung.com' },
    { name: 'Nike', slug: 'nike', website: 'https://nike.com' },
    { name: 'Adidas', slug: 'adidas', website: 'https://adidas.com' },
    { name: 'Sony', slug: 'sony', website: 'https://sony.com' },
  ];

  for (const brand of brands) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: brand,
    });
  }

  console.log('Sample brands created');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });