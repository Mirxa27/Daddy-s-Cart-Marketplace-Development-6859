'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Smartphone, 
  ShirtIcon as Shirt, 
  Home, 
  Dumbbell, 
  BookOpen, 
  Camera,
  Gamepad2,
  Car
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: React.ComponentType<any>;
  image: string;
  productCount: number;
  color: string;
}

const categories: Category[] = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest gadgets and tech',
    icon: Smartphone,
    image: '/images/categories/electronics.jpg',
    productCount: 2450,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: '2',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Trendy clothing & accessories',
    icon: Shirt,
    image: '/images/categories/fashion.jpg',
    productCount: 3200,
    color: 'bg-pink-100 text-pink-600',
  },
  {
    id: '3',
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Everything for your home',
    icon: Home,
    image: '/images/categories/home.jpg',
    productCount: 1800,
    color: 'bg-green-100 text-green-600',
  },
  {
    id: '4',
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    description: 'Stay active and healthy',
    icon: Dumbbell,
    image: '/images/categories/sports.jpg',
    productCount: 950,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    id: '5',
    name: 'Books & Media',
    slug: 'books-media',
    description: 'Knowledge and entertainment',
    icon: BookOpen,
    image: '/images/categories/books.jpg',
    productCount: 1200,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: '6',
    name: 'Photography',
    slug: 'photography',
    description: 'Cameras and equipment',
    icon: Camera,
    image: '/images/categories/photography.jpg',
    productCount: 650,
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    id: '7',
    name: 'Gaming',
    slug: 'gaming',
    description: 'Games and consoles',
    icon: Gamepad2,
    image: '/images/categories/gaming.jpg',
    productCount: 850,
    color: 'bg-red-100 text-red-600',
  },
  {
    id: '8',
    name: 'Automotive',
    slug: 'automotive',
    description: 'Car parts and accessories',
    icon: Car,
    image: '/images/categories/automotive.jpg',
    productCount: 750,
    color: 'bg-gray-100 text-gray-600',
  },
];

export function CategoryGrid() {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "data:image/svg+xml,%3Csvg width='300' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-size='16' font-family='Arial, sans-serif'%3ECategory Image%3C/text%3E%3C/svg%3E";
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our wide range of categories and find exactly what you're looking for
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200"
            >
              {/* Category Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
                
                {/* Icon */}
                <div className={`absolute top-4 left-4 w-12 h-12 rounded-lg ${category.color} flex items-center justify-center shadow-lg`}>
                  <category.icon className="w-6 h-6" />
                </div>
              </div>

              {/* Category Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    {category.productCount.toLocaleString()} products
                  </span>
                  <span className="text-blue-600 text-sm font-medium group-hover:underline">
                    Shop now →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-12">
          <Link
            href="/categories"
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            View All Categories
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}