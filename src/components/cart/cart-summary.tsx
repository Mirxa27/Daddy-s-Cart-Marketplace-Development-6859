'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, CreditCard, Truck, Shield, Tag } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/hooks/use-cart-store';
import toast from 'react-hot-toast';

interface CartSummary {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  itemCount: number;
  freeShippingThreshold?: number;
}

export function CartSummary() {
  const router = useRouter();
  const { data: session } = useSession();
  const [summary, setSummary] = useState<CartSummary>({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    total: 0,
    itemCount: 0,
  });
  const [promoCode, setPromoCode] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  
  const { items: localCartItems, getSubtotal, getItemCount } = useCartStore();

  useEffect(() => {
    fetchCartSummary();
  }, []);

  const fetchCartSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart/summary', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      } else {
        // Fallback to local cart calculation
        const subtotal = getSubtotal();
        const tax = subtotal * 0.08; // 8% tax
        const shipping = subtotal >= 50 ? 0 : 9.99;
        const total = subtotal + tax + shipping;
        
        setSummary({
          subtotal,
          tax,
          shipping,
          discount: 0,
          total,
          itemCount: getItemCount(),
          freeShippingThreshold: 50,
        });
      }
    } catch (error) {
      console.error('Failed to fetch cart summary:', error);
      // Use local calculation as fallback
      const subtotal = getSubtotal();
      const tax = subtotal * 0.08;
      const shipping = subtotal >= 50 ? 0 : 9.99;
      const total = subtotal + tax + shipping;
      
      setSummary({
        subtotal,
        tax,
        shipping,
        discount: 0,
        total,
        itemCount: getItemCount(),
        freeShippingThreshold: 50,
      });
    } finally {
      setLoading(false);
    }
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    setApplyingPromo(true);
    try {
      const response = await fetch('/api/cart/promo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: promoCode }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(prev => ({
          ...prev,
          discount: data.discount,
          total: prev.subtotal + prev.tax + prev.shipping - data.discount,
        }));
        toast.success(`Promo code applied! You saved ${formatPrice(data.discount)}`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Invalid promo code');
      }
    } catch (error) {
      toast.error('Failed to apply promo code');
    } finally {
      setApplyingPromo(false);
    }
  };

  const proceedToCheckout = async () => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/checkout');
      return;
    }

    if (summary.itemCount === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setProcessingCheckout(true);
    try {
      router.push('/checkout');
    } catch (error) {
      toast.error('Failed to proceed to checkout');
    } finally {
      setProcessingCheckout(false);
    }
  };

  const remainingForFreeShipping = summary.freeShippingThreshold 
    ? Math.max(0, summary.freeShippingThreshold - summary.subtotal)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-12 bg-muted animate-pulse rounded" />
          </div>
        ) : (
          <>
            {/* Free Shipping Progress */}
            {summary.freeShippingThreshold && remainingForFreeShipping > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Free Shipping Available
                  </span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Add {formatPrice(remainingForFreeShipping)} more to qualify for free shipping
                </p>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, (summary.subtotal / summary.freeShippingThreshold) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            )}

            {/* Promo Code */}
            <div className="space-y-2">
              <Label htmlFor="promoCode">Promo Code</Label>
              <div className="flex gap-2">
                <Input
                  id="promoCode"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={applyingPromo}
                />
                <Button
                  variant="outline"
                  onClick={applyPromoCode}
                  disabled={!promoCode.trim() || applyingPromo}
                  className="whitespace-nowrap"
                >
                  <Tag className="h-4 w-4 mr-1" />
                  Apply
                </Button>
              </div>
            </div>

            <Separator />

            {/* Price Breakdown */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({summary.itemCount} item{summary.itemCount !== 1 ? 's' : ''})</span>
                <span>{formatPrice(summary.subtotal)}</span>
              </div>
              
              {summary.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(summary.discount)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>
                  {summary.shipping === 0 ? (
                    <Badge variant="secondary" className="text-green-600">Free</Badge>
                  ) : (
                    formatPrice(summary.shipping)
                  )}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>{formatPrice(summary.tax)}</span>
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(summary.total)}</span>
            </div>

            {/* Checkout Button */}
            <Button
              className="w-full touch-target"
              onClick={proceedToCheckout}
              disabled={summary.itemCount === 0 || processingCheckout}
              size="lg"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {processingCheckout ? 'Processing...' : `Checkout ${formatPrice(summary.total)}`}
            </Button>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>Secure checkout powered by Stripe</span>
            </div>

            {/* Payment Methods */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">We accept</p>
              <div className="flex justify-center gap-2">
                <Badge variant="outline" className="text-xs">Visa</Badge>
                <Badge variant="outline" className="text-xs">Mastercard</Badge>
                <Badge variant="outline" className="text-xs">PayPal</Badge>
                <Badge variant="outline" className="text-xs">Apple Pay</Badge>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}