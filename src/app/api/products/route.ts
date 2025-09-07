import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const store = searchParams.get('store');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999');
    const inStock = searchParams.get('inStock') === 'true';
    
    // Build where clause
    const where: any = {
      status: ProductStatus.PUBLISHED,
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
    };
    
    if (category) {
      where.category = {
        slug: category,
      };
    }
    
    if (brand) {
      where.brand = {
        slug: brand,
      };
    }
    
    if (store) {
      where.store = {
        slug: store,
      };
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (inStock) {
      where.quantity = {
        gt: 0,
      };
    }
    
    // Build order by clause
    const orderBy: any = {};
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
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get products with related data
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: {
            orderBy: { position: 'asc' },
            take: 1,
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
            select: { id: true, name: true, price: true, quantity: true },
            take: 3,
          },
          _count: {
            select: { reviews: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        category,
        brand,
        store,
        search,
        minPrice,
        maxPrice,
        inStock,
        sortBy,
        sortOrder,
      },
    });
    
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Only vendors and admins can create products
    if (!['VENDOR', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await req.json();
    
    // Get user's store (for vendors)
    let storeId = body.storeId;
    if (session.user.role === 'VENDOR') {
      const store = await prisma.store.findUnique({
        where: { userId: session.user.id },
      });
      
      if (!store) {
        return NextResponse.json(
          { error: 'Store not found. Please create a store first.' },
          { status: 400 }
        );
      }
      
      storeId = store.id;
    }
    
    // Create product
    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: parseFloat(body.price),
        compareAtPrice: body.compareAtPrice ? parseFloat(body.compareAtPrice) : null,
        cost: body.cost ? parseFloat(body.cost) : null,
        sku: body.sku,
        barcode: body.barcode,
        trackQuantity: body.trackQuantity ?? true,
        quantity: parseInt(body.quantity) || 0,
        allowBackorder: body.allowBackorder ?? false,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        status: body.status || ProductStatus.DRAFT,
        publishedAt: body.status === ProductStatus.PUBLISHED ? new Date() : null,
        storeId,
        categoryId: body.categoryId,
        brandId: body.brandId,
        images: body.images ? {
          create: body.images.map((image: any, index: number) => ({
            url: image.url,
            alt: image.alt || body.name,
            position: index,
          })),
        } : undefined,
        variants: body.variants ? {
          create: body.variants.map((variant: any) => ({
            name: variant.name,
            sku: variant.sku,
            price: parseFloat(variant.price),
            quantity: parseInt(variant.quantity) || 0,
            options: variant.options ? {
              create: variant.options.map((option: any) => ({
                name: option.name,
                value: option.value,
              })),
            } : undefined,
          })),
        } : undefined,
      },
      include: {
        images: true,
        variants: {
          include: {
            options: true,
          },
        },
        category: true,
        brand: true,
        store: true,
      },
    });
    
    return NextResponse.json(product, { status: 201 });
    
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}