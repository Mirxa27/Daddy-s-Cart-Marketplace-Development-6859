# 🚀 Vercel Deployment Guide - Daddy's Cart Marketplace

This guide provides step-by-step instructions for deploying the fully functional marketplace to Vercel.

## 📧 Super Admin Credentials

After deployment, access the admin panel with these credentials:

**Super Admin Access:**
- **Email:** `admin@marketplace.vercel.app`
- **Password:** `SuperAdmin123!`
- **Admin Dashboard:** `https://marketplace.vercel.app/admin`

**Test Accounts:**
- **Vendor 1:** `vendor1@marketplace.vercel.app` / `VendorPass123!`
- **Vendor 2:** `vendor2@marketplace.vercel.app` / `VendorPass123!`
- **Customer 1:** `john.doe@example.com` / `UserPass123!`
- **Customer 2:** `jane.smith@example.com` / `UserPass123!`

## 🛠️ Prerequisites

1. **GitHub Account** - Code repository
2. **Vercel Account** - Deployment platform
3. **Supabase Account** - PostgreSQL database
4. **Stripe Account** - Payment processing
5. **Email Service** - SendGrid, Mailgun, or Gmail

## 📊 1. Database Setup (Supabase)

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and region
4. Set database password
5. Wait for project creation

### Get Database URL
1. Go to Project Settings → Database
2. Copy the connection string
3. Replace `[YOUR-PASSWORD]` with your database password

```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
```

## 💳 2. Stripe Setup

### Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Create account and complete verification
3. Go to Dashboard → Developers → API keys

### Get API Keys
```
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
```

### Setup Webhooks
1. Go to Dashboard → Developers → Webhooks
2. Add endpoint: `https://marketplace.vercel.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy webhook secret:
```
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## 📧 3. Email Service Setup (SendGrid)

### Create SendGrid Account
1. Go to [sendgrid.com](https://sendgrid.com)
2. Create account and verify
3. Go to Settings → API Keys
4. Create new API key with full access

### Configuration
```
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your_sendgrid_api_key"
EMAIL_FROM="Daddy's Cart <noreply@marketplace.vercel.app>"
```

## 🌐 4. Vercel Deployment

### Step 1: Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select "Daddy's Cart Marketplace"

### Step 2: Configure Build Settings
- **Framework Preset:** Next.js
- **Build Command:** `npm run vercel-build`
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install`

### Step 3: Environment Variables

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"

# Authentication
NEXTAUTH_SECRET="production-nextauth-secret-32-chars-minimum"
NEXTAUTH_URL="https://marketplace.vercel.app"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_live_your_publishable_key"
STRIPE_SECRET_KEY="sk_live_your_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Email
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your_sendgrid_api_key"
EMAIL_FROM="Daddy's Cart <noreply@marketplace.vercel.app>"

# App Configuration
NEXT_PUBLIC_APP_URL="https://marketplace.vercel.app"
NEXT_PUBLIC_APP_NAME="Daddy's Cart Marketplace"

# Admin Credentials
SUPER_ADMIN_EMAIL="admin@marketplace.vercel.app"
SUPER_ADMIN_PASSWORD="SuperAdmin123!"

# Security
ENCRYPTION_KEY="32-character-encryption-key-production"
JWT_SECRET="jwt-secret-key-for-production-tokens"

# Optional Services
GOOGLE_CLIENT_ID="your_google_oauth_client_id"
GOOGLE_CLIENT_SECRET="your_google_oauth_secret"
UPLOADTHING_SECRET="sk_live_uploadthing_secret"
UPLOADTHING_APP_ID="uploadthing_app_id"
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at `https://marketplace.vercel.app`

## 🔧 5. Post-Deployment Configuration

### Database Migration & Seeding
The build script automatically handles:
1. Database schema migration
2. Seeding with sample data
3. Creating super admin account

### Stripe Webhook Configuration
1. Update webhook endpoint URL to: `https://marketplace.vercel.app/api/webhooks/stripe`
2. Test webhook delivery in Stripe Dashboard

### Email Template Testing
1. Register a new account to test welcome email
2. Test password reset functionality
3. Place a test order to verify order emails

## 📱 6. Mobile Optimization Verification

### Test on Multiple Devices
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] iPad (Safari)
- [ ] Desktop (Chrome, Firefox, Safari)

