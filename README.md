# Daddy's Cart - Marketplace Platform

A comprehensive, production-ready e-commerce marketplace built with Next.js 14, TypeScript, and modern web technologies.

## 🚀 Features

### Core Functionality
- **Multi-vendor Marketplace**: Support for sellers and buyers
- **Product Management**: Complete CRUD operations for products, categories, and brands
- **Order Processing**: Full order lifecycle management
- **User Management**: Role-based access control (Super Admin, Admin, Seller, Buyer)
- **Payment Integration**: Stripe payment processing
- **File Uploads**: Image and document management
- **Search & Filters**: Advanced product search and filtering
- **Reviews & Ratings**: Customer feedback system
- **Wishlist & Cart**: Shopping cart and wishlist functionality

### Admin Panel
- **Dashboard**: Comprehensive analytics and insights
- **User Management**: Manage all user accounts and roles
- **Product Management**: Oversee all marketplace products
- **Order Management**: Process and track orders
- **Settings**: Configure marketplace settings and APIs
- **Content Management**: Manage pages, blogs, and media
- **Financial Tools**: Revenue tracking and payouts

### Responsive Design
- **Mobile-First**: Optimized for all device sizes
- **Modern UI**: Clean, accessible, and user-friendly interface
- **Performance**: Optimized for speed and SEO

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS
- **Authentication**: JWT with HTTP-only cookies
- **Payments**: Stripe
- **File Uploads**: UploadThing
- **Validation**: Zod
- **UI Components**: Radix UI
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/daddys-cart-marketplace.git
   cd daddys-cart-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your environment variables in `.env.local`

4. **Set up the database**
   ```bash
   # Generate database schema
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed the database (creates super admin)
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄 Database Setup

### PostgreSQL (Recommended)
1. Create a PostgreSQL database
2. Update `DATABASE_URL` in your `.env.local`
3. Run migrations: `npm run db:migrate`
4. Seed initial data: `npm run db:seed`

### Neon (Cloud PostgreSQL)
1. Create account at [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string to `DATABASE_URL`
4. Run migrations and seed

## 🔑 Default Credentials

After seeding the database, you can login with:

**Super Admin**
- Email: `admin@daddyscart.com`
- Password: `SuperAdmin123!`

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set Environment Variables**
   Add all environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `UPLOADTHING_SECRET`
   - `UPLOADTHING_APP_ID`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user (Admin)

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product by ID
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `GET /api/orders/[id]` - Get order by ID
- `PUT /api/orders/[id]` - Update order status

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - User management
- `GET /api/admin/settings` - Settings management
- `PUT /api/admin/settings` - Update settings

## 🔧 Configuration

### Payment Setup (Stripe)
1. Create Stripe account
2. Get publishable and secret keys
3. Set up webhooks for order processing
4. Configure payment methods

### File Upload Setup (UploadThing)
1. Create UploadThing account
2. Get API keys
3. Configure file size limits and types

### Email Setup (Optional)
1. Configure SMTP settings
2. Set up email templates
3. Enable notification emails

## 📱 Features Overview

### For Buyers
- Browse and search products
- Add items to cart and wishlist
- Secure checkout with Stripe
- Order tracking and history
- Product reviews and ratings
- User profile management

### For Sellers
- Seller dashboard
- Product management
- Order fulfillment
- Sales analytics
- Customer communication

### For Admins
- Complete marketplace oversight
- User and seller management
- Product approval and moderation
- Order management
- Financial reporting
- System configuration

## 🔒 Security Features

- JWT authentication with HTTP-only cookies
- Role-based access control
- Input validation with Zod
- SQL injection prevention with Drizzle ORM
- XSS protection
- CSRF protection
- Rate limiting
- Secure file uploads

## 📊 Performance

- Server-side rendering with Next.js
- Image optimization
- Database query optimization
- Caching strategies
- Bundle optimization
- Lazy loading

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Database Schema](./docs/database.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing Guide](./docs/contributing.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@daddyscart.com or create an issue on GitHub.

## 🎉 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- Stripe for payment processing
- All contributors and the open-source community

---

**Built with ❤️ for the marketplace community**