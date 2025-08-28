'use client';

import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  sales: number;
  rating: number;
  images: Array<{ url: string }>;
}

interface TopProductsProps {
  products: Product[];
}

export function TopProducts({ products }: TopProductsProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No products yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product, index) => (
        <div key={product.id} className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 relative rounded-md overflow-hidden bg-muted">
            {product.images[0] ? (
              <Image
                src={product.images[0].url}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                #{index + 1}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{product.name}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{product.sales} sold</span>
              <span>•</span>
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
          
          <div className="text-sm font-medium">
            {formatPrice(product.price)}
          </div>
        </div>
      ))}
    </div>
  );
}