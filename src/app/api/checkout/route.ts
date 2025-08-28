import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { checkoutSchema } from '@/lib/validations/order';
import { generateOrderNumber, calculateTax, calculateTotal } from '@/lib/utils';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const validatedData = checkoutSchema.parse(body);
    
    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
    
    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }
    
    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.variant?.price || item.product.price;
      return sum + price * item.quantity;
    }, 0);
    
    // Get tax rate from settings
    const taxSetting = await prisma.setting.findUnique({
      where: { key: 'tax_rate' },
    });
    const taxRate = (taxSetting?.value as number) || 0.08;
    const tax = calculateTax(subtotal, taxRate);
    
    // Get shipping fee from settings
    const shippingSetting = await prisma.setting.findUnique({
      where: { key: 'shipping_fee' },
    });
    const shippingFee = (shippingSetting?.value as number) || 5.99;
    
    // Check for free shipping threshold
    const freeShippingThresholdSetting = await prisma.setting.findUnique({
      where: { key: 'free_shipping_threshold' },
    });
    const freeShippingThreshold = (freeShippingThresholdSetting?.value as number) || 50;
    const shipping = subtotal >= freeShippingThreshold ? 0 : shippingFee;
    
    const total = calculateTotal(subtotal, tax, shipping);
    
    // Create or update shipping address
    let shippingAddress = await prisma.address.create({
      data: {
        userId: session.user.id,
        type: 'SHIPPING',
        ...validatedData.shippingAddress,
      },
    });
    
    // Create Stripe checkout session
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
          description: item.variant ? `Variant: ${item.variant.name}` : undefined,
          images: [], // Add product images if available
        },
        unit_amount: Math.round((item.variant?.price || item.product.price) * 100),
      },
      quantity: item.quantity,
    }));
    
    // Add shipping as a line item if applicable
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }
    
    // Add tax as a line item
    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Tax',
          },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });
    }
    
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      customer_email: session.user.email!,
      metadata: {
        userId: session.user.id,
      },
    });
    
    // Group items by store
    const itemsByStore = cart.items.reduce((acc, item) => {
      const storeId = item.product.storeId;
      if (!acc[storeId]) {
        acc[storeId] = [];
      }
      acc[storeId].push(item);
      return acc;
    }, {} as Record<string, typeof cart.items>);
    
    // Create orders for each store
    for (const [storeId, items] of Object.entries(itemsByStore)) {
      const storeSubtotal = items.reduce((sum, item) => {
        const price = item.variant?.price || item.product.price;
        return sum + price * item.quantity;
      }, 0);
      
      const storeTax = calculateTax(storeSubtotal, taxRate);
      const storeShipping = storeSubtotal >= freeShippingThreshold ? 0 : shippingFee / Object.keys(itemsByStore).length;
      const storeTotal = calculateTotal(storeSubtotal, storeTax, storeShipping);
      
      // Create order
      const order = await prisma.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: session.user.id,
          storeId,
          subtotal: storeSubtotal,
          tax: storeTax,
          shipping: storeShipping,
          total: storeTotal,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          paymentMethod: validatedData.paymentMethod,
          paymentId: checkoutSession.id,
          shippingAddressId: shippingAddress.id,
          notes: validatedData.notes,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              name: item.product.name,
              price: item.variant?.price || item.product.price,
              quantity: item.quantity,
              total: (item.variant?.price || item.product.price) * item.quantity,
            })),
          },
        },
      });
      
      // Create notification for store owner
      const store = await prisma.store.findUnique({
        where: { id: storeId },
      });
      
      if (store) {
        await prisma.notification.create({
          data: {
            userId: store.userId,
            type: 'ORDER',
            title: 'New Order Received',
            message: `You have received a new order #${order.orderNumber}`,
            link: `/vendor/orders/${order.id}`,
          },
        });
      }
    }
    
    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Checkout failed' },
      { status: 500 }
    );
  }
}