import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: { slug: string };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params;
    
    // Get product with all related data
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { position: 'asc' },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, slug: true, logo: true, website: true },
        },
        store: {
          select: { 
            id: true, 
            name: true, 
            slug: true, 
            description: true,
            logo: true,
            rating: true,
            totalSales: true,
            isVerified: true,
          },
        },
        variants: {
          include: {
            options: true,
          },
          orderBy: { price: 'asc' },
        },
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { reviews: true, wishlistItems: true },
        },
      },
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Increment view count
    await prisma.product.update({
      where: { id: product.id },
      data: { views: { increment: 1 } },
    });
    
    // Get related products from the same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: 'PUBLISHED',
      },
      include: {
        images: {
          take: 1,
          orderBy: { position: 'asc' },
        },
        store: {
          select: { name: true, slug: true, rating: true },
        },
      },
      take: 6,
      orderBy: { sales: 'desc' },
    });
    
    // Check if user has this product in wishlist (if authenticated)
    let isInWishlist = false;
    const session = await getServerSession(authOptions);
    if (session) {
      const wishlistItem = await prisma.wishlist.findUnique({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId: product.id,
          },
        },
      });
      isInWishlist = !!wishlistItem;
    }
    
    return NextResponse.json({
      ...product,
      isInWishlist,
      relatedProducts,
    });
    
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { slug } = params;
    const body = await req.json();
    
    // Get existing product
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
      include: { store: true },
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check permissions
    const canEdit = 
      session.user.role === 'SUPER_ADMIN' ||
      session.user.role === 'ADMIN' ||
      (session.user.role === 'VENDOR' && existingProduct.store.userId === session.user.id);
    
    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Update product
    const product = await prisma.product.update({
      where: { id: existingProduct.id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: body.price ? parseFloat(body.price) : undefined,
        compareAtPrice: body.compareAtPrice ? parseFloat(body.compareAtPrice) : undefined,
        cost: body.cost ? parseFloat(body.cost) : undefined,
        sku: body.sku,
        barcode: body.barcode,
        trackQuantity: body.trackQuantity,
        quantity: body.quantity ? parseInt(body.quantity) : undefined,
        allowBackorder: body.allowBackorder,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        status: body.status,
        publishedAt: body.status === 'PUBLISHED' && !existingProduct.publishedAt ? new Date() : undefined,
        categoryId: body.categoryId,
        brandId: body.brandId,
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
    
    return NextResponse.json(product);
    
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { slug } = params;
    
    // Get existing product
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
      include: { store: true },
    });
    
    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    // Check permissions
    const canDelete = 
      session.user.role === 'SUPER_ADMIN' ||
      session.user.role === 'ADMIN' ||
      (session.user.role === 'VENDOR' && existingProduct.store.userId === session.user.id);
    
    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Check if product has orders
    const orderCount = await prisma.orderItem.count({
      where: { productId: existingProduct.id },
    });
    
    if (orderCount > 0) {
      // Archive instead of delete if there are orders
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: { status: 'ARCHIVED' },
      });
      
      return NextResponse.json({
        message: 'Product archived successfully (cannot delete products with orders)',
      });
    }
    
    // Delete product and related data
    await prisma.product.delete({
      where: { id: existingProduct.id },
    });
    
    return NextResponse.json({
      message: 'Product deleted successfully',
    });
    
  } catch (error) {
    console.error('Product delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}