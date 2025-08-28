'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { ShoppingCart, Menu, X, User, Search, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/hooks/use-cart-store';
import { cn } from '@/lib/utils';

export function MainNav() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const cartItemsCount = useCartStore((state) => state.items.length);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container-mobile mx-auto">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden touch-target"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold">Daddy's Cart</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link href="/products" className="text-sm font-medium hover:text-primary">
              Products
            </Link>
            <Link href="/categories" className="text-sm font-medium hover:text-primary">
              Categories
            </Link>
            <Link href="/deals" className="text-sm font-medium hover:text-primary">
              Deals
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary">
              About
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Mobile Search Toggle */}
            <button
              className="md:hidden touch-target"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Toggle search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative touch-target">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Wishlist</span>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative touch-target">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Link>

            {/* User Menu */}
            {session ? (
              <Link href="/account" className="touch-target">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Link>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="md:hidden py-3 border-t">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 w-full"
                autoFocus
              />
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          'lg:hidden fixed inset-0 z-40 bg-background transform transition-transform duration-300 ease-in-out',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ top: '64px' }}
      >
        <div className="container-mobile py-6 space-y-4">
          <Link
            href="/products"
            className="block py-2 text-base font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Products
          </Link>
          <Link
            href="/categories"
            className="block py-2 text-base font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Categories
          </Link>
          <Link
            href="/deals"
            className="block py-2 text-base font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Deals
          </Link>
          <Link
            href="/about"
            className="block py-2 text-base font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
          
          {!session && (
            <div className="pt-4 border-t space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}