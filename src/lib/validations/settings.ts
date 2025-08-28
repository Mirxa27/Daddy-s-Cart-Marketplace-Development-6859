import * as z from 'zod';

export const settingSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.any(),
  description: z.string().optional().nullable(),
  group: z.string().optional().nullable(),
});

export const generalSettingsSchema = z.object({
  site_name: z.string().min(1, 'Site name is required'),
  site_description: z.string().optional(),
  contact_email: z.string().email('Valid email is required'),
  support_email: z.string().email('Valid email is required'),
  maintenance_mode: z.boolean(),
});

export const paymentSettingsSchema = z.object({
  currency: z.object({
    code: z.string().length(3, 'Currency code must be 3 characters'),
    symbol: z.string().min(1, 'Currency symbol is required'),
  }),
  tax_rate: z.number().min(0).max(1, 'Tax rate must be between 0 and 1'),
  stripe_public_key: z.string().optional(),
  stripe_secret_key: z.string().optional(),
});

export const shippingSettingsSchema = z.object({
  shipping_fee: z.number().min(0, 'Shipping fee must be non-negative'),
  free_shipping_threshold: z.number().min(0, 'Threshold must be non-negative'),
});

export const emailSettingsSchema = z.object({
  smtp_host: z.string().min(1, 'SMTP host is required'),
  smtp_port: z.number().int().positive('Port must be a positive number'),
  smtp_user: z.string().optional(),
  smtp_password: z.string().optional(),
});

export const vendorSettingsSchema = z.object({
  allow_vendor_registration: z.boolean(),
  require_vendor_approval: z.boolean(),
  commission_rate: z.number().min(0).max(1, 'Commission rate must be between 0 and 1'),
});

export type SettingInput = z.infer<typeof settingSchema>;
export type GeneralSettingsInput = z.infer<typeof generalSettingsSchema>;
export type PaymentSettingsInput = z.infer<typeof paymentSettingsSchema>;
export type ShippingSettingsInput = z.infer<typeof shippingSettingsSchema>;
export type EmailSettingsInput = z.infer<typeof emailSettingsSchema>;
export type VendorSettingsInput = z.infer<typeof vendorSettingsSchema>;