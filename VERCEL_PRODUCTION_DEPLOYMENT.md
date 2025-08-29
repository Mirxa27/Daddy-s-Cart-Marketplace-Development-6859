# 🚀 Vercel Production Deployment Guide

## ✅ Database Configuration Complete

Your PostgreSQL database has been successfully configured and seeded with initial data.

**Database URL:** 
```
postgres://f5e800d6e88569aea932d09de1d5477a84c91489f232fe61fd1ec480536cc7bc:sk_EmH7oySmYdxOghSO4nKXs@db.prisma.io:5432/postgres?sslmode=require
```

## 📋 Pre-Deployment Checklist

- [x] Database schema created and pushed
- [x] Initial data seeded (admin user, categories, products)
- [x] Environment variables configured
- [x] Prisma client generated
- [x] Authentication system configured
- [x] Build errors resolved

## 🔧 Step-by-Step Deployment Instructions

### Step 1: Generate Secure Secrets

Run the following command to generate secure secrets:

```bash
node scripts/generate-secrets.js
```

Save the generated secrets for the next step.

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI

1. Install Vercel CLI (if not already installed):
```bash
npm i -g vercel
```

2. Deploy to production:
```bash
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure environment variables (see below)
4. Click "Deploy"

### Step 3: Configure Environment Variables in Vercel

Go to your project settings in Vercel Dashboard → Settings → Environment Variables and add:

#### Required Variables

```env
# Database (COPY EXACTLY AS SHOWN)
DATABASE_URL=postgres://f5e800d6e88569aea932d09de1d5477a84c91489f232fe61fd1ec480536cc7bc:sk_EmH7oySmYdxOghSO4nKXs@db.prisma.io:5432/postgres?sslmode=require

# Authentication (REPLACE WITH YOUR VALUES)
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=[Generated from script]
JWT_SECRET=[Generated from script]

# Application
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_SITE_NAME=Daddy's Cart Marketplace
```

#### Optional Variables (for full functionality)

```env
# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (for order confirmations)
EMAIL_FROM=noreply@yourdomain.com
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# File Uploads (optional)
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id
```

### Step 4: Configure Stripe Webhook (if using payments)

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-app-name.vercel.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the webhook secret and add it to Vercel environment variables

### Step 5: Verify Deployment

After deployment, verify the following:

1. **Homepage**: https://your-app-name.vercel.app
2. **Admin Login**: https://your-app-name.vercel.app/auth/signin
   - Email: `admin@daddyscart.com`
   - Password: `admin123`
3. **Vendor Login**:
   - Email: `vendor@daddyscart.com`
   - Password: `vendor123`

## 🔐 Security Recommendations

1. **Change default passwords immediately** after first login
2. **Enable 2FA** for admin accounts
3. **Set up proper CORS** in production (update vercel.json)
4. **Configure rate limiting** for API endpoints
5. **Set up monitoring** with Vercel Analytics

## 📊 Database Management

### View Database Tables
```bash
DATABASE_URL="postgres://..." npx prisma studio
```

### Run Migrations (for schema changes)
```bash
DATABASE_URL="postgres://..." npx prisma migrate deploy
```

### Backup Database
```bash
pg_dump $DATABASE_URL > backup.sql
```

## 🐛 Troubleshooting

### Build Errors
- Ensure all environment variables are set
- Check `next.config.js` for TypeScript/ESLint settings
- Review build logs in Vercel dashboard

### Database Connection Issues
- Verify DATABASE_URL is correctly set
- Check if database is accessible from Vercel's IP
- Ensure SSL mode is set to `require`

### Authentication Issues
- Verify NEXTAUTH_URL matches your deployment URL
- Ensure NEXTAUTH_SECRET is set and secure
- Check callback URLs in OAuth providers

## 📱 Post-Deployment Tasks

1. **Test all critical paths**:
   - User registration and login
   - Product browsing and search
   - Cart and checkout flow
   - Admin dashboard functionality

2. **Set up monitoring**:
   - Enable Vercel Analytics
   - Configure error tracking (e.g., Sentry)
   - Set up uptime monitoring

3. **Configure backups**:
   - Set up automated database backups
   - Configure file backup for uploaded content

4. **Performance optimization**:
   - Enable Vercel Edge Functions
   - Configure CDN for static assets
   - Implement caching strategies

## 📞 Support

For deployment issues:
- Check Vercel deployment logs
- Review Prisma error messages
- Consult the [Vercel Documentation](https://vercel.com/docs)
- Check [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

## ✨ Features Available After Deployment

- ✅ User authentication (credentials + Google OAuth)
- ✅ Product catalog with search and filters
- ✅ Shopping cart with persistence
- ✅ Stripe payment integration
- ✅ Order management system
- ✅ Admin dashboard with analytics
- ✅ Vendor store management
- ✅ Review and rating system
- ✅ Responsive design for all devices

---

**Last Updated**: December 2024
**Database Status**: ✅ Connected and Seeded
**Deployment Status**: Ready for Production