# Deployment Guide for Daddy's Cart Marketplace

## Prerequisites

- Vercel account
- PostgreSQL database (Supabase, Neon, or PlanetScale recommended)
- Stripe account
- SMTP service (Gmail, SendGrid, or similar)
- UploadThing account for file uploads

## Environment Variables Setup

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

## Database Setup

1. Create a PostgreSQL database
2. Update `DATABASE_URL` in your environment variables
3. Run migrations:

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
```

## Super Admin Credentials

After seeding, you'll have a super admin account:
- Email: `superadmin@daddyscart.com`
- Password: `SuperAdmin@123!`

**IMPORTANT**: Change these credentials immediately after first login!

## Vercel Deployment

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Deploy to Vercel

```bash
vercel
```

Follow the prompts to:
- Link to your Vercel account
- Create a new project or link to existing
- Configure project settings

### 3. Set Environment Variables in Vercel

Go to your project settings in Vercel Dashboard and add all environment variables:

#### Required Variables:

- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_URL`: Your production URL (e.g., https://yourdomain.com)
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `JWT_SECRET`: Generate with `openssl rand -base64 32`

#### Stripe Configuration:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: From Stripe dashboard
- `STRIPE_SECRET_KEY`: From Stripe dashboard
- `STRIPE_WEBHOOK_SECRET`: From Stripe webhook settings

#### Email Configuration:

- `SMTP_HOST`: Your SMTP server
- `SMTP_PORT`: Usually 587 for TLS
- `SMTP_USER`: SMTP username
- `SMTP_PASSWORD`: SMTP password
- `SMTP_FROM`: Default sender email

#### Optional OAuth:

- `GOOGLE_CLIENT_ID`: For Google login
- `GOOGLE_CLIENT_SECRET`: For Google login

### 4. Configure Stripe Webhooks

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.failed`
   - `checkout.session.completed`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

### 5. Production Database Migrations

After deployment, run migrations on production:

```bash
vercel env pull .env.production.local
npx prisma migrate deploy
```

## Post-Deployment Configuration

### 1. Admin Panel Setup

1. Login with super admin credentials
2. Navigate to `/admin/settings`
3. Configure:
   - General settings (site name, description)
   - Payment settings (Stripe keys, currency)
   - Shipping settings (fees, thresholds)
   - Email settings (SMTP configuration)
   - Vendor settings (commission rates)

### 2. Security Checklist

- [ ] Change super admin password
- [ ] Set up 2FA for admin accounts
- [ ] Configure rate limiting
- [ ] Enable HTTPS only
- [ ] Set secure headers
- [ ] Configure CORS properly
- [ ] Enable audit logging

### 3. Performance Optimization

- [ ] Enable Vercel Edge Functions
- [ ] Configure CDN for static assets
- [ ] Set up database connection pooling
- [ ] Enable Next.js ISR for product pages
- [ ] Configure Redis for session storage

## Monitoring

### 1. Set up monitoring with Vercel Analytics

```bash
npm install @vercel/analytics
```

### 2. Error Tracking

Consider integrating Sentry for error tracking:

```bash
npm install @sentry/nextjs
```

### 3. Database Monitoring

Use your database provider's monitoring tools or integrate with services like:
- Datadog
- New Relic
- LogRocket

## Backup Strategy

1. **Database Backups**: Configure automatic backups in your database provider
2. **Code Backups**: Use Git with proper branching strategy
3. **Media Backups**: UploadThing handles file backups automatically

## Scaling Considerations

1. **Database**: Use read replicas for scaling reads
2. **Caching**: Implement Redis for session and data caching
3. **CDN**: Use Vercel's Edge Network or Cloudflare
4. **Image Optimization**: Use Next.js Image component with Vercel's image optimization

## Troubleshooting

### Common Issues:

1. **Database Connection Issues**
   - Check connection string format
   - Ensure SSL is configured if required
   - Verify network access rules

2. **Build Failures**
   - Check all environment variables are set
   - Run `npm run build` locally first
   - Check Vercel build logs

3. **Payment Issues**
   - Verify Stripe keys are correct
   - Check webhook configuration
   - Test with Stripe CLI locally

## Support

For deployment issues:
- Vercel: https://vercel.com/support
- Database: Check your provider's documentation
- Application: Create an issue in the repository

## Production Checklist

- [ ] All environment variables configured
- [ ] Database migrated and seeded
- [ ] Admin credentials changed
- [ ] Stripe webhooks configured
- [ ] Email service configured
- [ ] SSL certificate active
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Rate limiting enabled
- [ ] Security headers configured