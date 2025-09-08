'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Eye, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { useCartStore } from '@/hooks/use-cart-store';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  images: Array<{ url: string; alt?: string }>;
  category: { name: string; slug: string };
  store: { name: string; slug: string };
  quantity: number;
  status: string;
}

interface FeaturedProductsProps {
  products?: Product[];
  limit?: number;
}

export function FeaturedProducts({ products: initialProducts, limit = 8 }: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(!initialProducts);
  const [error, setError] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (!initialProducts) {
      fetchFeaturedProducts();
    }
    fetchWishlist();
  }, [initialProducts]);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/products?limit=${limit}&featured=true&sortBy=sales&sortOrder=desc`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setError('Failed to load featured products');
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await fetch('/api/wishlist', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setWishlist(data.items?.map((item: any) => item.productId) || []);
      }
    } catch (error) {
      // User might not be logged in, ignore error
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      if (product.quantity <= 0 || product.status !== 'PUBLISHED') {
        toast.error('Product is out of stock');
        return;
      }

      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        slug: product.slug,
      });
    } catch (error) {
      toast.error('Failed to add item to cart');
    }
  };

  const toggleWishlist = async (productId: string) => {
    try {
      const isInWishlist = wishlist.includes(productId);
      const method = isInWishlist ? 'DELETE' : 'POST';
      const url = isInWishlist 
        ? `/api/wishlist?productId=${productId}` 
        : '/api/wishlist';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method === 'POST' ? JSON.stringify({ productId }) : undefined,
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please sign in to manage your wishlist');
          return;
        }
        throw new Error('Failed to update wishlist');
      }

      setWishlist(prev =>
        isInWishlist
          ? prev.filter(id => id !== productId)
          : [...prev, productId]
      );

      toast.success(
        isInWishlist ? 'Removed from wishlist' : 'Added to wishlist'
      );
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container-mobile mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Loading our best products...</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="h-full overflow-hidden">
                <div className="aspect-square bg-muted animate-pulse" />
                <CardContent className="p-3 sm:p-4 space-y-3">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  <div className="h-6 bg-muted animate-pulse rounded w-1/3" />
                  <div className="h-8 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container-mobile mx-auto">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Unable to load products</h3>
            <p className="text-muted-foreground mb-4 text-center">{error}</p>
            <Button onClick={fetchFeaturedProducts} variant="outline">
              <Loader2 className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container-mobile mx-auto">
          <div className="flex flex-col items-center justify-center py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products available</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Check back later for our featured products
            </p>
            <Button asChild variant="outline">
              <Link href="/products">Browse All Products</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-muted/30">
      <div className="container-mobile mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Featured Products</h2>
            <p className="text-muted-foreground">Handpicked items just for you</p>
          </div>
          <Button variant="outline" asChild className="mt-4 sm:mt-0">
            <Link href="/products">View All Products</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="group h-full overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-square">
                  <Link href={`/products/${product.slug}`}>
                    <Image
                      src={product.images?.[0]?.url || '/placeholder-product.jpg'}
                      alt={product.images?.[0]?.alt || product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </Link>
                  
                  {/* Discount Badge */}
                  {product.compareAtPrice && (
                    <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 rounded-md text-xs font-medium">
                      -{calculateDiscount(product.price, product.compareAtPrice)}%
                    </div>
                  )}
                  
                  {/* Stock Status */}
                  {product.quantity <= 0 && (
                    <div className="absolute top-2 right-2 bg-background/90 text-muted-foreground px-2 py-1 rounded-md text-xs font-medium">
                      Out of Stock
                    </div>
                  )}
                  
                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="p-2 bg-background/90 backdrop-blur rounded-full hover:bg-background transition-colors touch-target"
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          wishlist.includes(product.id)
                            ? 'fill-red-500 text-red-500'
                            : ''
                        }`}
                      />
                    </button>
                    <Link
                      href={`/products/${product.slug}`}
                      className="p-2 bg-background/90 backdrop-blur rounded-full hover:bg-background transition-colors touch-target"
                      aria-label="Quick view"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
                
                <CardContent className="p-3 sm:p-4">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-medium text-sm sm:text-base line-clamp-2 hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">{product.category.name}</p>
                    <p className="text-xs text-muted-foreground">by {product.store.name}</p>
                  </div>
                  
                  {/* Rating */}
                  {product.rating > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(product.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({product.reviewCount})
                      </span>
                    </div>
                  )}
                  
                  {/* Price */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-base sm:text-lg font-bold">
                      {formatPrice(product.price)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-xs sm:text-sm text-muted-foreground line-through">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </div>
                  
                  {/* Add to Cart Button */}
                  <Button
                    size="sm"
                    className="w-full mt-3 touch-target"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.quantity <= 0 || product.status !== 'PUBLISHED'}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    {product.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}