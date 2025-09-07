'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Eye, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { useCartStore } from '@/hooks/use-cart-store';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    rating?: number;
    reviewCount?: number;
    image?: string;
    images?: Array<{ url: string; alt?: string }>;
    category?: { name: string; slug: string };
    brand?: { name: string; slug: string };
    store?: { name: string; slug: string; rating?: number };
    inStock?: boolean;
    quantity?: number;
  };
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
  showQuickActions?: boolean;
  showStoreInfo?: boolean;
}

export function ProductCard({
  product,
  variant = 'default',
  className,
  showQuickActions = true,
  showStoreInfo = false,
}: ProductCardProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!product.inStock && product.quantity === 0) {
      toast.error('Product is out of stock');
      return;
    }
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      slug: product.slug,
    });
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const method = isInWishlist ? 'DELETE' : 'POST';
      const response = await fetch('/api/wishlist', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method === 'POST' ? JSON.stringify({ productId: product.id }) : undefined,
      });
      
      if (response.ok) {
        setIsInWishlist(!isInWishlist);
        toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
      } else {
        toast.error('Please sign in to manage your wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name}`,
          url: `/products/${product.slug}`,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(
        `${window.location.origin}/products/${product.slug}`
      );
      toast.success('Product link copied to clipboard');
    }
  };

  const imageUrl = product.image || product.images?.[0]?.url || '/placeholder-product.jpg';
  const discountPercentage = product.compareAtPrice 
    ? calculateDiscount(product.price, product.compareAtPrice)
    : 0;

  const cardClasses = cn(
    'group relative overflow-hidden transition-all duration-300 hover:shadow-lg',
    variant === 'compact' && 'h-full',
    variant === 'featured' && 'border-2 border-primary/20',
    className
  );

  const imageHeight = variant === 'compact' ? 'aspect-[4/3]' : 'aspect-square';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cardClasses}>
        <Link href={`/products/${product.slug}`}>
          {/* Image Container */}
          <div className={cn('relative overflow-hidden', imageHeight)}>
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className={cn(
                'object-cover transition-all duration-500 group-hover:scale-110',
                imageLoading && 'blur-sm'
              )}
              onLoad={() => setImageLoading(false)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            
            {/* Loading Skeleton */}
            {imageLoading && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            
            {/* Discount Badge */}
            {discountPercentage > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute top-2 left-2 z-10 text-xs font-bold"
              >
                -{discountPercentage}%
              </Badge>
            )}
            
            {/* Stock Status */}
            {!product.inStock || product.quantity === 0 ? (
              <Badge 
                variant="secondary" 
                className="absolute top-2 right-2 z-10 bg-background/90 text-muted-foreground"
              >
                Out of Stock
              </Badge>
            ) : product.quantity && product.quantity < 5 ? (
              <Badge 
                variant="outline" 
                className="absolute top-2 right-2 z-10 bg-background/90 text-orange-600 border-orange-600"
              >
                Only {product.quantity} left
              </Badge>
            ) : null}
            
            {/* Quick Actions */}
            {showQuickActions && (
              <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 bg-background/90 backdrop-blur hover:bg-background"
                  onClick={handleToggleWishlist}
                  aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart
                    className={cn(
                      'h-4 w-4',
                      isInWishlist && 'fill-red-500 text-red-500'
                    )}
                  />
                </Button>
                
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 bg-background/90 backdrop-blur hover:bg-background"
                  onClick={handleShare}
                  aria-label="Share product"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </Link>
        
        {/* Content */}
        <CardContent className={cn(
          'p-3',
          variant === 'compact' ? 'sm:p-3' : 'sm:p-4'
        )}>
          <Link href={`/products/${product.slug}`}>
            {/* Category & Brand */}
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              {product.category && (
                <span className="truncate">{product.category.name}</span>
              )}
              {product.brand && (
                <span className="truncate ml-2">{product.brand.name}</span>
              )}
            </div>
            
            {/* Title */}
            <h3 className={cn(
              'font-medium line-clamp-2 hover:text-primary transition-colors mb-2',
              variant === 'compact' ? 'text-sm' : 'text-sm sm:text-base'
            )}>
              {product.name}
            </h3>
            
            {/* Store Info */}
            {showStoreInfo && product.store && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <span>by {product.store.name}</span>
                {product.store.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{product.store.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Rating */}
            {product.rating && product.reviewCount && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-3 w-3',
                        i < Math.floor(product.rating!)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  ({product.reviewCount})
                </span>
              </div>
            )}
            
            {/* Price */}
            <div className="flex items-center gap-2 mb-3">
              <span className={cn(
                'font-bold',
                variant === 'compact' ? 'text-base' : 'text-base sm:text-lg'
              )}>
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
          </Link>
          
          {/* Add to Cart Button */}
          <Button
            size={variant === 'compact' ? 'sm' : 'default'}
            className="w-full touch-target"
            onClick={handleAddToCart}
            disabled={!product.inStock || product.quantity === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {!product.inStock || product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}