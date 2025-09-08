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
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const storeId = searchParams.get('storeId');
    const skip = (page - 1) * limit;
    
    // Build where clause based on user role
    let where: any = {};
    
    if (session.user.role === 'USER') {
      where.userId = session.user.id;
    } else if (session.user.role === 'VENDOR') {
      // Get vendor's store
      const store = await prisma.store.findUnique({
        where: { userId: session.user.id },
      });
      
      if (store) {
        where.storeId = store.id;
      } else {
        return NextResponse.json({ orders: [], pagination: { page, limit, totalCount: 0, totalPages: 0 } });
      }
    } else if (storeId && ['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      where.storeId = storeId;
    }
    
    if (status) {
      where.status = status;
    }
    
    // Get orders
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
          store: {
            select: { id: true, name: true, slug: true },
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
                select: { id: true, name: true },
              },
            },
          },
          shippingAddress: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);
    
    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
    
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}