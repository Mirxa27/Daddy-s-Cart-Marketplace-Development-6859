'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/hooks/use-cart-store';
import toast from 'react-hot-toast';

// Mock data - will be replaced with actual API call
const mockProducts = [
  {
    id: '1',
    name: 'Wireless Headphones Pro',
    slug: 'wireless-headphones-pro',
    price: 199.99,
    compareAtPrice: 299.99,
    rating: 4.5,
    reviewCount: 128,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    category: 'Electronics',
  },
  {
    id: '2',
    name: 'Smart Watch Ultra',
    slug: 'smart-watch-ultra',
    price: 399.99,
    compareAtPrice: 499.99,
    rating: 4.8,
    reviewCount: 256,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    category: 'Electronics',
  },
  {
    id: '3',
    name: 'Premium Backpack',
    slug: 'premium-backpack',
    price: 89.99,
    compareAtPrice: 129.99,
    rating: 4.3,
    reviewCount: 89,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    category: 'Fashion',
  },
  {
    id: '4',
    name: 'Running Shoes Sport',
    slug: 'running-shoes-sport',
    price: 129.99,
    compareAtPrice: 179.99,
    rating: 4.6,
    reviewCount: 342,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    category: 'Sports',
  },
  {
    id: '5',
    name: 'Coffee Maker Deluxe',
    slug: 'coffee-maker-deluxe',
    price: 249.99,
    compareAtPrice: 349.99,
    rating: 4.7,
    reviewCount: 198,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop',
    category: 'Home',
  },
  {
    id: '6',
    name: 'Yoga Mat Premium',
    slug: 'yoga-mat-premium',
    price: 49.99,
    compareAtPrice: 79.99,
    rating: 4.4,
    reviewCount: 167,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop',
    category: 'Sports',
  },
  {
    id: '7',
    name: 'Desk Lamp Modern',
    slug: 'desk-lamp-modern',
    price: 79.99,
    compareAtPrice: 119.99,
    rating: 4.2,
    reviewCount: 93,
    image: 'https://images.unsplash.com/photo-1565636192335-6cfa2d5af695?w=400&h=400&fit=crop',
    category: 'Home',
  },
  {
    id: '8',
    name: 'Sunglasses Classic',
    slug: 'sunglasses-classic',
    price: 159.99,
    compareAtPrice: 199.99,
    rating: 4.5,
    reviewCount: 215,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
    category: 'Fashion',
  },
];

export function FeaturedProducts() {
  const [products, setProducts] = useState(mockProducts);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (product: typeof mockProducts[0]) => {
    addItem(product as any);
    toast.success(`${product.name} added to cart`);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
    toast.success(
      wishlist.includes(productId) ? 'Removed from wishlist' : 'Added to wishlist'
    );
  };

  const calculateDiscount = (price: number, compareAtPrice: number) => {
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  };

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
              <Card className="group h-full overflow-hidden">
                <div className="relative aspect-square">
                  <Link href={`/products/${product.slug}`}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>
                  
                  {/* Discount Badge */}
                  {product.compareAtPrice && (
                    <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 rounded-md text-xs font-medium">
                      -{calculateDiscount(product.price, product.compareAtPrice)}%
                    </div>
                  )}
                  
                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="p-2 bg-background/90 backdrop-blur rounded-full hover:bg-background transition-colors"
                      aria-label="Add to wishlist"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          wishlist.includes(product.id)
                            ? 'fill-destructive text-destructive'
                            : ''
                        }`}
                      />
                    </button>
                    <Link
                      href={`/products/${product.slug}`}
                      className="p-2 bg-background/90 backdrop-blur rounded-full hover:bg-background transition-colors"
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
                  
                  <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
                  
                  {/* Rating */}
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
                    className="w-full mt-3"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add to Cart
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