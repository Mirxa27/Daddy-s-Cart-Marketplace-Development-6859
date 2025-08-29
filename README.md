# Daddy's Cart Marketplace

A fully-featured, production-ready e-commerce marketplace built with Next.js 14, TypeScript, Prisma, and PostgreSQL. Features a complete admin panel, vendor management, secure payments, and mobile-responsive design.

## 🚀 Features

### Core Functionality
- **Multi-vendor marketplace** with vendor dashboard
- **Complete product management** with variants, categories, and brands
- **Shopping cart** with persistent storage
- **Secure checkout** with Stripe integration
- **Order management** system with status tracking
- **User authentication** with NextAuth.js (credentials + OAuth)
- **Admin panel** with full configuration capabilities
- **Real-time notifications** system
- **Review and rating** system
- **Wishlist** functionality
- **Advanced search** and filtering

### Admin Features
- **Super Admin Dashboard** with analytics
- **Complete settings management** via UI
- **API configuration** (Stripe, SMTP, OAuth)
- **Vendor management** and approval system
- **Order processing** and tracking
- **Product moderation**
- **Commission management**
- **Tax and shipping** configuration
- **Email template** management
- **Database backup** controls

### Technical Features
- **Mobile-first responsive design**
- **PWA ready** with offline support
- **SEO optimized** with meta tags
- **Image optimization** with Next.js Image
- **Type-safe** with TypeScript
- **Database migrations** with Prisma
- **API rate limiting**
- **CSRF protection**
- **Input validation** with Zod
- **Error handling** with proper fallbacks
- **Performance optimized** with lazy loading

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js v5
- **Styling:** Tailwind CSS + Radix UI
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **Payments:** Stripe
- **File Uploads:** UploadThing
- **Email:** Nodemailer
- **Deployment:** Vercel

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- Stripe account
- SMTP service for emails

## 🔧 Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/daddys-cart-marketplace.git
cd daddys-cart-marketplace
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/daddyscart"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
# ... see .env.example for all variables
```

4. **Set up the database:**
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

5. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🔑 Default Super Admin Credentials

After seeding the database:
- **Email:** superadmin@daddyscart.com
- **Password:** SuperAdmin@123!

⚠️ **IMPORTANT:** Change these credentials immediately after first login!

## 📱 Mobile Responsiveness

The entire application is built with a mobile-first approach:
- Touch-optimized UI elements (min 44px touch targets)
- Responsive grid layouts
- Mobile-friendly navigation with hamburger menu
- Optimized images with lazy loading
- Smooth animations and transitions
- PWA capabilities for app-like experience

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CSRF protection
- SQL injection prevention with Prisma
- XSS protection
- Rate limiting on API routes
- Secure headers configuration
- Environment variable validation

## 📊 Admin Panel Capabilities

The admin panel (`/admin`) allows complete control over:

### Settings Management
- **General:** Site name, description, maintenance mode
- **Payment:** Stripe configuration, currency, tax rates
- **Shipping:** Fees, free shipping thresholds
- **Email:** SMTP configuration, templates
- **Vendor:** Commission rates, approval settings
- **Security:** 2FA, password policies, session management

### Business Operations
- Dashboard with real-time analytics
- Order processing and fulfillment
- Product and inventory management
- Customer management
- Vendor approval and management
- Reports and analytics
- Email campaigns

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel:**
- Go to [Vercel](https://vercel.com)
- Import your GitHub repository
- Configure environment variables
- Deploy

3. **Post-deployment:**
```bash
# Run database migrations
vercel env pull .env.production.local
npx prisma migrate deploy
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `POST /api/auth/forgot-password` - Password reset

### Admin Endpoints (Protected)
- `GET/POST /api/admin/settings/*` - Settings management
- `GET/POST /api/admin/products` - Product management
- `GET/POST /api/admin/orders` - Order management
- `GET/POST /api/admin/users` - User management

### Public Endpoints
- `GET /api/products` - List products
- `GET /api/products/[id]` - Get product details
- `GET /api/categories` - List categories
- `POST /api/cart` - Cart operations
- `POST /api/checkout` - Process checkout

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run test:e2e

# Run type checking
npm run type-check
```

## 📈 Performance Optimization

- Server-side rendering for better SEO
- Static generation for product pages
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Database query optimization
- Redis caching (optional)
- CDN integration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@daddyscart.com or create an issue in the repository.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- Shadcn/ui for the component library
- All open-source contributors

## 🗺️ Roadmap

- [ ] Mobile app with React Native
- [ ] AI-powered product recommendations
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Cryptocurrency payments
- [ ] Social commerce features
- [ ] Live chat support
- [ ] Inventory forecasting

---

Built with ❤️ by the Daddy's Cart Team