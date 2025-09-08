'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft, Heart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/hooks/use-cart-store';
import toast from 'react-hot-toast';

interface CartItem {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images?: Array<{ url: string; alt?: string | null }>;
    store: { name: string; slug: string };
    quantity: number;
    status: string;
  };
  variant?: {
    id: string;
    name: string;
    price: number;
    options?: Array<{ name: string; value: string }>;
  };
}

export function CartContent() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { items: localCartItems, updateQuantity, removeItem, clearCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
      } else if (response.status === 401) {
        // User not logged in, use local cart
        setCartItems(localCartItems.map(item => ({
          id: item.id,
          productId: item.productId,
          variantId: item.variantId || null,
          quantity: item.quantity,
          product: {
            id: item.productId,
            name: item.product.name || '',
            slug: item.product.slug || '',
            price: item.product.price || 0,
            store: { name: 'Store', slug: 'store' },
            quantity: 100,
            status: 'PUBLISHED',
          },
          variant: item.variant ? {
            id: item.variantId || '',
            name: item.variant.name || '',
            price: item.variant.price || 0,
          } : undefined,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      // Fallback to local cart
      setCartItems(localCartItems.map(item => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        product: {
          id: item.productId,
          name: item.product.name || '',
          slug: item.product.slug || '',
          price: item.product.price || 0,
          store: { name: 'Store', slug: 'store' },
          quantity: 100,
          status: 'PUBLISHED',
        },
      })));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number, productId: string, variantId?: string | null) => {
    if (newQuantity < 1) return;

    setUpdating(itemId);
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
        credentials: 'include',
      });

      if (response.ok) {
        setCartItems(items => 
          items.map(item => 
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
        // Also update local store
        updateQuantity(productId, variantId, newQuantity);
      } else {
        throw new Error('Failed to update quantity');
      }
    } catch (error) {
      toast.error('Failed to update quantity');
      // Update local store as fallback
      updateQuantity(productId, variantId, newQuantity);
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: string, productId: string, variantId?: string | null) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setCartItems(items => items.filter(item => item.id !== itemId));
        // Also update local store
        removeItem(productId, variantId);
        toast.success('Item removed from cart');
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      toast.error('Failed to remove item');
      // Remove from local store as fallback
      removeItem(productId, variantId);
    }
  };

  const handleClearCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setCartItems([]);
        clearCart();
        toast.success('Cart cleared');
      } else {
        throw new Error('Failed to clear cart');
      }
    } catch (error) {
      toast.error('Failed to clear cart');
      clearCart();
    }
  };

  const addToWishlist = async (productId: string) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Added to wishlist');
      } else if (response.status === 401) {
        toast.error('Please sign in to manage your wishlist');
      } else {
        throw new Error('Failed to add to wishlist');
      }
    } catch (error) {
      toast.error('Failed to add to wishlist');
    }
  };

  if (loading) {
    return (
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
    );
  }

  if (cartItems.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground mb-6">
            Add some products to your cart to get started
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/products">
                Continue Shopping
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/categories">
                Browse Categories
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCart}
            disabled={cartItems.length === 0}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {cartItems.map((item) => {
          const itemPrice = item.variant?.price || item.product.price;
          const itemTotal = itemPrice * item.quantity;

          return (
            <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg">
              {/* Product Image */}
              <div className="w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                {item.product.images?.[0] && (
                  <Image
                    src={item.product.images[0].url}
                    alt={item.product.images[0].alt || item.product.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-medium hover:text-primary transition-colors line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    by {item.product.store.name}
                  </p>
                </div>

                {/* Variant Info */}
                {item.variant && (
                  <div className="flex flex-wrap gap-1">
                    {item.variant.options?.map((option, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {option.name}: {option.value}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{formatPrice(itemPrice)}</span>
                  {item.variant && item.variant.price !== item.product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(item.product.price)}
                    </span>
                  )}
                </div>

                {/* Mobile Actions */}
                <div className="flex sm:hidden items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addToWishlist(item.productId)}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Save for Later
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id, item.productId, item.variantId || undefined)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Quantity Controls & Actions */}
              <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.productId, item.variantId || undefined)}
                    disabled={item.quantity <= 1 || updating === item.id}
                    className="h-8 w-8 touch-target"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <Input
                    type="number"
                    min="1"
                    max={item.product.quantity}
                    value={item.quantity}
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value) || 1;
                      if (newQuantity !== item.quantity) {
                        handleUpdateQuantity(item.id, newQuantity, item.productId, item.variantId || undefined);
                      }
                    }}
                    className="w-16 text-center"
                    disabled={updating === item.id}
                  />
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.productId, item.variantId || undefined)}
                    disabled={item.quantity >= item.product.quantity || updating === item.id}
                    className="h-8 w-8 touch-target"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(itemTotal)}</p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(itemPrice)} each
                    </p>
                  )}
                </div>

                {/* Desktop Actions */}
                <div className="hidden sm:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addToWishlist(item.productId)}
                    className="text-xs"
                  >
                    <Heart className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.id, item.productId, item.variantId || undefined)}
                    className="text-destructive hover:text-destructive text-xs"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remove
                  </Button>
                </div>

                {/* Stock Warning */}
                {item.product.quantity < 5 && (
                  <p className="text-xs text-orange-600">
                    Only {item.product.quantity} left in stock
                  </p>
                )}
              </div>
            </div>
          );
        })}

        <Separator />

        {/* Continue Shopping */}
        <div className="flex justify-between items-center pt-4">
          <Button variant="outline" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}