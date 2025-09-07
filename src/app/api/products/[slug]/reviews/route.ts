import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

interface RouteParams {
  params: { slug: string };
}

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(100).optional(),
  comment: z.string().min(1).max(1000),
});

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(req.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const rating = searchParams.get('rating');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const skip = (page - 1) * limit;
    
    // Get product
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Build where clause
    const where: any = { productId: product.id };
    if (rating) {
      where.rating = parseInt(rating);
    }
    
    // Build order by clause
    const orderBy: any = {};
    if (sortBy === 'rating') {
      orderBy.rating = sortOrder;
    } else if (sortBy === 'helpful') {
      orderBy.helpful = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }
    
    // Get reviews
    const [reviews, totalCount, ratingStats] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
      prisma.review.groupBy({
        by: ['rating'],
        where: { productId: product.id },
        _count: { rating: true },
      }),
    ]);
    
    const totalPages = Math.ceil(totalCount / limit);
    
    // Calculate rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => {
      const stat = ratingStats.find(s => s.rating === rating);
      return {
        rating,
        count: stat?._count.rating || 0,
        percentage: totalCount > 0 ? ((stat?._count.rating || 0) / totalCount) * 100 : 0,
      };
    });
    
    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      ratingDistribution,
    });
    
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { slug } = params;
    const body = await req.json();
    
    // Validate input
    const validatedData = reviewSchema.parse(body);
    
    // Get product
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId: product.id,
          userId: session.user.id,
        },
      },
    });
    
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }
    
    // Check if user has purchased this product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: product.id,
        order: {
          userId: session.user.id,
          status: 'DELIVERED',
        },
      },
    });
    
    // Create review
    const review = await prisma.review.create({
      data: {
        productId: product.id,
        userId: session.user.id,
        rating: validatedData.rating,
        title: validatedData.title,
        comment: validatedData.comment,
        verified: !!hasPurchased,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });
    
    // Update product rating
    const reviewStats = await prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
      _count: { rating: true },
    });
    
    await prisma.product.update({
      where: { id: product.id },
      data: {
        rating: reviewStats._avg.rating || 0,
        reviewCount: reviewStats._count.rating,
      },
    });
    
    // Create notification for store owner
    const store = await prisma.store.findFirst({
      where: {
        products: {
          some: { id: product.id },
        },
      },
    });
    
    if (store) {
      await prisma.notification.create({
        data: {
          userId: store.userId,
          type: 'REVIEW',
          title: 'New Product Review',
          message: `${session.user.name} left a ${validatedData.rating}-star review for ${product.name}`,
          link: `/products/${slug}#reviews`,
        },
      });
    }
    
    return NextResponse.json(review, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Review creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}