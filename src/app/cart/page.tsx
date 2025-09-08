import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import { MainNav } from '@/components/layout/main-nav';
import { Footer } from '@/components/layout/footer';
import { CartContent } from '@/components/cart/cart-content';
import { CartSummary } from '@/components/cart/cart-summary';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Shopping Cart - Daddy\'s Cart Marketplace',
  description: 'Review your items and proceed to checkout.',
};

function CartLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-20 h-20 bg-muted animate-pulse rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/4" />
                  </div>
                  <div className="w-24 h-8 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="h-6 bg-muted animate-pulse rounded" />
            <div className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-12 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <>
      <MainNav />
      <main className="min-h-screen bg-background">
        <div className="container-mobile py-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Shopping Cart</h1>
            <p className="text-muted-foreground">
              Review your items and proceed to checkout
            </p>
          </div>

          <Suspense fallback={<CartLoading />}>
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <CartContent />
              </div>

              {/* Cart Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-4 space-y-6">
                  <CartSummary />
                </div>
              </div>
            </div>
          </Suspense>

        </div>
      </main>
      <Footer />
    </>
  );
}