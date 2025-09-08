import { Metadata } from 'next';
import { HeroSection } from '@/components/home/hero-section';
import { FeaturedProducts } from '@/components/home/featured-products';
import { CategoryGrid } from '@/components/home/category-grid';
import { PromoSection } from '@/components/home/promo-section';
import { Newsletter } from '@/components/home/newsletter';
import { MainNav } from '@/components/layout/main-nav';
import { Footer } from '@/components/layout/footer';
import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Daddy\'s Cart Marketplace - Your Premier Shopping Destination',
  description: 'Discover amazing products from trusted vendors. Shop electronics, fashion, home goods, and more with secure checkout and fast delivery.',
  keywords: ['marketplace', 'e-commerce', 'online shopping', 'multi-vendor', 'electronics', 'fashion'],
  openGraph: {
    title: 'Daddy\'s Cart Marketplace',
    description: 'Your premier online marketplace for everything you need',
    url: '/',
    siteName: 'Daddy\'s Cart',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Daddy\'s Cart Marketplace',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

// Loading component for featured products
function FeaturedProductsLoading() {
  return (
    <section className="py-12 sm:py-16 bg-muted/30">
      <div className="container-mobile mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Featured Products</h2>
            <p className="text-muted-foreground">Loading our best products...</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="h-full overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <CardContent className="p-3 sm:p-4 space-y-3">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
                <div className="h-8 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

async function getHomePageData() {
  try {
    const [featuredProducts, categories, stats] = await Promise.all([
      prisma.product.findMany({
        where: { 
          status: 'PUBLISHED',
          quantity: { gt: 0 },
        },
        take: 8,
        orderBy: { sales: 'desc' },
        include: {
          images: {
            take: 1,
            orderBy: { position: 'asc' },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
          store: {
            select: { id: true, name: true, slug: true, rating: true },
          },
        },
      }),
      prisma.category.findMany({
        take: 8,
        include: {
          _count: {
            select: { products: true },
          },
        },
      }),
      prisma.order.aggregate({
        _count: { id: true },
        _sum: { total: true },
      }),
    ]);

    return {
      featuredProducts,
      categories,
      stats: {
        totalOrders: stats._count.id,
        totalRevenue: stats._sum.total || 0,
      },
    };
  } catch (error) {
    console.error('Failed to fetch homepage data:', error);
    return {
      featuredProducts: [],
      categories: [],
      stats: {
        totalOrders: 0,
        totalRevenue: 0,
      },
    };
  }
}

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <>
      <MainNav />
      <main className="flex min-h-screen flex-col">
        <HeroSection stats={data.stats} />
        <CategoryGrid categories={data.categories} />
        <Suspense fallback={<FeaturedProductsLoading />}>
          <FeaturedProducts products={data.featuredProducts} />
        </Suspense>
        <PromoSection />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}