### Performance Checks
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals passing
- [ ] Images loading properly
- [ ] Touch targets ≥ 44px
- [ ] Forms work on mobile

## 🔒 7. Security Checklist

### SSL/TLS
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Security headers configured
- [ ] HSTS enabled

### Authentication
- [ ] Strong password requirements
- [ ] Email verification working
- [ ] Session management secure
- [ ] Role-based access control

### Data Protection
- [ ] Input validation active
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] File upload security

## 📊 8. Monitoring Setup

### Application Monitoring
1. Enable Vercel Analytics
2. Set up Sentry (optional)
3. Configure Google Analytics
4. Monitor error logs

### Database Monitoring
1. Enable Supabase monitoring
2. Set up backup schedules
3. Monitor connection limits
4. Track query performance

## 🧪 9. Testing Checklist

### Core Functionality
- [ ] User registration and login
- [ ] Product browsing and search
- [ ] Shopping cart operations
- [ ] Checkout process
- [ ] Payment processing
- [ ] Order management
- [ ] Admin dashboard access

### Email Functionality
- [ ] Welcome emails
- [ ] Email verification
- [ ] Password reset
- [ ] Order confirmations
- [ ] Shipping notifications

### Admin Features
- [ ] Dashboard analytics
- [ ] Product management
- [ ] Order management
- [ ] User management
- [ ] Settings configuration

## 🚀 10. Production Optimization

### Performance
- [ ] Image optimization enabled
- [ ] Code splitting working
- [ ] Caching configured
- [ ] Bundle size optimized

### SEO
- [ ] Meta tags configured
- [ ] Sitemap generated
- [ ] Robots.txt configured
- [ ] Structured data added

### Accessibility
- [ ] ARIA labels present
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast compliance

## 🔄 11. Maintenance

### Regular Tasks
- [ ] Monitor application logs
- [ ] Review security updates
- [ ] Update dependencies
- [ ] Backup database
- [ ] Monitor performance

### Scaling Considerations
- [ ] Database performance
- [ ] CDN for static assets
- [ ] Redis for caching
- [ ] Load balancing

## 🆘 12. Troubleshooting

### Common Issues

**Build Failures:**
- Check environment variables
- Verify database connection
- Review build logs

**Database Issues:**
- Check connection string
- Verify migrations ran
- Check Supabase status

**Payment Issues:**
- Verify Stripe keys
- Check webhook configuration
- Test in Stripe dashboard

**Email Issues:**
- Verify SMTP settings
- Check email service status
- Test email templates

### Support Resources
- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Supabase Documentation:** [supabase.com/docs](https://supabase.com/docs)
- **Stripe Documentation:** [stripe.com/docs](https://stripe.com/docs)
- **Next.js Documentation:** [nextjs.org/docs](https://nextjs.org/docs)

## 📞 Support

For deployment support:
- **Email:** support@marketplace.vercel.app
- **Documentation:** This deployment guide
- **Health Check:** `https://marketplace.vercel.app/api/health`

---

## 🎉 Deployment Complete!

Your marketplace is now live at: **https://marketplace.vercel.app**

### Quick Access Links:
- **Homepage:** https://marketplace.vercel.app
- **Admin Dashboard:** https://marketplace.vercel.app/admin
- **Products:** https://marketplace.vercel.app/products
- **Sign In:** https://marketplace.vercel.app/auth/signin

### Super Admin Login:
- **Email:** admin@marketplace.vercel.app
- **Password:** SuperAdmin123!

**Your production-ready e-commerce marketplace is now fully operational! 🛒✨**