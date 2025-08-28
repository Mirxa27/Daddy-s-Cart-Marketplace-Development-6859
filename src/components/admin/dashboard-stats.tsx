'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface DashboardStatsProps {
  stats: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const statsCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      change: '+12.5%',
      changeType: 'positive',
      description: 'from last month',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      change: '+8.2%',
      changeType: 'positive',
      description: 'from last month',
    },
    {
      title: 'Active Products',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      change: '+3.1%',
      changeType: 'positive',
      description: 'from last month',
    },
    {
      title: 'Total Customers',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      change: '+15.3%',
      changeType: 'positive',
      description: 'from last month',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = stat.changeType === 'positive' ? TrendingUp : TrendingDown;
        
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendIcon
                  className={`h-3 w-3 mr-1 ${
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                />
                <span
                  className={
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
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