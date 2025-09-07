'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, TrendingDown, Store } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface DashboardStatsProps {
  stats: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalStores?: number;
    changes?: {
      users: number;
      products: number;
      orders: number;
      revenue: number;
    };
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };
  
  const getChangeType = (change: number) => {
    return change >= 0 ? 'positive' : 'negative';
  };
  
  const statsCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      change: stats.changes ? formatChange(stats.changes.revenue) : '+12.5%',
      changeType: stats.changes ? getChangeType(stats.changes.revenue) : 'positive',
      description: 'from last period',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      change: stats.changes ? formatChange(stats.changes.orders) : '+8.2%',
      changeType: stats.changes ? getChangeType(stats.changes.orders) : 'positive',
      description: 'from last period',
    },
    {
      title: 'Active Products',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      change: stats.changes ? formatChange(stats.changes.products) : '+3.1%',
      changeType: stats.changes ? getChangeType(stats.changes.products) : 'positive',
      description: 'from last period',
    },
    {
      title: stats.totalStores !== undefined ? 'Total Customers' : 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      change: stats.changes ? formatChange(stats.changes.users) : '+15.3%',
      changeType: stats.changes ? getChangeType(stats.changes.users) : 'positive',
      description: 'from last period',
    },
  ];
  
  // Add stores card if totalStores is provided
  if (stats.totalStores !== undefined) {
    statsCards.push({
      title: 'Active Stores',
      value: stats.totalStores.toLocaleString(),
      icon: Store,
      change: '+5.2%',
      changeType: 'positive',
      description: 'from last period',
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {statsCards.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = stat.changeType === 'positive' ? TrendingUp : TrendingDown;
        
        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-full">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendIcon
                  className={`h-3 w-3 mr-1 ${
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                />
                <span
                  className={`font-medium ${
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </span>
                <span className="ml-1">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}