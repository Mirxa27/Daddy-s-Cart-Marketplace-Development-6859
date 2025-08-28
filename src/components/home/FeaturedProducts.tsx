'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { formatPrice } from '@/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  comparePrice?: string;
  rating: number;
  reviewCount: number;
  images: string[];
  category: string;
  brand: string;
  isNew?: boolean;
  isSale?: boolean;
  discount?: number;
}

// Mock featured products data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    slug: 'premium-wireless-headphones',
    price: '299.99',
    comparePrice: '399.99',
    rating: 4.8,
    reviewCount: 245,
    images: ['/images/products/headphones-1.jpg'],
    category: 'Electronics',
    brand: 'TechSound',
    isSale: true,
    discount: 25,
  },
  {
    id: '2',
    name: 'Smart Fitness Watch',
    slug: 'smart-fitness-watch',
    price: '199.99',
    rating: 4.6,
    reviewCount: 189,
    images: ['/images/products/watch-1.jpg'],
    category: 'Electronics',
    brand: 'FitTech',
    isNew: true,
  },
  {
    id: '3',
    name: 'Ergonomic Office Chair',
    slug: 'ergonomic-office-chair',
    price: '449.99',
    comparePrice: '599.99',
    rating: 4.9,
    reviewCount: 156,
    images: ['/images/products/chair-1.jpg'],
    category: 'Furniture',
    brand: 'ComfortPlus',
    isSale: true,
    discount: 25,
  },
  {
    id: '4',
    name: 'Professional Camera Lens',
    slug: 'professional-camera-lens',
    price: '899.99',
    rating: 4.7,
    reviewCount: 89,
    images: ['/images/products/lens-1.jpg'],
    category: 'Photography',
    brand: 'PhotoPro',
  },
  {
    id: '5',
    name: 'Designer Running Shoes',
    slug: 'designer-running-shoes',
    price: '129.99',
    comparePrice: '179.99',
    rating: 4.5,
    reviewCount: 324,
    images: ['/images/products/shoes-1.jpg'],
    category: 'Fashion',
    brand: 'SportStyle',
    isSale: true,
    discount: 28,
  },
  {
    id: '6',
    name: 'Smart Home Hub',
    slug: 'smart-home-hub',
    price: '149.99',
    rating: 4.4,
    reviewCount: 278,
    images: ['/images/products/hub-1.jpg'],
    category: 'Electronics',
    brand: 'HomeTech',
    isNew: true,
  },
];

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Simulate API call
    const fetchProducts = async () => {
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProducts(mockProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const toggleWishlist = (productId: string) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
  };

  const addToCart = (productId: string) => {
    // TODO: Implement add to cart functionality
    console.log('Adding product to cart:', productId);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-size='16' font-family='Arial, sans-serif'%3EProduct Image%3C/text%3E%3C/svg%3E";
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : index < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-t-xl"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of the best products from top brands
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200 group"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden rounded-t-xl">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={handleImageError}
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isNew && (
                    <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                      NEW
                    </span>
                  )}
                  {product.isSale && product.discount && (
                    <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                      -{product.discount}%
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      wishlist.has(product.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-red-500 hover:text-white'
                    }`}
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                  <Link
                    href={`/products/${product.slug}`}
                    className="w-10 h-10 bg-white text-gray-600 hover:bg-blue-500 hover:text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                </div>

                {/* Quick Add to Cart */}
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => addToCart(product.id)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="text-sm text-gray-500 mb-2">
                  {product.brand} • {product.category}
                </div>
                
                <Link
                  href={`/products/${product.slug}`}
                  className="block hover:text-blue-600 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviewCount})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(parseFloat(product.price))}
                  </span>
                  {product.comparePrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(parseFloat(product.comparePrice))}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            View All Products
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}