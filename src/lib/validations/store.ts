import * as z from 'zod';

export const storeSchema = z.object({
  name: z.string().min(3, 'Store name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().min(10, 'Description must be at least 10 characters').optional().nullable(),
  logo: z.string().url().optional().nullable(),
  banner: z.string().url().optional().nullable(),
  businessName: z.string().min(3, 'Business name is required'),
  businessEmail: z.string().email('Valid business email is required'),
  businessPhone: z.string().min(10, 'Valid phone number is required'),
  businessAddress: z.string().min(10, 'Business address is required'),
  taxId: z.string().optional().nullable(),
});

export const storeSettingsSchema = z.object({
  isActive: z.boolean(),
  businessName: z.string().optional(),
  businessEmail: z.string().email().optional(),
  businessPhone: z.string().optional(),
  businessAddress: z.string().optional(),
  taxId: z.string().optional(),
});

export type StoreInput = z.infer<typeof storeSchema>;
export type StoreSettingsInput = z.infer<typeof storeSettingsSchema>;