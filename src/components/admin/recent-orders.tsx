'use client';

import { formatPrice, formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
  items: Array<{
    id: string;
    quantity: number;
  }>;
}

interface RecentOrdersProps {
  orders: Order[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No orders yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Order</th>
            <th className="text-left py-3 px-4">Customer</th>
            <th className="text-left py-3 px-4">Items</th>
            <th className="text-left py-3 px-4">Total</th>
            <th className="text-left py-3 px-4">Status</th>
            <th className="text-left py-3 px-4">Date</th>
            <th className="text-left py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b hover:bg-muted/50">
              <td className="py-3 px-4">
                <span className="font-medium">{order.orderNumber}</span>
              </td>
              <td className="py-3 px-4">
                <div>
                  <p className="font-medium">{order.user.name || 'Guest'}</p>
                  <p className="text-sm text-muted-foreground">{order.user.email}</p>
                </div>
              </td>
              <td className="py-3 px-4">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
              </td>
              <td className="py-3 px-4 font-medium">
                {formatPrice(order.total)}
              </td>
              <td className="py-3 px-4">
                <Badge className={getStatusColor(order.status)} variant="secondary">
                  {order.status}
                </Badge>
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground">
                {formatDateTime(order.createdAt)}
              </td>
              <td className="py-3 px-4">
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/admin/orders/${order.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}