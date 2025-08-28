# Deployment Guide - Daddy's Cart Marketplace

This guide covers deploying your marketplace to various platforms with production-ready configurations.

## 🚀 Vercel Deployment (Recommended)

### Prerequisites
- Vercel account
- GitHub repository
- PostgreSQL database (Neon recommended)

### Step 1: Database Setup
1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

### Step 2: Deploy to Vercel
1. **Connect Repository**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Environment Variables**
   Add these in your Vercel dashboard:
   ```env
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   UPLOADTHING_SECRET=sk_live_...
   UPLOADTHING_APP_ID=your-app-id
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   NODE_ENV=production
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Step 3: Database Migration
```bash
# Generate and run migrations
npm run db:generate
npm run db:migrate

# Seed the database
npm run db:seed
```

### Step 4: Configure Domain
1. Add your custom domain in Vercel dashboard
2. Update NEXT_PUBLIC_APP_URL with your domain
3. Update Stripe webhook URLs

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
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

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/daddyscart
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: daddyscart
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## ☁️ AWS Deployment

### Using AWS Amplify
1. Connect your GitHub repository
2. Set environment variables
3. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
   ```

### Using EC2 + RDS
1. **Launch EC2 instance**
2. **Create RDS PostgreSQL instance**
3. **Install dependencies**
   ```bash
   sudo yum update -y
   sudo yum install -y nodejs npm
   git clone your-repo
   cd your-repo
   npm install
   npm run build
   ```
4. **Use PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start npm --name "marketplace" -- start
   pm2 startup
   pm2 save
   ```

## 🌍 Environment Variables

### Required Variables
```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
```

### Payment Processing
```env
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### File Uploads
```env
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=your-app-id
```

### Email Configuration
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Optional Integrations
```env
GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🔧 Production Optimizations

### Next.js Configuration
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['uploadthing.com', 'utfs.io'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  httpAgentOptions: {
    keepAlive: true,
  },
};
```

### Performance Monitoring
1. **Set up Sentry for error tracking**
2. **Configure Vercel Analytics**
3. **Enable Lighthouse CI**
4. **Set up database monitoring**

## 🛡️ Security Checklist

### Environment Security
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Set secure cookie flags
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets

### Database Security
- [ ] Enable SSL for database connections
- [ ] Use connection pooling
- [ ] Set up database backups
- [ ] Enable query logging for monitoring

### Application Security
- [ ] Enable rate limiting
- [ ] Implement CSRF protection
- [ ] Validate all inputs
- [ ] Sanitize user content
- [ ] Regular security updates

## 📊 Monitoring & Analytics

### Application Monitoring
```javascript
// Add to your app
import { analytics } from './lib/analytics';

// Track page views
analytics.page();

// Track events
analytics.track('Product Purchased', {
  productId: '123',
  revenue: 99.99,
});
```

### Database Monitoring
- Monitor query performance
- Set up slow query alerts
- Track connection pool usage
- Monitor disk space

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run test
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🚨 Troubleshooting

### Common Issues

#### Database Connection
```bash
# Test database connection
npm run db:studio
```

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### Environment Variables
```bash
# Check if variables are loaded
node -e "console.log(process.env.DATABASE_URL)"
```

### Support
- Check logs in Vercel dashboard
- Monitor error tracking (Sentry)
- Review database logs
- Check third-party service status

## 📈 Scaling Considerations

### Database Scaling
- Connection pooling
- Read replicas
- Database sharding
- Caching strategies

### Application Scaling
- Edge functions
- CDN for static assets
- Image optimization
- API rate limiting

### Cost Optimization
- Monitor usage metrics
- Optimize database queries
- Use edge caching
- Review third-party costs

---

**Need help?** Open an issue or contact support@daddyscart.com