import { db } from './index';
import { users, categories, brands, settings } from './schema';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create super admin user
    const hashedPassword = await bcrypt.hash('SuperAdmin123!', 12);
    
    const [superAdmin] = await db.insert(users).values({
      email: 'admin@daddyscart.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      isVerified: true,
      isActive: true,
    }).returning();

    console.log('✅ Super admin created:', superAdmin.email);

    // Create default categories
    const defaultCategories = [
      {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets',
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashion and apparel',
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'Home & Garden',
        slug: 'home-garden',
        description: 'Home improvement and garden supplies',
        isActive: true,
        sortOrder: 3,
      },
      {
        name: 'Sports & Outdoors',
        slug: 'sports-outdoors',
        description: 'Sports equipment and outdoor gear',
        isActive: true,
        sortOrder: 4,
      },
      {
        name: 'Books',
        slug: 'books',
        description: 'Books and literature',
        isActive: true,
        sortOrder: 5,
      },
    ];

    await db.insert(categories).values(defaultCategories);
    console.log('✅ Default categories created');

    // Create default brands
    const defaultBrands = [
      {
        name: 'Apple',
        slug: 'apple',
        description: 'Technology company',
        isActive: true,
      },
      {
        name: 'Samsung',
        slug: 'samsung',
        description: 'Electronics manufacturer',
        isActive: true,
      },
      {
        name: 'Nike',
        slug: 'nike',
        description: 'Sports apparel and equipment',
        isActive: true,
      },
      {
        name: 'Adidas',
        slug: 'adidas',
        description: 'Athletic wear and shoes',
        isActive: true,
      },
    ];

    await db.insert(brands).values(defaultBrands);
    console.log('✅ Default brands created');

    // Create default settings
    const defaultSettings = [
      {
        key: 'site_name',
        value: "Daddy's Cart",
        type: 'STRING',
        description: 'Site name displayed in header and title',
        isPublic: true,
      },
      {
        key: 'site_description',
        value: 'Your one-stop marketplace for everything',
        type: 'STRING',
        description: 'Site description for SEO',
        isPublic: true,
      },
      {
        key: 'currency',
        value: 'USD',
        type: 'STRING',
        description: 'Default currency',
        isPublic: true,
      },
      {
        key: 'tax_rate',
        value: '0.08',
        type: 'NUMBER',
        description: 'Default tax rate (8%)',
        isPublic: false,
      },
      {
        key: 'shipping_rate',
        value: '9.99',
        type: 'NUMBER',
        description: 'Default shipping rate',
        isPublic: false,
      },
      {
        key: 'free_shipping_threshold',
        value: '75.00',
        type: 'NUMBER',
        description: 'Minimum order for free shipping',
        isPublic: true,
      },
      {
        key: 'max_upload_size',
        value: '5242880',
        type: 'NUMBER',
        description: 'Maximum file upload size in bytes (5MB)',
        isPublic: false,
      },
      {
        key: 'allowed_file_types',
        value: JSON.stringify(['image/jpeg', 'image/png', 'image/webp']),
        type: 'JSON',
        description: 'Allowed file types for uploads',
        isPublic: false,
      },
      {
        key: 'email_notifications',
        value: 'true',
        type: 'BOOLEAN',
        description: 'Enable email notifications',
        isPublic: false,
      },
      {
        key: 'maintenance_mode',
        value: 'false',
        type: 'BOOLEAN',
        description: 'Enable maintenance mode',
        isPublic: true,
      },
      {
        key: 'registration_enabled',
        value: 'true',
        type: 'BOOLEAN',
        description: 'Allow new user registration',
        isPublic: true,
      },
      {
        key: 'stripe_publishable_key',
        value: process.env.STRIPE_PUBLISHABLE_KEY || '',
        type: 'STRING',
        description: 'Stripe publishable key',
        isPublic: true,
      },
      {
        key: 'contact_email',
        value: 'support@daddyscart.com',
        type: 'STRING',
        description: 'Contact email address',
        isPublic: true,
      },
      {
        key: 'social_links',
        value: JSON.stringify({
          facebook: '',
          twitter: '',
          instagram: '',
          linkedin: '',
        }),
        type: 'JSON',
        description: 'Social media links',
        isPublic: true,
      },
    ];

    await db.insert(settings).values(defaultSettings);
    console.log('✅ Default settings created');

    console.log('🎉 Database seeding completed successfully!');
    console.log(`
📧 Super Admin Login:
Email: admin@daddyscart.com
Password: SuperAdmin123!
    `);

    return {
      superAdmin,
      message: 'Database seeded successfully',
    };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seed if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}