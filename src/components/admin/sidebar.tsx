'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Store,
  Settings,
  FileText,
  TrendingUp,
  Tag,
  Palette,
  Mail,
  Shield,
  Database,
  Globe,
  CreditCard,
  Truck,
  Bell,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MenuItem {
  title: string;
  href: string;
  icon: any;
  roles?: string[];
  children?: MenuItem[];
}

const getMenuItems = (userRole: string): MenuItem[] => [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'SUPER_ADMIN', 'VENDOR'],
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
    roles: ['ADMIN', 'SUPER_ADMIN', 'VENDOR'],
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    roles: ['ADMIN', 'SUPER_ADMIN', 'VENDOR'],
  },
  {
    title: 'Customers',
    href: '/admin/customers',
    icon: Users,
    roles: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    title: 'Vendors',
    href: '/admin/vendors',
    icon: Store,
    roles: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: Tag,
    roles: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: TrendingUp,
    roles: ['ADMIN', 'SUPER_ADMIN', 'VENDOR'],
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    roles: ['ADMIN', 'SUPER_ADMIN'],
    children: [
      { title: 'General', href: '/admin/settings/general', icon: Globe, roles: ['ADMIN', 'SUPER_ADMIN'] },
      { title: 'Payment', href: '/admin/settings/payment', icon: CreditCard, roles: ['ADMIN', 'SUPER_ADMIN'] },
      { title: 'Shipping', href: '/admin/settings/shipping', icon: Truck, roles: ['ADMIN', 'SUPER_ADMIN'] },
      { title: 'Email', href: '/admin/settings/email', icon: Mail, roles: ['ADMIN', 'SUPER_ADMIN'] },
      { title: 'Security', href: '/admin/settings/security', icon: Shield, roles: ['SUPER_ADMIN'] },
      { title: 'Vendor', href: '/admin/settings/vendor', icon: Store, roles: ['ADMIN', 'SUPER_ADMIN'] },
    ],
  },
  {
    title: 'Notifications',
    href: '/admin/notifications',
    icon: Bell,
    roles: ['ADMIN', 'SUPER_ADMIN', 'VENDOR'],
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: FileText,
    roles: ['ADMIN', 'SUPER_ADMIN'],
  },
];

interface AdminSidebarProps {
  userRole: string;
  userId: string;
}

export function AdminSidebar({ userRole, userId }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  // Filter menu items based on user role
  const menuItems = getMenuItems(userRole).filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  return (
    <aside
      className={cn(
        'bg-background border-r transition-all duration-300 hidden md:block',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && (
          <Link href="/admin" className="text-xl font-bold">
            {userRole === 'VENDOR' ? 'Vendor Panel' : 'Admin Panel'}
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto touch-target"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isExpanded = expandedItems.includes(item.title);
            const hasChildren = item.children && item.children.length > 0;
            
            // Filter children based on user role
            const filteredChildren = item.children?.filter(child => 
              !child.roles || child.roles.includes(userRole)
            ) || [];
            
            return (
              <li key={item.href}>
                <div>
                  {hasChildren && filteredChildren.length > 0 ? (
                    <button
                      onClick={() => toggleExpanded(item.title)}
                      className={cn(
                        'flex items-center gap-3 w-full rounded-md px-3 py-2 text-sm font-medium transition-colors touch-target',
                        'hover:bg-accent hover:text-accent-foreground',
                        isActive && 'bg-accent text-accent-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.title}</span>
                          <ChevronRight
                            className={cn(
                              'h-4 w-4 transition-transform',
                              isExpanded && 'rotate-90'
                            )}
                          />
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors touch-target',
                        'hover:bg-accent hover:text-accent-foreground',
                        isActive && 'bg-accent text-accent-foreground'
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  )}
                </div>
                
                {hasChildren && isExpanded && !collapsed && filteredChildren.length > 0 && (
                  <ul className="mt-1 ml-6 space-y-1">
                    {filteredChildren.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = pathname === child.href;
                      
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors touch-target',
                              'hover:bg-accent hover:text-accent-foreground',
                              isChildActive && 'bg-accent text-accent-foreground'
                            )}
                          >
                            <ChildIcon className="h-3 w-3" />
                            <span>{child.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}