export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardStats } from '@/components/admin/dashboard-stats';
import { RecentOrders } from '@/components/admin/recent-orders';
import { SalesChart } from '@/components/admin/sales-chart';
import { TopProducts } from '@/components/admin/top-products';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for Daddy\'s Cart Marketplace',
};

async function getDashboardData() {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: true,
          items: true,
        },
      }),
      prisma.product.findMany({
        take: 5,
        orderBy: {
          sales: 'desc',
        },
        select: {
          id: true,
          name: true,
          price: true,
          sales: true,
          rating: true,
          images: {
            take: 1,
          },
        },
      }),
    ]);

    return {
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
      },
      recentOrders,
      topProducts,
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
      },
      recentOrders: [],
      topProducts: [],
    };
  }
}

export default async function AdminDashboard() {
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
              Monthly sales performance for the current year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>
              Best selling products this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TopProducts products={data.topProducts} />
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
}