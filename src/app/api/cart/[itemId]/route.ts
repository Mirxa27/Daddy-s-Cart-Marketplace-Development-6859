import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: { itemId: string };
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { itemId } = params;
    const body = await req.json();
    const { quantity } = body;
    
    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Quantity must be at least 1' },
        { status: 400 }
      );
    }
    
    // Get cart item with product info
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        product: {
          include: {
            variants: true,
          },
        },
        variant: true,
      },
    });
    
    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }
    
    // Verify ownership
    if (cartItem.cart.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Check inventory
    let availableQuantity = cartItem.product.quantity;
    if (cartItem.variantId && cartItem.variant) {
      availableQuantity = cartItem.variant.quantity;
    }
    
    if (cartItem.product.trackQuantity && availableQuantity < quantity) {
      return NextResponse.json(
        { error: `Only ${availableQuantity} items available in stock` },
        { status: 400 }
      );
    }
    
    // Update cart item
    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: {
          include: {
            images: {
              take: 1,
              orderBy: { position: 'asc' },
            },
            store: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        variant: {
          include: {
            options: true,
          },
        },
      },
    });
    
    return NextResponse.json(updatedItem);
    
  } catch (error) {
    console.error('Update cart item error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
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
    
    const { itemId } = params;
    
    // Get cart item
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
      },
    });
    
    if (!cartItem) {
      return NextResponse.json(
        { error: 'Cart item not found' },
        { status: 404 }
      );
    }
    
    // Verify ownership
    if (cartItem.cart.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Delete cart item
    await prisma.cartItem.delete({
      where: { id: itemId },
    });
    
    return NextResponse.json({ message: 'Item removed from cart' });
    
  } catch (error) {
    console.error('Remove cart item error:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}