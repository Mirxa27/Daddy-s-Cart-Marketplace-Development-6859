import { PrismaClient, Role, ProductStatus, OrderStatus, PaymentStatus, AddressType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create Super Admin User
  const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!', 12);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: process.env.SUPER_ADMIN_EMAIL || 'admin@sourcekom.com' },
    update: {},
    create: {
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@sourcekom.com',
      name: 'Super Administrator',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      isActive: true,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created Super Admin:', superAdmin.email);

  // Create Categories
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Latest electronic gadgets and devices',
      image: '/categories/electronics.jpg',
    },
  });

  const fashion = await prisma.category.upsert({
    where: { slug: 'fashion' },
    update: {},
    create: {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Trendy clothing and accessories',
      image: '/categories/fashion.jpg',
    },
  });

  const home = await prisma.category.upsert({
    where: { slug: 'home-garden' },
    update: {},
    create: {
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Everything for your home and garden',
      image: '/categories/home-garden.jpg',
    },
  });

  const books = await prisma.category.upsert({
    where: { slug: 'books' },
    update: {},
    create: {
      name: 'Books',
      slug: 'books',
      description: 'Books for all ages and interests',
      image: '/categories/books.jpg',
    },
  });

  const sports = await prisma.category.upsert({
    where: { slug: 'sports-outdoors' },
    update: {},
    create: {
      name: 'Sports & Outdoors',
      slug: 'sports-outdoors',
      description: 'Sports equipment and outdoor gear',
      image: '/categories/sports.jpg',
    },
  });

  console.log('✅ Created Categories');

  // Create Brands
  const appleBrand = await prisma.brand.upsert({
    where: { slug: 'apple' },
    update: {},
    create: {
      name: 'Apple',
      slug: 'apple',
      description: 'Think Different',
      logo: '/brands/apple.png',
      website: 'https://www.apple.com',
    },
  });

  const samsungBrand = await prisma.brand.upsert({
    where: { slug: 'samsung' },
    update: {},
    create: {
      name: 'Samsung',
      slug: 'samsung',
      description: 'Inspire the World, Create the Future',
      logo: '/brands/samsung.png',
      website: 'https://www.samsung.com',
    },
  });

  const nikeBrand = await prisma.brand.upsert({
    where: { slug: 'nike' },
    update: {},
    create: {
      name: 'Nike',
      slug: 'nike',
      description: 'Just Do It',
      logo: '/brands/nike.png',
      website: 'https://www.nike.com',
    },
  });

  const adidasBrand = await prisma.brand.upsert({
    where: { slug: 'adidas' },
    update: {},
    create: {
      name: 'Adidas',
      slug: 'adidas',
      description: 'Impossible is Nothing',
      logo: '/brands/adidas.png',
      website: 'https://www.adidas.com',
    },
  });

  const sonyBrand = await prisma.brand.upsert({
    where: { slug: 'sony' },
    update: {},
    create: {
      name: 'Sony',
      slug: 'sony',
      description: 'Be Moved',
      logo: '/brands/sony.png',
      website: 'https://www.sony.com',
    },
  });

  console.log('✅ Created Brands');

  // Create Vendor Users
  const vendorPassword = await bcrypt.hash('VendorPass123!', 12);
  
  const vendor1 = await prisma.user.upsert({
    where: { email: 'vendor1@sourcekom.com' },
    update: {},
    create: {
      email: 'vendor1@sourcekom.com',
      name: 'Tech Store Vendor',
      password: vendorPassword,
      role: Role.VENDOR,
      isActive: true,
      emailVerified: new Date(),
      phone: '+1234567890',
    },
  });

  const vendor2 = await prisma.user.upsert({
    where: { email: 'vendor2@sourcekom.com' },
    update: {},
    create: {
      email: 'vendor2@sourcekom.com',
      name: 'Fashion Store Vendor',
      password: vendorPassword,
      role: Role.VENDOR,
      isActive: true,
      emailVerified: new Date(),
      phone: '+1234567891',
    },
  });

  console.log('✅ Created Vendor Users');

  // Create Stores
  const techStore = await prisma.store.upsert({
    where: { slug: 'tech-haven' },
    update: {},
    create: {
      name: 'Tech Haven',
      slug: 'tech-haven',
      description: 'Your one-stop shop for the latest technology',
      logo: '/stores/tech-haven-logo.png',
      banner: '/stores/tech-haven-banner.jpg',
      userId: vendor1.id,
      isActive: true,
      isVerified: true,
      rating: 4.8,
      totalSales: 150,
      businessName: 'Tech Haven LLC',
      businessEmail: 'business@techhaven.com',
      businessPhone: '+1234567890',
      businessAddress: '123 Tech Street, Silicon Valley, CA 94000',
      taxId: 'TH123456789',
    },
  });

  const fashionStore = await prisma.store.upsert({
    where: { slug: 'style-central' },
    update: {},
    create: {
      name: 'Style Central',
      slug: 'style-central',
      description: 'Fashion forward clothing and accessories',
      logo: '/stores/style-central-logo.png',
      banner: '/stores/style-central-banner.jpg',
      userId: vendor2.id,
      isActive: true,
      isVerified: true,
      rating: 4.6,
      totalSales: 89,
      businessName: 'Style Central Inc',
      businessEmail: 'business@stylecentral.com',
      businessPhone: '+1234567891',
      businessAddress: '456 Fashion Ave, New York, NY 10001',
      taxId: 'SC987654321',
    },
  });

  console.log('✅ Created Stores');

  // Create Products
  const iphone = await prisma.product.upsert({
    where: { slug: 'iphone-15-pro' },
    update: {},
    create: {
      name: 'iPhone 15 Pro',
      slug: 'iphone-15-pro',
      description: 'The most advanced iPhone yet with titanium design, A17 Pro chip, and pro camera system.',
      price: 999.99,
      compareAtPrice: 1099.99,
      cost: 750.00,
      sku: 'IPH15PRO128',
      barcode: '194253000000',
      trackQuantity: true,
      quantity: 50,
      allowBackorder: false,
      metaTitle: 'iPhone 15 Pro - Buy Now at Best Price',
      metaDescription: 'Get the latest iPhone 15 Pro with titanium design and advanced features. Free shipping available.',
      status: ProductStatus.PUBLISHED,
      publishedAt: new Date(),
      storeId: techStore.id,
      categoryId: electronics.id,
      brandId: appleBrand.id,
      views: 1250,
      sales: 25,
      rating: 4.9,
      reviewCount: 18,
      images: {
        create: [
          {
            url: '/products/iphone-15-pro-1.jpg',
            alt: 'iPhone 15 Pro Front View',
            position: 0,
          },
          {
            url: '/products/iphone-15-pro-2.jpg',
            alt: 'iPhone 15 Pro Back View',
            position: 1,
          },
          {
            url: '/products/iphone-15-pro-3.jpg',
            alt: 'iPhone 15 Pro Side View',
            position: 2,
          },
        ],
      },
      variants: {
        create: [
          {
            name: '128GB Natural Titanium',
            sku: 'IPH15PRO128NT',
            price: 999.99,
            quantity: 20,
            options: {
              create: [
                { name: 'Storage', value: '128GB' },
                { name: 'Color', value: 'Natural Titanium' },
              ],
            },
          },
          {
            name: '256GB Natural Titanium',
            sku: 'IPH15PRO256NT',
            price: 1099.99,
            quantity: 15,
            options: {
              create: [
                { name: 'Storage', value: '256GB' },
                { name: 'Color', value: 'Natural Titanium' },
              ],
            },
          },
          {
            name: '512GB Natural Titanium',
            sku: 'IPH15PRO512NT',
            price: 1299.99,
            quantity: 10,
            options: {
              create: [
                { name: 'Storage', value: '512GB' },
                { name: 'Color', value: 'Natural Titanium' },
              ],
            },
          },
        ],
      },
    },
  });

  const samsungGalaxy = await prisma.product.upsert({
    where: { slug: 'samsung-galaxy-s24-ultra' },
    update: {},
    create: {
      name: 'Samsung Galaxy S24 Ultra',
      slug: 'samsung-galaxy-s24-ultra',
      description: 'Experience the power of Galaxy AI with the S24 Ultra. Advanced camera, S Pen, and all-day battery.',
      price: 1199.99,
      compareAtPrice: 1299.99,
      cost: 900.00,
      sku: 'SGS24U256',
      barcode: '887276000000',
      trackQuantity: true,
      quantity: 30,
      allowBackorder: false,
      metaTitle: 'Samsung Galaxy S24 Ultra - Latest Android Phone',
      metaDescription: 'Discover the Samsung Galaxy S24 Ultra with AI features, advanced camera system, and S Pen.',
      status: ProductStatus.PUBLISHED,
      publishedAt: new Date(),
      storeId: techStore.id,
      categoryId: electronics.id,
      brandId: samsungBrand.id,
      views: 890,
      sales: 15,
      rating: 4.7,
      reviewCount: 12,
      images: {
        create: [
          {
            url: '/products/galaxy-s24-ultra-1.jpg',
            alt: 'Samsung Galaxy S24 Ultra Front View',
            position: 0,
          },
          {
            url: '/products/galaxy-s24-ultra-2.jpg',
            alt: 'Samsung Galaxy S24 Ultra Back View',
            position: 1,
          },
        ],
      },
    },
  });

  const nikeShoes = await prisma.product.upsert({
    where: { slug: 'nike-air-max-270' },
    update: {},
    create: {
      name: 'Nike Air Max 270',
      slug: 'nike-air-max-270',
      description: 'The Nike Air Max 270 delivers visible Max Air cushioning and modern style.',
      price: 150.00,
      compareAtPrice: 180.00,
      cost: 90.00,
      sku: 'NIKE270BLK',
      barcode: '194501000000',
      trackQuantity: true,
      quantity: 100,
      allowBackorder: true,
      metaTitle: 'Nike Air Max 270 - Comfortable Running Shoes',
      metaDescription: 'Shop Nike Air Max 270 with visible Max Air cushioning. Available in multiple colors and sizes.',
      status: ProductStatus.PUBLISHED,
      publishedAt: new Date(),
      storeId: fashionStore.id,
      categoryId: fashion.id,
      brandId: nikeBrand.id,
      views: 650,
      sales: 45,
      rating: 4.5,
      reviewCount: 28,
      images: {
        create: [
          {
            url: '/products/nike-air-max-270-1.jpg',
            alt: 'Nike Air Max 270 Side View',
            position: 0,
          },
          {
            url: '/products/nike-air-max-270-2.jpg',
            alt: 'Nike Air Max 270 Top View',
            position: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            name: 'Size 8 - Black',
            sku: 'NIKE270BLK8',
            price: 150.00,
            quantity: 20,
            options: {
              create: [
                { name: 'Size', value: '8' },
                { name: 'Color', value: 'Black' },
              ],
            },
          },
          {
            name: 'Size 9 - Black',
            sku: 'NIKE270BLK9',
            price: 150.00,
            quantity: 25,
            options: {
              create: [
                { name: 'Size', value: '9' },
                { name: 'Color', value: 'Black' },
              ],
            },
          },
          {
            name: 'Size 10 - Black',
            sku: 'NIKE270BLK10',
            price: 150.00,
            quantity: 30,
            options: {
              create: [
                { name: 'Size', value: '10' },
                { name: 'Color', value: 'Black' },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Created Products');

  // Create Regular Users
  const regularUserPassword = await bcrypt.hash('UserPass123!', 12);
  
  const user1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      name: 'John Doe',
      password: regularUserPassword,
      role: Role.USER,
      isActive: true,
      emailVerified: new Date(),
      phone: '+1234567892',
      dateOfBirth: new Date('1990-05-15'),
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      password: regularUserPassword,
      role: Role.USER,
      isActive: true,
      emailVerified: new Date(),
      phone: '+1234567893',
      dateOfBirth: new Date('1985-08-22'),
    },
  });

  console.log('✅ Created Regular Users');

  // Create Addresses
  const address1 = await prisma.address.create({
    data: {
      userId: user1.id,
      type: AddressType.SHIPPING,
      isDefault: true,
      fullName: 'John Doe',
      phone: '+1234567892',
      street: '123 Main Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
    },
  });

  const address2 = await prisma.address.create({
    data: {
      userId: user2.id,
      type: AddressType.SHIPPING,
      isDefault: true,
      fullName: 'Jane Smith',
      phone: '+1234567893',
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90210',
      country: 'United States',
    },
  });

  console.log('✅ Created Addresses');

  // Create Orders
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2024-000001',
      userId: user1.id,
      storeId: techStore.id,
      subtotal: 999.99,
      tax: 80.00,
      shipping: 0.00,
      discount: 0.00,
      total: 1079.99,
      status: OrderStatus.DELIVERED,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: 'stripe',
      paymentId: 'pi_test_1234567890',
      shippingAddressId: address1.id,
      trackingNumber: 'TRK123456789',
      paidAt: new Date('2024-01-15T10:30:00Z'),
      shippedAt: new Date('2024-01-16T14:20:00Z'),
      deliveredAt: new Date('2024-01-18T16:45:00Z'),
      items: {
        create: [
          {
            productId: iphone.id,
            name: 'iPhone 15 Pro',
            price: 999.99,
            quantity: 1,
            total: 999.99,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2024-000002',
      userId: user2.id,
      storeId: fashionStore.id,
      subtotal: 300.00,
      tax: 24.00,
      shipping: 15.00,
      discount: 30.00,
      total: 309.00,
      status: OrderStatus.PROCESSING,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: 'stripe',
      paymentId: 'pi_test_0987654321',
      shippingAddressId: address2.id,
      paidAt: new Date('2024-01-20T09:15:00Z'),
      items: {
        create: [
          {
            productId: nikeShoes.id,
            name: 'Nike Air Max 270',
            price: 150.00,
            quantity: 2,
            total: 300.00,
          },
        ],
      },
    },
  });

  console.log('✅ Created Orders');

  // Create Reviews
  await prisma.review.createMany({
    data: [
      {
        productId: iphone.id,
        userId: user1.id,
        rating: 5,
        title: 'Amazing phone!',
        comment: 'The iPhone 15 Pro exceeded my expectations. The camera quality is incredible and the titanium build feels premium.',
        helpful: 8,
        verified: true,
      },
      {
        productId: nikeShoes.id,
        userId: user2.id,
        rating: 4,
        title: 'Comfortable and stylish',
        comment: 'Great shoes for daily wear. Very comfortable and the design is sleek. Would recommend!',
        helpful: 5,
        verified: true,
      },
    ],
  });

  console.log('✅ Created Reviews');

  // Create Settings
  await prisma.setting.createMany({
    data: [
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
        value: JSON.stringify({ code: 'USD', symbol: '$', name: 'US Dollar' }),
        description: 'Default currency settings',
        group: 'general',
      },
      {
        key: 'tax_rate',
        value: JSON.stringify(8.0),
        description: 'Default tax rate percentage',
        group: 'financial',
      },
      {
        key: 'shipping_methods',
        value: JSON.stringify([
          { id: 'standard', name: 'Standard Shipping', price: 9.99, estimatedDays: '5-7' },
          { id: 'express', name: 'Express Shipping', price: 19.99, estimatedDays: '2-3' },
          { id: 'overnight', name: 'Overnight Shipping', price: 39.99, estimatedDays: '1' },
        ]),
        description: 'Available shipping methods',
        group: 'shipping',
      },
      {
        key: 'payment_methods',
        value: JSON.stringify(['stripe', 'paypal', 'apple_pay', 'google_pay']),
        description: 'Enabled payment methods',
        group: 'payment',
      },
      {
        key: 'email_templates',
        value: JSON.stringify({
          welcome: { subject: 'Welcome to Daddy\'s Cart!', enabled: true },
          order_confirmation: { subject: 'Order Confirmation - #{orderNumber}', enabled: true },
          order_shipped: { subject: 'Your Order Has Been Shipped - #{orderNumber}', enabled: true },
          password_reset: { subject: 'Reset Your Password', enabled: true },
        }),
        description: 'Email template configurations',
        group: 'email',
      },
      {
        key: 'vendor_commission',
        value: JSON.stringify(15.0),
        description: 'Default vendor commission percentage',
        group: 'vendor',
      },
      {
        key: 'minimum_order_amount',
        value: JSON.stringify(25.00),
        description: 'Minimum order amount for checkout',
        group: 'order',
      },
      {
        key: 'maintenance_mode',
        value: JSON.stringify(false),
        description: 'Enable/disable maintenance mode',
        group: 'system',
      },
      {
        key: 'contact_email',
        value: JSON.stringify('contact@sourcekom.com'),
        description: 'Contact email address',
        group: 'general',
      },
      {
        key: 'support_email',
        value: JSON.stringify('support@sourcekom.com'),
        description: 'Support email address',
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
    ],
  });

  console.log('✅ Created Settings');

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📧 Super Admin Credentials:');
  console.log(`Email: ${process.env.SUPER_ADMIN_EMAIL || 'admin@sourcekom.com'}`);
  console.log(`Password: ${process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!'}`);
  console.log('');
  console.log('🏪 Vendor Credentials:');
  console.log('Email: vendor1@sourcekom.com | Password: VendorPass123!');
  console.log('Email: vendor2@sourcekom.com | Password: VendorPass123!');
  console.log('');
  console.log('👤 User Credentials:');
  console.log('Email: john.doe@example.com | Password: UserPass123!');
  console.log('Email: jane.smith@example.com | Password: UserPass123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });