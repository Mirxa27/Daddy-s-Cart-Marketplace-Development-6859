'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Tag,
  Star,
  MessageSquare,
  Bell,
  FileText,
  CreditCard,
  Truck,
  Shield,
  Database,
  Palette,
  Globe,
  Mail,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/utils';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<any>;
  children?: NavItem[];
  badge?: string;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Users',
    icon: Users,
    children: [
      { label: 'All Users', href: '/admin/users', icon: Users },
      { label: 'Sellers', href: '/admin/users/sellers', icon: Users },
      { label: 'Buyers', href: '/admin/users/buyers', icon: Users },
      { label: 'User Roles', href: '/admin/users/roles', icon: Shield },
    ],
  },
  {
    label: 'Products',
    icon: Package,
    children: [
      { label: 'All Products', href: '/admin/products', icon: Package },
      { label: 'Categories', href: '/admin/products/categories', icon: Tag },
      { label: 'Brands', href: '/admin/products/brands', icon: Star },
      { label: 'Attributes', href: '/admin/products/attributes', icon: Settings },
      { label: 'Reviews', href: '/admin/products/reviews', icon: MessageSquare },
    ],
  },
  {
    label: 'Orders',
    icon: ShoppingCart,
    children: [
      { label: 'All Orders', href: '/admin/orders', icon: ShoppingCart, badge: '12' },
      { label: 'Pending', href: '/admin/orders/pending', icon: Truck },
      { label: 'Processing', href: '/admin/orders/processing', icon: Package },
      { label: 'Shipped', href: '/admin/orders/shipped', icon: Truck },
      { label: 'Delivered', href: '/admin/orders/delivered', icon: Package },
      { label: 'Returns', href: '/admin/orders/returns', icon: Package },
    ],
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    children: [
      { label: 'Sales Report', href: '/admin/analytics/sales', icon: BarChart3 },
      { label: 'User Analytics', href: '/admin/analytics/users', icon: Users },
      { label: 'Product Performance', href: '/admin/analytics/products', icon: Package },
      { label: 'Traffic Analysis', href: '/admin/analytics/traffic', icon: Globe },
    ],
  },
  {
    label: 'Marketing',
    icon: Mail,
    children: [
      { label: 'Coupons', href: '/admin/marketing/coupons', icon: Tag },
      { label: 'Newsletters', href: '/admin/marketing/newsletters', icon: Mail },
      { label: 'Notifications', href: '/admin/marketing/notifications', icon: Bell },
      { label: 'Campaigns', href: '/admin/marketing/campaigns', icon: Mail },
    ],
  },
  {
    label: 'Finance',
    icon: CreditCard,
    children: [
      { label: 'Transactions', href: '/admin/finance/transactions', icon: CreditCard },
      { label: 'Payouts', href: '/admin/finance/payouts', icon: CreditCard },
      { label: 'Revenue', href: '/admin/finance/revenue', icon: BarChart3 },
      { label: 'Tax Settings', href: '/admin/finance/tax', icon: Settings },
    ],
  },
  {
    label: 'Content',
    icon: FileText,
    children: [
      { label: 'Pages', href: '/admin/content/pages', icon: FileText },
      { label: 'Blog Posts', href: '/admin/content/blog', icon: FileText },
      { label: 'Media Library', href: '/admin/content/media', icon: FileText },
      { label: 'SEO Settings', href: '/admin/content/seo', icon: Globe },
    ],
  },
  {
    label: 'Settings',
    icon: Settings,
    children: [
      { label: 'General', href: '/admin/settings/general', icon: Settings },
      { label: 'Appearance', href: '/admin/settings/appearance', icon: Palette },
      { label: 'Payment Gateways', href: '/admin/settings/payments', icon: CreditCard },
      { label: 'Shipping', href: '/admin/settings/shipping', icon: Truck },
      { label: 'Email Templates', href: '/admin/settings/email', icon: Mail },
      { label: 'Database', href: '/admin/settings/database', icon: Database },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Users', 'Products', 'Orders']);

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const active = item.href ? isActive(item.href) : false;

    if (hasChildren) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleExpanded(item.label)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors',
              'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
              level > 0 && 'ml-4'
            )}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {item.badge}
                </span>
              )}
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
          
          {isExpanded && (
            <div className="ml-6 mt-1 space-y-1">
              {item.children.map(child => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        href={item.href!}
        className={cn(
          'flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors',
          active
            ? 'bg-blue-100 text-blue-700 font-medium'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
          level > 0 && 'ml-4'
        )}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        <span>{item.label}</span>
        {item.badge && (
          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-auto">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r border-gray-200 lg:translate-x-0 -translate-x-full transition-transform">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <Link href="/admin" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white text-sm font-bold">
            DC
          </div>
          <span className="text-xl font-bold text-gray-900">Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-4rem)]">
        {navItems.map(item => renderNavItem(item))}
      </nav>
    </div>
  );
}