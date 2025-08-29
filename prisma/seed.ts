import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@daddyscart.com' },
    update: {},
    create: {
      email: 'admin@daddyscart.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });

  console.log('Created admin user:', admin.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and accessories',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'clothing' },
      update: {},
      create: {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashion and apparel',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'home-garden' },
      update: {},
      create: {
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Home decor and garden supplies',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'sports' },
      update: {},
      create: {
        name: 'Sports & Outdoors',
        slug: 'sports',
        description: 'Sports equipment and outdoor gear',
      },
    }),
  ]);

  console.log('Created categories:', categories.length);

  // Create brands
  const brands = await Promise.all([
    prisma.brand.upsert({
      where: { slug: 'apple' },
      update: {},
      create: {
        name: 'Apple',
        slug: 'apple',
        description: 'Premium electronics and devices',
        website: 'https://apple.com',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'samsung' },
      update: {},
      create: {
        name: 'Samsung',
        slug: 'samsung',
        description: 'Electronics and home appliances',
        website: 'https://samsung.com',
      },
    }),
    prisma.brand.upsert({
      where: { slug: 'nike' },
      update: {},
      create: {
        name: 'Nike',
        slug: 'nike',
        description: 'Athletic footwear and apparel',
        website: 'https://nike.com',
      },
    }),
  ]);

  console.log('Created brands:', brands.length);

  // Create vendor user
  const vendorPassword = await bcrypt.hash('vendor123', 10);
  const vendor = await prisma.user.upsert({
    where: { email: 'vendor@daddyscart.com' },
    update: {},
    create: {
      email: 'vendor@daddyscart.com',
      password: vendorPassword,
      name: 'Demo Vendor',
      role: 'VENDOR',
      emailVerified: new Date(),
    },
  });

  // Create store for vendor
  const store = await prisma.store.upsert({
    where: { slug: 'demo-store' },
    update: {},
    create: {
      name: 'Demo Store',
      slug: 'demo-store',
      description: 'Your one-stop shop for quality products',
      userId: vendor.id,
      isActive: true,
      isVerified: true,
      businessName: 'Demo Store LLC',
      businessEmail: 'business@demostore.com',
      businessPhone: '+1234567890',
    },
  });

  console.log('Created store:', store.name);

  // Create sample products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        description: 'The latest iPhone with advanced features and stunning design.',
        price: 999.99,
        compareAtPrice: 1099.99,
        quantity: 50,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        storeId: store.id,
        categoryId: categories[0].id, // Electronics
        brandId: brands[0].id, // Apple
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569',
              alt: 'iPhone 15 Pro',
              position: 0,
            },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Samsung Galaxy S24',
        slug: 'samsung-galaxy-s24',
        description: 'Premium Android smartphone with cutting-edge technology.',
        price: 899.99,
        compareAtPrice: 999.99,
        quantity: 30,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        storeId: store.id,
        categoryId: categories[0].id, // Electronics
        brandId: brands[1].id, // Samsung
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c',
              alt: 'Samsung Galaxy S24',
              position: 0,
            },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Nike Air Max 270',
        slug: 'nike-air-max-270',
        description: 'Comfortable and stylish running shoes for everyday wear.',
        price: 149.99,
        compareAtPrice: 179.99,
        quantity: 100,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        storeId: store.id,
        categoryId: categories[3].id, // Sports
        brandId: brands[2].id, // Nike
        images: {
          create: [
            {
              url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
              alt: 'Nike Air Max 270',
              position: 0,
            },
          ],
        },
      },
    }),
  ]);

  console.log('Created products:', products.length);

  // Create system settings
  const settings = await Promise.all([
    prisma.setting.upsert({
      where: { key: 'site_name' },
      update: {},
      create: {
        key: 'site_name',
        value: '"Daddy\'s Cart Marketplace"',
        description: 'The name of the marketplace',
        group: 'general',
      },
    }),
    prisma.setting.upsert({
      where: { key: 'free_shipping_threshold' },
      update: {},
      create: {
        key: 'free_shipping_threshold',
        value: '50',
        description: 'Minimum order amount for free shipping',
        group: 'shipping',
      },
    }),
    prisma.setting.upsert({
      where: { key: 'tax_rate' },
      update: {},
      create: {
        key: 'tax_rate',
        value: '0.08',
        description: 'Default tax rate (8%)',
        group: 'payment',
      },
    }),
  ]);

  console.log('Created settings:', settings.length);

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });