# Daddy's Cart Marketplace

A fully functional, production-ready e-commerce marketplace built with Next.js 14, TypeScript, Prisma, and modern web technologies.

## 🚀 Features

### Core Functionality
- **Multi-vendor marketplace** with store management
- **Complete authentication system** with email verification and password reset
- **Product management** with variants, inventory tracking, and image uploads
- **Shopping cart** with real-time synchronization
- **Order processing** with status tracking and email notifications
- **Payment integration** with Stripe (webhooks included)
- **Admin dashboard** with real-time analytics and reporting
- **Email system** with beautiful HTML templates
- **Review and rating system**
- **Wishlist functionality**
- **Advanced search and filtering**

### Technical Features
- **Mobile-first responsive design** - Optimized for all devices
- **Server-side rendering** with Next.js 14 App Router
- **Type-safe database** with Prisma ORM
- **Authentication** with NextAuth.js
- **Real-time updates** with optimistic UI
- **File upload system** with image optimization
- **Email notifications** with Nodemailer
- **Data validation** with Zod schemas
- **State management** with Zustand
- **Styling** with Tailwind CSS and Radix UI
- **Charts and analytics** with Recharts
- **Form handling** with React Hook Form

## 🏗️ Architecture

### Database Schema
- **Users** with role-based access (USER, VENDOR, ADMIN, SUPER_ADMIN)
- **Products** with variants, images, and inventory tracking
- **Orders** with complete order lifecycle management
- **Stores** with vendor management
- **Categories and Brands** for product organization
- **Reviews and Ratings** with verification
- **Shopping Cart** with persistence
- **Addresses** for shipping and billing
- **Settings** for platform configuration

### API Routes
- `/api/auth/*` - Authentication endpoints
- `/api/products/*` - Product management
- `/api/orders/*` - Order processing
- `/api/cart/*` - Shopping cart operations
- `/api/wishlist/*` - Wishlist management
- `/api/admin/*` - Admin operations
- `/api/checkout/*` - Payment processing
- `/api/webhooks/*` - External service webhooks
- `/api/upload/*` - File upload handling

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Stripe account (for payments)
- SMTP email service (Gmail, SendGrid, etc.)

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

**Required Environment Variables:**

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/daddys_cart"

# Next Auth
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXTAUTH_URL="https://yourdomain.sourcekom.com"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="noreply@sourcekom.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="Daddy's Cart <noreply@sourcekom.com>"

# Stripe (for payments)
STRIPE_PUBLISHABLE_KEY="pk_live_your-stripe-publishable-key"
STRIPE_SECRET_KEY="sk_live_your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="whsec_your-stripe-webhook-secret"

# App Configuration
NEXT_PUBLIC_APP_URL="https://yourdomain.sourcekom.com"
SUPER_ADMIN_EMAIL="admin@sourcekom.com"
SUPER_ADMIN_PASSWORD="SuperAdmin123!"
```

### 2. Database Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:push

# Seed database with sample data
npm run db:seed
```

### 3. Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### 4. Production Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔐 Super Admin Credentials

After running the database seed, you can access the admin panel with:

**Email:** `admin@sourcekom.com`  
**Password:** `SuperAdmin123!`

**Admin Dashboard:** `/admin`

### Additional Test Accounts

**Vendor Accounts:**
- Email: `vendor1@sourcekom.com` | Password: `VendorPass123!`
- Email: `vendor2@sourcekom.com` | Password: `VendorPass123!`

**Customer Accounts:**
- Email: `john.doe@example.com` | Password: `UserPass123!`
- Email: `jane.smith@example.com` | Password: `UserPass123!`

## 📱 Mobile Optimization

The platform is built with mobile-first design principles:

- **Responsive layouts** that adapt to all screen sizes
- **Touch-optimized interface** with proper touch targets (44px minimum)
- **Optimized images** with Next.js Image component
- **Fast loading** with server-side rendering and code splitting
- **Offline-capable** shopping cart with local storage
- **Progressive Web App** features with manifest.json

## 🎨 UI/UX Features

### Design System
- **Consistent design tokens** with CSS custom properties
- **Dark/light mode support** with next-themes
- **Accessible components** built with Radix UI
- **Smooth animations** with Framer Motion
- **Loading states** and skeleton screens
- **Error boundaries** with graceful fallbacks

### Mobile-Specific Features
- **Swipe gestures** for product galleries
- **Pull-to-refresh** on product lists
- **Bottom sheet modals** for better mobile UX
- **Sticky headers** with scroll behavior
- **Optimized forms** with proper input types

## 🔧 Admin Features

### Dashboard Analytics
- **Real-time sales data** with interactive charts
- **Order status distribution** with visual indicators
- **Top-selling products** with performance metrics
- **Customer analytics** with growth trends
- **Revenue tracking** with period comparisons

### Product Management
- **Bulk product operations** for efficiency
- **Image upload and optimization** with drag-and-drop
- **Inventory tracking** with low stock alerts
- **SEO optimization** with meta tags
- **Product variants** with options management

### Order Management
- **Complete order lifecycle** tracking
- **Status updates** with email notifications
- **Shipping integration** with tracking numbers
- **Refund processing** with Stripe integration
- **Order export** for accounting systems

## 🚀 Performance Optimizations

- **Server-side rendering** for better SEO and initial load
- **Image optimization** with WebP format and lazy loading
- **Code splitting** with dynamic imports
- **Database query optimization** with Prisma
- **Caching strategies** for static and dynamic content
- **Bundle analysis** and optimization

## 🔒 Security Features

- **Authentication** with secure session management
- **Authorization** with role-based access control
- **Input validation** with Zod schemas
- **SQL injection protection** with Prisma
- **XSS protection** with proper data sanitization
- **CSRF protection** with NextAuth.js
- **Rate limiting** for API endpoints
- **File upload security** with type and size validation

## 📧 Email System

The platform includes a comprehensive email system with:

- **Welcome emails** for new users
- **Email verification** for account security
- **Password reset** with secure tokens
- **Order confirmations** with detailed information
- **Shipping notifications** with tracking details
- **HTML templates** with responsive design
- **Email deliverability** optimization

## 💳 Payment Integration

Complete Stripe integration with:

- **Secure checkout** with Stripe Elements
- **Multiple payment methods** (cards, digital wallets)
- **Webhook handling** for real-time updates
- **Refund processing** through admin panel
- **Payment status tracking** with order management
- **PCI compliance** with Stripe's secure infrastructure

## 📊 Analytics & Reporting

- **Sales analytics** with period comparisons
- **Product performance** metrics
- **Customer behavior** tracking
- **Order fulfillment** statistics
- **Revenue reporting** with charts
- **Export capabilities** for external analysis

## 🌐 SEO & Marketing

- **SEO-optimized** pages with proper meta tags
- **Structured data** for rich snippets
- **Sitemap generation** for search engines
- **Social media integration** with Open Graph
- **Newsletter signup** with email marketing
- **Promotional banners** and discount codes

## 🔄 Data Management

- **Database migrations** with Prisma
- **Data seeding** for development and testing
- **Backup strategies** for production data
- **Data export/import** capabilities
- **GDPR compliance** with data deletion
- **Audit logging** for sensitive operations

## 📱 PWA Features

- **Installable** on mobile devices
- **Offline functionality** for cart management
- **Push notifications** for order updates
- **App-like experience** with native feel
- **Fast loading** with service workers
- **Responsive design** for all devices

## 🧪 Testing & Quality

- **Type safety** with TypeScript
- **Runtime validation** with Zod
- **Error handling** with proper boundaries
- **Loading states** for better UX
- **Form validation** with real-time feedback
- **API error handling** with user-friendly messages

## 📚 Documentation

- **Code documentation** with TSDoc comments
- **API documentation** with OpenAPI specs
- **Component documentation** with Storybook
- **Setup guides** for development and production
- **Troubleshooting guides** for common issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: support@sourcekom.com
- Documentation: Available in `/docs` folder
- Issues: GitHub Issues tab

---

**Built with ❤️ for the modern web**

This marketplace platform is production-ready and includes all the features needed to run a successful multi-vendor e-commerce business. The codebase follows best practices for scalability, security, and maintainability.