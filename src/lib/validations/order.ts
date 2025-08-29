import * as z from 'zod';

export const addressSchema = z.object({
  type: z.enum(['SHIPPING', 'BILLING']).default('SHIPPING'),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  isDefault: z.boolean().default(false),
});

export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  sameAsShipping: z.boolean().default(true),
  paymentMethod: z.enum(['stripe', 'paypal', 'cod']),
  notes: z.string().optional(),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional().nullable(),
  quantity: z.number().int().positive('Quantity must be at least 1'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;