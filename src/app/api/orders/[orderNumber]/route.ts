import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendOrderShippedEmail } from '@/lib/email';

interface RouteParams {
  params: { orderNumber: string };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { orderNumber } = params;
    
    // Get order with all details
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        store: {
          select: { 
            id: true, 
            name: true, 
            slug: true, 
            businessEmail: true, 
            businessPhone: true,
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        items: {
          include: {
            product: {
              select: { 
                id: true, 
                name: true, 
                slug: true,
                images: {
                  take: 1,
                  orderBy: { position: 'asc' },
                },
              },
            },
            variant: {
              select: { id: true, name: true, options: true },
            },
          },
        },
        shippingAddress: true,
      },
    });
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Check permissions
    const canView = 
      order.userId === session.user.id ||
      order.store.user.id === session.user.id ||
      ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role);
    
    if (!canView) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return NextResponse.json(order);
    
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
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
    
    const { orderNumber } = params;
    const body = await req.json();
    
    // Get order
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        store: {
          include: {
            user: true,
          },
        },
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
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Check permissions - only store owner or admin can update
    const canUpdate = 
      order.store.user.id === session.user.id ||
      ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role);
    
    if (!canUpdate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const updateData: any = {};
    
    // Update status
    if (body.status && body.status !== order.status) {
      updateData.status = body.status;
      
      // Set timestamps based on status
      if (body.status === 'SHIPPED' && !order.shippedAt) {
        updateData.shippedAt = new Date();
      } else if (body.status === 'DELIVERED' && !order.deliveredAt) {
        updateData.deliveredAt = new Date();
      } else if (body.status === 'CANCELLED' && !order.cancelledAt) {
        updateData.cancelledAt = new Date();
      }
    }
    
    // Update tracking number
    if (body.trackingNumber !== undefined) {
      updateData.trackingNumber = body.trackingNumber;
    }
    
    // Update notes
    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }
    
    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: updateData,
      include: {
        user: true,
        store: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        shippingAddress: true,
      },
    });
    
    // Send notifications based on status change
    if (body.status && body.status !== order.status) {
      try {
        // Send email notification
        if (body.status === 'SHIPPED' && body.trackingNumber) {
          await sendOrderShippedEmail({
            ...updatedOrder,
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            shippingAddress: `${order.shippingAddress?.street}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.postalCode}`,
            trackingUrl: `https://tracking.example.com/${body.trackingNumber}`,
          });
        }
        
        // Create in-app notification
        let notificationMessage = '';
        switch (body.status) {
          case 'PROCESSING':
            notificationMessage = 'Your order is now being processed.';
            break;
          case 'SHIPPED':
            notificationMessage = `Your order has been shipped${body.trackingNumber ? ` with tracking number ${body.trackingNumber}` : ''}.`;
            break;
          case 'DELIVERED':
            notificationMessage = 'Your order has been delivered. Thank you for shopping with us!';
            break;
          case 'CANCELLED':
            notificationMessage = 'Your order has been cancelled.';
            break;
          case 'REFUNDED':
            notificationMessage = 'Your order has been refunded.';
            break;
        }
        
        if (notificationMessage) {
          await prisma.notification.create({
            data: {
              userId: order.userId,
              type: 'ORDER',
              title: `Order ${body.status.toLowerCase()}`,
              message: notificationMessage,
              link: `/orders/${order.orderNumber}`,
            },
          });
        }
      } catch (notificationError) {
        console.error('Failed to send order update notification:', notificationError);
        // Don't fail the order update if notification fails
      }
    }
    
    return NextResponse.json(updatedOrder);
    
  } catch (error) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}