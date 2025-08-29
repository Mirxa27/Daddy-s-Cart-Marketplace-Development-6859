import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Find the order using the session ID
        const order = await prisma.order.findFirst({
          where: {
            paymentId: session.id,
          },
        });

        if (order) {
          // Update order status
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'PAID',
              status: 'PROCESSING',
              paidAt: new Date(),
            },
          });

          // Update product inventory
          const orderItems = await prisma.orderItem.findMany({
            where: { orderId: order.id },
          });

          for (const item of orderItems) {
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                quantity: { decrement: item.quantity },
                sales: { increment: item.quantity },
              },
            });
          }

          // Clear user's cart
          const cart = await prisma.cart.findFirst({
            where: { userId: order.userId },
          });

          if (cart) {
            await prisma.cartItem.deleteMany({
              where: { cartId: cart.id },
            });
          }

          // TODO: Send order confirmation email
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent ${paymentIntent.id} was successful!`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Update order status to failed
        const order = await prisma.order.findFirst({
          where: {
            paymentId: paymentIntent.id,
          },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'UNPAID',
              status: 'CANCELLED',
              cancelledAt: new Date(),
            },
          });
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        
        // Update order status to refunded
        const order = await prisma.order.findFirst({
          where: {
            paymentId: charge.payment_intent as string,
          },
        });

        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'REFUNDED',
              status: 'REFUNDED',
            },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}