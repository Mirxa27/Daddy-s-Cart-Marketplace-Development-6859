'use client';

import { useEffect, useState } from 'react';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, BarChart, ComposedChart } from 'recharts';
import { formatPrice } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SalesChartProps {
  salesData?: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

export function SalesChart({ salesData }: SalesChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (salesData) {
      // Process the sales data
      const processedData = salesData.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        orders: Number(item.orders),
        revenue: Number(item.revenue),
      }));
      setData(processedData);
      setLoading(false);
    } else {
      // Fetch data from API
      fetchSalesData();
    }
  }, [salesData]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/analytics?period=30');
      if (response.ok) {
        const analyticsData = await response.json();
        const processedData = analyticsData.salesByDay.map((item: any) => ({
          date: new Date(item.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          orders: Number(item.orders),
          revenue: Number(item.revenue),
        }));
        setData(processedData);
      }
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
      // Fallback to mock data
      const mockData = generateMockData();
      setData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        orders: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 5000) + 1000,
      });
    }
    return days;
  };

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="date" 
          className="text-xs"
          tick={{ fill: 'currentColor', fontSize: 12 }}
          interval="preserveStartEnd"
        />
        <YAxis 
          yAxisId="revenue"
          orientation="left"
          className="text-xs"
          tick={{ fill: 'currentColor', fontSize: 12 }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <YAxis 
          yAxisId="orders"
          orientation="right"
          className="text-xs"
          tick={{ fill: 'currentColor', fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value: any, name: string) => {
            if (name === 'revenue') {
              return [formatPrice(value), 'Revenue'];
            }
            return [value, 'Orders'];
          }}
          labelFormatter={(label) => `Date: ${label}`}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            fontSize: '12px',
          }}
        />
        <Bar 
          yAxisId="orders"
          dataKey="orders" 
          fill="hsl(var(--muted))"
          fillOpacity={0.6}
          radius={[2, 2, 0, 0]}
        />
        <Line 
          yAxisId="revenue"
          type="monotone" 
          dataKey="revenue" 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--primary))', r: 3 }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}