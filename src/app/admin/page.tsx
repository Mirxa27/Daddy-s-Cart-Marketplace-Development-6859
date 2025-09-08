export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/components/admin/dashboard-stats';
import { RecentOrders } from '@/components/admin/recent-orders';
import { SalesChart } from '@/components/admin/sales-chart';
import { TopProducts } from '@/components/admin/top-products';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for Daddy\'s Cart Marketplace',
};

async function getDashboardData() {
  // Return mock data during build or when database is unavailable
  if (process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL) {
    return {
      stats: {
        totalUsers: 1250,
        totalProducts: 450,
        totalOrders: 89,
        totalRevenue: 12450.00,
        totalStores: 25,
        changes: {
          users: 15.3,
          products: 8.2,
          orders: 12.5,
          revenue: 18.7,
        },
      },
      recentOrders: [],
      topProducts: [],
      salesByDay: [],
      ordersByStatus: [
        { status: 'PENDING', count: 5 },
        { status: 'PROCESSING', count: 12 },
        { status: 'SHIPPED', count: 8 },
        { status: 'DELIVERED', count: 45 },
        { status: 'CANCELLED', count: 2 },
      ],
    };
  }

  try {
    // Get current period (last 30 days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      totalStores,
      recentOrders,
      topProducts,
      salesByDay,
      ordersByStatus,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count({ where: { status: 'PUBLISHED' } }),
      prisma.order.count({ where: { createdAt: { gte: startDate } } }),
      prisma.order.aggregate({
        where: { createdAt: { gte: startDate } },
        _sum: { total: true },
      }),
      prisma.store.count({ where: { isActive: true } }),
      prisma.order.findMany({
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
      prisma.product.findMany({
        take: 10,
        orderBy: { sales: 'desc' },
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
      // Get sales by day for the chart
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*)::integer as orders,
          SUM(total)::float as revenue
        FROM "Order"
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      // Get orders by status
      prisma.order.groupBy({
        by: ['status'],
        where: { createdAt: { gte: startDate } },
        _count: { status: true },
      }),
    ]);

    // Calculate previous period for comparison
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - 30);
    
    const [
      prevTotalOrders,
      prevTotalRevenue,
      prevTotalUsers,
      prevTotalProducts,
    ] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: prevStartDate, lt: startDate },
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: prevStartDate, lt: startDate },
        },
        _sum: { total: true },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: prevStartDate, lt: startDate },
        },
      }),
      prisma.product.count({
        where: {
          createdAt: { gte: prevStartDate, lt: startDate },
        },
      }),
    ]);

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalStores,
        changes: {
          users: calculateChange(totalUsers, prevTotalUsers),
          products: calculateChange(totalProducts, prevTotalProducts),
          orders: calculateChange(totalOrders, prevTotalOrders),
          revenue: calculateChange(totalRevenue._sum.total || 0, prevTotalRevenue._sum.total || 0),
        },
      },
      recentOrders,
      topProducts,
      salesByDay: (salesByDay as any[]).map(item => ({
        date: item.date,
        orders: item.orders,
        revenue: item.revenue,
      })),
      ordersByStatus: ordersByStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
    };
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    // Return default values when database is not available
    return {
      stats: {
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalStores: 0,
        changes: {
          users: 0,
          products: 0,
          orders: 0,
          revenue: 0,
        },
      },
      recentOrders: [],
      topProducts: [],
      salesByDay: [],
      ordersByStatus: [],
    };
  }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/auth/signin');
  }

  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your admin dashboard. Here's an overview of your marketplace.
        </p>
      </div>

      <DashboardStats stats={data.stats} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>
              Daily sales performance for the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart salesData={data.salesByDay} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>
              Best selling products by total sales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TopProducts products={data.topProducts} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest orders from your marketplace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrders orders={data.recentOrders} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>
              Current order status breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.ordersByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'PENDING' ? 'bg-yellow-500' :
                      item.status === 'PROCESSING' ? 'bg-blue-500' :
                      item.status === 'SHIPPED' ? 'bg-purple-500' :
                      item.status === 'DELIVERED' ? 'bg-green-500' :
                      item.status === 'CANCELLED' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`} />
                    <span className="text-sm font-medium capitalize">
                      {item.status.toLowerCase().replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}