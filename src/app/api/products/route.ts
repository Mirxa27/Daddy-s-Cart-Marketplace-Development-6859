import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { products, categories, brands, users } from '@/lib/db/schema';
import { eq, and, like, desc, asc, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { ApiResponse, PaginatedResponse, ProductFilters } from '@/types';

const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  categoryId: z.string().uuid('Invalid category ID'),
  brandId: z.string().uuid('Invalid brand ID').optional(),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Invalid price'),
  comparePrice: z.string().optional(),
  costPrice: z.string().optional(),
  stock: z.number().min(0, 'Stock cannot be negative'),
  lowStockThreshold: z.number().min(0, 'Low stock threshold cannot be negative').default(5),
  weight: z.string().optional(),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }).optional(),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  attributes: z.record(z.any()).default({}),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']).default('DRAFT'),
  isFeatured: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Filters
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'ACTIVE';

    // Build where conditions
    const whereConditions = [];
    
    if (status) {
      whereConditions.push(eq(products.status, status as any));
    }
    
    if (category) {
      whereConditions.push(eq(products.categoryId, category));
    }
    
    if (brand) {
      whereConditions.push(eq(products.brandId, brand));
    }
    
    if (minPrice) {
      whereConditions.push(sql`CAST(${products.price} AS DECIMAL) >= ${parseFloat(minPrice)}`);
    }
    
    if (maxPrice) {
      whereConditions.push(sql`CAST(${products.price} AS DECIMAL) <= ${parseFloat(maxPrice)}`);
    }
    
    if (inStock === 'true') {
      whereConditions.push(sql`${products.stock} > 0`);
    }
    
    if (featured === 'true') {
      whereConditions.push(eq(products.isFeatured, true));
    }
    
    if (search) {
      whereConditions.push(
        sql`(${products.name} ILIKE ${`%${search}%`} OR ${products.description} ILIKE ${`%${search}%`})`
      );
    }

    // Build order by
    const orderBy = sortOrder === 'desc' 
      ? desc(products[sortBy as keyof typeof products] as any)
      : asc(products[sortBy as keyof typeof products] as any);

    // Get products with relations
    const productsQuery = db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        shortDescription: products.shortDescription,
        sku: products.sku,
        price: products.price,
        comparePrice: products.comparePrice,
        stock: products.stock,
        images: products.images,
        tags: products.tags,
        status: products.status,
        isFeatured: products.isFeatured,
        rating: products.rating,
        reviewCount: products.reviewCount,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
        brand: {
          id: brands.id,
          name: brands.name,
          slug: brands.slug,
        },
        seller: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .leftJoin(users, eq(products.sellerId, users.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const productsList = await productsQuery;

    // Get total count
    const totalQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);
    
    const [{ count: total }] = await totalQuery;
    
    const totalPages = Math.ceil(total / limit);

    const response: PaginatedResponse<typeof productsList[0]> = {
      data: productsList,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    return NextResponse.json<ApiResponse<PaginatedResponse<typeof productsList[0]>>>({
      success: true,
      data: response,
    });

  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch products',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createProductSchema.parse(body);

    // Generate slug from name
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if SKU already exists
    const existingSKU = await db
      .select()
      .from(products)
      .where(eq(products.sku, validatedData.sku))
      .limit(1);

    if (existingSKU.length > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Product with this SKU already exists',
        },
        { status: 400 }
      );
    }

    // Create product
    const [newProduct] = await db
      .insert(products)
      .values({
        ...validatedData,
        slug,
        sellerId: user.id,
        price: validatedData.price,
        comparePrice: validatedData.comparePrice || null,
        costPrice: validatedData.costPrice || null,
        weight: validatedData.weight || null,
        dimensions: validatedData.dimensions || null,
        images: validatedData.images,
        tags: validatedData.tags,
        attributes: validatedData.attributes,
      })
      .returning();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: newProduct,
      message: 'Product created successfully',
    });

  } catch (error: any) {
    console.error('Error creating product:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.errors[0].message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to create product',
      },
      { status: 500 }
    );
  }
}