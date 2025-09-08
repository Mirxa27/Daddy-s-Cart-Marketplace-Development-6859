import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30'; // days
    const storeId = searchParams.get('storeId');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    // Build where clause for filtering by store if needed
    const orderWhere: any = {
      createdAt: { gte: startDate },
    };
    if (storeId) {
      orderWhere.storeId = storeId;
    }
    
    // Get current period stats
    const [
      totalUsers,
      totalActiveUsers,
      totalProducts,
      totalActiveProducts,
      totalOrders,
      totalRevenue,
      totalStores,
      totalActiveStores,
      recentOrders,
      topProducts,
      topStores,
      salesByDay,
      ordersByStatus,
      usersByRole,
    ] = await Promise.all([
      // Users
      prisma.user.count(),
      prisma.user.count({
        where: {
          isActive: true,
          createdAt: { gte: startDate },
        },
      }),
      
      // Products
      prisma.product.count(),
      prisma.product.count({
        where: {
          status: 'PUBLISHED',
          createdAt: { gte: startDate },
        },
      }),
      
      // Orders
      prisma.order.count({ where: orderWhere }),
      prisma.order.aggregate({
        where: orderWhere,
        _sum: { total: true },
      }),
      
      // Stores
      prisma.store.count(),
      prisma.store.count({
        where: {
          isActive: true,
          createdAt: { gte: startDate },
        },
      }),
      
      // Recent orders
      prisma.order.findMany({
        where: orderWhere,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
          store: {
            select: { id: true, name: true, slug: true },
          },
          items: {
            take: 3,
            include: {
              product: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
      }),
      
      // Top products
      prisma.product.findMany({
        take: 10,
        orderBy: { sales: 'desc' },
        where: storeId ? { storeId } : undefined,
        include: {
          images: {
            take: 1,
            orderBy: { position: 'asc' },
          },
          store: {
            select: { id: true, name: true, slug: true },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      
      // Top stores
      prisma.store.findMany({
        take: 10,
        orderBy: { totalSales: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { products: true, orders: true },
          },
        },
      }),
      
      // Sales by day (last 30 days)
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as orders,
          SUM(total) as revenue
        FROM "Order"
        WHERE created_at >= ${startDate}
        ${storeId ? prisma.$queryRaw`AND store_id = ${storeId}` : prisma.$queryRaw``}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      
      // Orders by status
      prisma.order.groupBy({
        by: ['status'],
        where: orderWhere,
        _count: { status: true },
      }),
      
      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
    ]);
    
    // Calculate previous period for comparison
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - parseInt(period));
    
    const prevOrderWhere: any = {
      createdAt: {
        gte: prevStartDate,
        lt: startDate,
      },
    };
    if (storeId) {
      prevOrderWhere.storeId = storeId;
    }
    
    const [
      prevTotalOrders,
      prevTotalRevenue,
      prevTotalUsers,
      prevTotalProducts,
    ] = await Promise.all([
      prisma.order.count({ where: prevOrderWhere }),
      prisma.order.aggregate({
        where: prevOrderWhere,
        _sum: { total: true },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: prevStartDate,
            lt: startDate,
          },
        },
      }),
      prisma.product.count({
        where: {
          createdAt: {
            gte: prevStartDate,
            lt: startDate,
          },
        },
      }),
    ]);
    
    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };
    
    const stats = {
      totalUsers,
      totalActiveUsers,
      totalProducts,
      totalActiveProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      totalStores,
      totalActiveStores,
      changes: {
        users: calculateChange(totalActiveUsers, prevTotalUsers),
        products: calculateChange(totalActiveProducts, prevTotalProducts),
        orders: calculateChange(totalOrders, prevTotalOrders),
        revenue: calculateChange(totalRevenue._sum.total || 0, prevTotalRevenue._sum.total || 0),
      },
    };
    
    return NextResponse.json({
      stats,
      recentOrders,
      topProducts,
      topStores,
      salesByDay,
      ordersByStatus: ordersByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      usersByRole: usersByRole.map(item => ({
        role: item.role,
        count: item._count.role,
      })),
      period: parseInt(period),
    });
    
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}