# Deployment Guide - Daddy's Cart Marketplace

This guide provides comprehensive instructions for deploying the marketplace to production with the domain `sourcekom.com`.

## 🚀 Quick Deployment Summary

### Super Admin Credentials
- **Email:** `admin@sourcekom.com`
- **Password:** `SuperAdmin123!`
- **Admin Dashboard:** `https://marketplace.sourcekom.com/admin`

### Test Accounts
- **Vendor 1:** `vendor1@sourcekom.com` / `VendorPass123!`
- **Vendor 2:** `vendor2@sourcekom.com` / `VendorPass123!`
- **Customer 1:** `john.doe@example.com` / `UserPass123!`
- **Customer 2:** `jane.smith@example.com` / `UserPass123!`

## 🌐 Vercel Deployment (Recommended)

### 1. Prerequisites
- Vercel account
- GitHub repository
- PostgreSQL database (Supabase/PlanetScale recommended)
- Domain configured at sourcekom.com

### 2. Database Setup

**Option A: Supabase (Recommended)**
```bash
# Create new Supabase project
# Copy connection string from Settings > Database
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
```

**Option B: PlanetScale**
```bash
# Create new PlanetScale database
# Copy connection string from Connect tab
DATABASE_URL="mysql://[username]:[password]@[host]/[database]?sslaccept=strict"
```

### 3. Environment Variables

Set these in Vercel Dashboard > Settings > Environment Variables:

```env
# Database
DATABASE_URL="your-production-database-url"

# Next Auth
NEXTAUTH_SECRET="generate-secure-secret-32-chars-min"
NEXTAUTH_URL="https://marketplace.sourcekom.com"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_live_your-live-publishable-key"
STRIPE_SECRET_KEY="sk_live_your-live-secret-key"
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"

# Email (Gmail/SendGrid)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@sourcekom.com"
SMTP_PASSWORD="your-app-specific-password"
EMAIL_FROM="Daddy's Cart <noreply@sourcekom.com>"

# App Configuration
NEXT_PUBLIC_APP_URL="https://marketplace.sourcekom.com"
NEXT_PUBLIC_APP_NAME="Daddy's Cart Marketplace"

# Admin Credentials
SUPER_ADMIN_EMAIL="admin@sourcekom.com"
SUPER_ADMIN_PASSWORD="SuperAdmin123!"

# Security
ENCRYPTION_KEY="generate-32-character-encryption-key"
JWT_SECRET="generate-jwt-secret-key"

# Upload Configuration
UPLOADTHING_SECRET="sk_live_your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Analytics (Optional)
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
```

### 4. Vercel Configuration

Create `vercel.json` in project root:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://marketplace.sourcekom.com"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "https://marketplace.sourcekom.com"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/webhooks/stripe",
      "destination": "/api/webhooks/stripe"
    }
  ]
}
```

### 5. Domain Configuration

**A. DNS Setup at sourcekom.com:**
```
Type    Name         Value                   TTL
A       marketplace  76.76.19.61            300
CNAME   www          marketplace.sourcekom.com  300
```

**B. Vercel Domain Setup:**
1. Go to Vercel Dashboard > Project > Settings > Domains
2. Add `marketplace.sourcekom.com`
3. Add `www.marketplace.sourcekom.com` (redirect to main)
4. Wait for SSL certificate generation

### 6. Database Migration & Seeding

```bash
# After deployment, run these commands in Vercel CLI or through database:
npx vercel env pull .env.local
npm run db:push
npm run db:seed
```

## 🐳 Docker Deployment

### 1. Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### 2. Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/daddys_cart
      - NEXTAUTH_SECRET=your-secret
      - NEXTAUTH_URL=https://marketplace.sourcekom.com
    depends_on:
      - db
      - redis
    
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=daddys_cart
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## ☁️ AWS Deployment

### 1. AWS Architecture
- **Compute:** ECS Fargate or EC2
- **Database:** RDS PostgreSQL
- **Storage:** S3 for file uploads
- **CDN:** CloudFront
- **Load Balancer:** Application Load Balancer
- **SSL:** Certificate Manager

### 2. Infrastructure as Code (Terraform)

```hcl
# main.tf
provider "aws" {
  region = "us-east-1"
}

resource "aws_ecs_cluster" "marketplace" {
  name = "daddys-cart-marketplace"
}

resource "aws_rds_instance" "postgres" {
  identifier = "marketplace-db"
  engine     = "postgres"
  engine_version = "15"
  instance_class = "db.t3.micro"
  allocated_storage = 20
  
  db_name  = "daddys_cart"
  username = "postgres"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.db.id]
  skip_final_snapshot = true
}

resource "aws_s3_bucket" "uploads" {
  bucket = "marketplace-sourcekom-uploads"
}
```

## 🔧 Production Optimizations

### 1. Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    domains: ['images.unsplash.com', 'marketplace.sourcekom.com'],
    formats: ['image/webp', 'image/avif'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
    ];
  },
};

module.exports = nextConfig;
```

### 2. Performance Monitoring

```javascript
// lib/monitoring.ts
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: url,
    });
  }
};

export const trackEvent = (action: string, category: string, label?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
};
```

## 🔒 Security Checklist

### 1. Environment Security
- [ ] Use strong, unique passwords for all accounts
- [ ] Enable 2FA on all service accounts
- [ ] Rotate API keys regularly
- [ ] Use environment-specific secrets
- [ ] Enable database encryption at rest

### 2. Application Security
- [ ] Implement rate limiting on all API routes
- [ ] Validate all user inputs with Zod schemas
- [ ] Sanitize file uploads
- [ ] Use HTTPS everywhere
- [ ] Implement proper CORS policies
- [ ] Add security headers

### 3. Infrastructure Security
- [ ] Use VPC with private subnets
- [ ] Implement WAF rules
- [ ] Enable CloudTrail logging
- [ ] Set up monitoring and alerting
- [ ] Regular security updates
- [ ] Backup encryption

## 📊 Monitoring & Alerting

### 1. Application Monitoring

```javascript
// lib/logger.ts
import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.simple()
  }));
}
```

### 2. Health Checks

```javascript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        application: 'up',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 503 }
    );
  }
}
```

## 🚀 Post-Deployment Tasks

### 1. Verify Deployment
- [ ] Check all pages load correctly
- [ ] Test user registration and login
- [ ] Verify email sending works
- [ ] Test payment processing
- [ ] Check admin dashboard functionality
- [ ] Verify mobile responsiveness

### 2. SEO Setup
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics
- [ ] Configure social media meta tags
- [ ] Test structured data
- [ ] Check page load speeds

### 3. Business Setup
- [ ] Configure Stripe webhooks
- [ ] Set up email templates
- [ ] Create initial product categories
- [ ] Configure shipping methods
- [ ] Set up tax rates by region

## 🔄 Maintenance

### 1. Regular Tasks
- [ ] Monitor application performance
- [ ] Review error logs weekly
- [ ] Update dependencies monthly
- [ ] Backup database daily
- [ ] Review security logs

### 2. Scaling Considerations
- [ ] Monitor database performance
- [ ] Set up auto-scaling for containers
- [ ] Implement caching layers
- [ ] Optimize database queries
- [ ] Consider CDN for static assets

## 📞 Support

For deployment support:
- **Email:** support@sourcekom.com
- **Documentation:** This deployment guide
- **Monitoring:** Check `/api/health` endpoint

---

**Your marketplace is now ready for production! 🎉**

The platform includes all necessary features for a successful e-commerce business, with proper security, monitoring, and scalability considerations built in.