import * as z from 'zod';

export const newsletterSubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const newsletterUnsubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;
export type NewsletterUnsubscribeInput = z.infer<typeof newsletterUnsubscribeSchema>;