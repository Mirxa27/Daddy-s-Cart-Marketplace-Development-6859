import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail, sendOrderShippedEmail } from '@/lib/email';

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

          // Update product inventory and variant inventory
          const orderItems = await prisma.orderItem.findMany({
            where: { orderId: order.id },
            include: {
              product: true,
              variant: true,
            },
          });

          for (const item of orderItems) {
            // Update product sales and inventory
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                quantity: { decrement: item.quantity },
                sales: { increment: item.quantity },
                views: { increment: 1 }, // Increment views as well
              },
            });

            // Update variant inventory if applicable
            if (item.variantId) {
              await prisma.productVariant.update({
                where: { id: item.variantId },
                data: {
                  quantity: { decrement: item.quantity },
                },
              });
            }

            // Update store total sales
            await prisma.store.update({
              where: { id: item.product.storeId },
              data: {
                totalSales: { increment: item.quantity },
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

          // Send order confirmation email
          try {
            const orderWithDetails = await prisma.order.findUnique({
              where: { id: order.id },
              include: {
                user: true,
                items: {
                  include: {
                    product: true,
                    variant: true,
                  },
                },
                shippingAddress: true,
              },
            });

            if (orderWithDetails) {
              await sendOrderConfirmationEmail(orderWithDetails);
              console.log(`Order confirmation email sent for order ${order.orderNumber}`);
            }
          } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
            // Don't fail the webhook if email sending fails
          }

          // Create notification for user
          await prisma.notification.create({
            data: {
              userId: order.userId,
              type: 'ORDER',
              title: 'Order Confirmed',
              message: `Your order #${order.orderNumber} has been confirmed and is being processed.`,
              link: `/orders/${order.orderNumber}`,
            },
          });
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