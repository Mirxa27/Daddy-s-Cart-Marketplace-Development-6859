import * as z from 'zod';

export const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be a positive number'),
  compareAtPrice: z.number().positive().optional().nullable(),
  cost: z.number().positive().optional().nullable(),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  trackQuantity: z.boolean().default(true),
  quantity: z.number().int().nonnegative('Quantity must be a non-negative integer'),
  allowBackorder: z.boolean().default(false),
  categoryId: z.string().min(1, 'Please select a category'),
  brandId: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  metaTitle: z.string().max(60, 'Meta title must be less than 60 characters').optional().nullable(),
  metaDescription: z.string().max(160, 'Meta description must be less than 160 characters').optional().nullable(),
  images: z.array(z.object({
    url: z.string().url('Invalid image URL'),
    alt: z.string().optional().nullable(),
    position: z.number().int().nonnegative(),
  })).optional(),
  variants: z.array(z.object({
    name: z.string().min(1, 'Variant name is required'),
    price: z.number().positive('Price must be positive'),
    quantity: z.number().int().nonnegative(),
    sku: z.string().optional().nullable(),
    options: z.array(z.object({
      name: z.string().min(1, 'Option name is required'),
      value: z.string().min(1, 'Option value is required'),
    })),
  })).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  description: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
  parentId: z.string().optional().nullable(),
});

export const brandSchema = z.object({
  name: z.string().min(2, 'Brand name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  description: z.string().optional().nullable(),
  logo: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
});

export const reviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  title: z.string().max(100, 'Title must be less than 100 characters').optional().nullable(),
  comment: z.string().min(10, 'Review must be at least 10 characters'),
});

export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type BrandInput = z.infer<typeof brandSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;