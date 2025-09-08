import { Metadata } from 'next';
import { Suspense } from 'react';
import { MainNav } from '@/components/layout/main-nav';
import { Footer } from '@/components/layout/footer';
import { ProductsGrid } from '@/components/products/products-grid';
import { ProductsFilters } from '@/components/products/products-filters';
import { Card, CardContent } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Products - Daddy\'s Cart Marketplace',
  description: 'Browse our extensive collection of products from trusted vendors. Find electronics, fashion, home goods, and more.',
  keywords: ['products', 'shopping', 'electronics', 'fashion', 'marketplace'],
};

interface ProductsPageProps {
  searchParams: {
    page?: string;
    category?: string;
    brand?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
  };
}

function ProductsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <Card key={index} className="h-full overflow-hidden">
          <div className="aspect-square bg-muted animate-pulse" />
          <CardContent className="p-4 space-y-3">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
            <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
            <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
            <div className="h-8 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function getProductsData(searchParams: ProductsPageProps['searchParams']) {
  try {
    const page = parseInt(searchParams.page || '1');
    const limit = 12;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      status: 'PUBLISHED',
    };

    if (searchParams.category) {
      where.category = { slug: searchParams.category };
    }

    if (searchParams.brand) {
      where.brand = { slug: searchParams.brand };
    }

    if (searchParams.search) {
      where.OR = [
        { name: { contains: searchParams.search, mode: 'insensitive' } },
        { description: { contains: searchParams.search, mode: 'insensitive' } },
      ];
    }

    if (searchParams.minPrice || searchParams.maxPrice) {
      where.price = {};
      if (searchParams.minPrice) {
        where.price.gte = parseFloat(searchParams.minPrice);
      }
      if (searchParams.maxPrice) {
        where.price.lte = parseFloat(searchParams.maxPrice);
      }
    }

    if (searchParams.inStock === 'true') {
      where.quantity = { gt: 0 };
    }

    // Build order by
    const orderBy: any = {};
    const sortBy = searchParams.sortBy || 'createdAt';
    const sortOrder = searchParams.sortOrder || 'desc';

    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'rating') {
      orderBy.rating = sortOrder;
    } else if (sortBy === 'sales') {
      orderBy.sales = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [products, totalCount, categories, brands] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: {
            take: 1,
            orderBy: { position: 'asc' },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
          brand: {
            select: { id: true, name: true, slug: true },
          },
          store: {
            select: { id: true, name: true, slug: true, rating: true },
          },
          variants: {
            select: { id: true, name: true, price: true },
            take: 1,
            orderBy: { price: 'asc' },
          },
        },
      }),
      prisma.product.count({ where }),
      prisma.category.findMany({
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.brand.findMany({
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: {
        categories,
        brands,
      },
    };
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return {
      products: [],
      pagination: {
        page: 1,
        limit: 12,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
      filters: {
        categories: [],
        brands: [],
      },
    };
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const data = await getProductsData(searchParams);

  return (
    <>
      <MainNav />
      <main className="min-h-screen bg-background">
        <div className="container-mobile py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <ProductsFilters 
                categories={data.filters.categories}
                brands={data.filters.brands}
                searchParams={searchParams}
              />
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  {searchParams.search ? `Search results for "${searchParams.search}"` : 'All Products'}
                </h1>
                <p className="text-muted-foreground">
                  {data.pagination.totalCount} product{data.pagination.totalCount !== 1 ? 's' : ''} found
                </p>
              </div>

              <Suspense fallback={<ProductsLoading />}>
                <ProductsGrid 
                  products={data.products}
                  pagination={data.pagination}
                  searchParams={searchParams}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}