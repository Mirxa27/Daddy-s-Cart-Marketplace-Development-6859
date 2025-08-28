-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'VENDOR', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'PARTIALLY_PAID', 'REFUNDED', 'PARTIALLY_REFUNDED');
CREATE TYPE "AddressType" AS ENUM ('SHIPPING', 'BILLING');
CREATE TYPE "NotificationType" AS ENUM ('ORDER', 'PAYMENT', 'SHIPPING', 'REVIEW', 'SYSTEM', 'PROMOTION');

-- CreateTable Users
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL UNIQUE,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for User
CREATE INDEX "User_email_idx" ON "User"("email");

-- Create initial super admin user (password: SuperAdmin@123!)
INSERT INTO "User" (
    "id",
    "email",
    "emailVerified",
    "password",
    "name",
    "role",
    "isActive"
) VALUES (
    gen_random_uuid(),
    'superadmin@daddyscart.com',
    CURRENT_TIMESTAMP,
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY3pp/TvllF8lXC',
    'Super Administrator',
    'SUPER_ADMIN',
    true
);

-- Create default settings
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL UNIQUE,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "group" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO "Setting" ("key", "value", "description", "group") VALUES
('site_name', '"Daddy''s Cart Marketplace"', 'The name of the marketplace', 'general'),
('site_description', '"Your premier online marketplace for everything you need"', 'Site description for SEO', 'general'),
('currency', '{"code": "USD", "symbol": "$"}', 'Default currency', 'payment'),
('tax_rate', '0.08', 'Default tax rate (8%)', 'payment'),
('shipping_fee', '5.99', 'Default shipping fee', 'shipping'),
('free_shipping_threshold', '50', 'Order amount for free shipping', 'shipping'),
('commission_rate', '0.10', 'Platform commission rate (10%)', 'vendor'),
('maintenance_mode', 'false', 'Enable/disable maintenance mode', 'general'),
('allow_vendor_registration', 'true', 'Allow vendors to register', 'vendor'),
('require_vendor_approval', 'true', 'Require admin approval for vendor accounts', 'vendor');

-- Create Categories
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "image" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL
);

-- Insert default categories
INSERT INTO "Category" ("name", "slug", "description") VALUES
('Electronics', 'electronics', 'Electronic devices and accessories'),
('Clothing', 'clothing', 'Fashion and apparel'),
('Home & Garden', 'home-garden', 'Home decor and garden supplies'),
('Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear'),
('Books', 'books', 'Books and educational materials'),
('Toys & Games', 'toys-games', 'Toys, games, and entertainment'),
('Health & Beauty', 'health-beauty', 'Health and beauty products'),
('Food & Beverages', 'food-beverages', 'Food items and drinks'),
('Automotive', 'automotive', 'Auto parts and accessories'),
('Jewelry', 'jewelry', 'Jewelry and watches');

-- Create indexes for all tables
CREATE INDEX "Setting_key_idx" ON "Setting"("key");
CREATE INDEX "Setting_group_idx" ON "Setting"("group");
CREATE INDEX "Category_slug_idx" ON "Category"("slug");
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");