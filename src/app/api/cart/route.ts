import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get or create user's cart
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
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
        },
      },
    });
    
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
        include: {
          items: {
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
          },
        },
      });
    }
    
    // Calculate cart totals
    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.variant?.price || item.product.price;
      return sum + price * item.quantity;
    }, 0);
    
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Group items by store for shipping calculation
    const itemsByStore = cart.items.reduce((acc, item) => {
      const storeId = item.product.store.id;
      if (!acc[storeId]) {
        acc[storeId] = {
          store: item.product.store,
          items: [],
          subtotal: 0,
        };
      }
      acc[storeId].items.push(item);
      const price = item.variant?.price || item.product.price;
      acc[storeId].subtotal += price * item.quantity;
      return acc;
    }, {} as Record<string, any>);
    
    return NextResponse.json({
      ...cart,
      subtotal,
      itemCount,
      storeGroups: Object.values(itemsByStore),
    });
    
  } catch (error) {
    console.error('Cart fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
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
    
    const body = await req.json();
    const { productId, variantId, quantity = 1 } = body;
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    // Validate product exists and is available
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: variantId ? {
          where: { id: variantId },
        } : false,
      },
    });
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    
    if (product.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Product is not available' },
        { status: 400 }
      );
    }
    
    // Check inventory
    let availableQuantity = product.quantity;
    if (variantId && product.variants && product.variants.length > 0) {
      availableQuantity = product.variants[0].quantity;
    }
    
    if (product.trackQuantity && availableQuantity < quantity) {
      return NextResponse.json(
        { error: `Only ${availableQuantity} items available in stock` },
        { status: 400 }
      );
    }
    
    // Get or create user's cart
    let cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });
    
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: session.user.id },
      });
    }
    
    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_variantId: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
        },
      },
    });
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      
      // Check inventory again for updated quantity
      if (product.trackQuantity && availableQuantity < newQuantity) {
        return NextResponse.json(
          { error: `Only ${availableQuantity} items available in stock` },
          { status: 400 }
        );
      }
      
      // Update existing item
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
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
    } else {
      // Create new cart item
      const cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId,
          quantity,
        },
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
      
      return NextResponse.json(cartItem, { status: 201 });
    }
    
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Clear entire cart
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
    });
    
    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }
    
    return NextResponse.json({ message: 'Cart cleared successfully' });
    
  } catch (error) {
    console.error('Clear cart error:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}