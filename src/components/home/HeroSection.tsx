'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Star, Users } from 'lucide-react';

export function HeroSection() {
  const stats = [
    { icon: Users, label: 'Happy Customers', value: '50K+' },
    { icon: ShoppingBag, label: 'Products', value: '10K+' },
    { icon: Star, label: 'Average Rating', value: '4.8' },
  ];

  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Your One-Stop{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Marketplace
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl">
              Discover amazing products from trusted sellers at unbeatable prices. 
              Shop with confidence and enjoy fast, secure delivery to your doorstep.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Start Shopping
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              
              <Link
                href="/seller/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
              >
                Become a Seller
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mb-3">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="/images/hero-shopping.jpg"
                alt="Shopping Experience"
                className="w-full h-auto rounded-2xl shadow-2xl"
                onError={(e) => {
                  e.currentTarget.src = "data:image/svg+xml,%3Csvg width='600' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-size='24' font-family='Arial, sans-serif'%3EHero Shopping Image%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-4 -left-4 bg-white p-4 rounded-lg shadow-lg border hidden lg:block">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-green-600 fill-current" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">4.8/5</div>
                  <div className="text-sm text-gray-600">Customer Rating</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-lg shadow-lg border hidden lg:block">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Free Shipping</div>
                  <div className="text-sm text-gray-600">Orders over $75</div>
                </div>
              </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute -z-10 top-10 right-10 w-20 h-20 bg-purple-200 rounded-full opacity-60"></div>
            <div className="absolute -z-10 bottom-10 left-10 w-16 h-16 bg-blue-200 rounded-full opacity-60"></div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-white border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <p className="text-gray-600 text-sm font-medium">Trusted by leading brands worldwide</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60">
            {/* Placeholder for brand logos */}
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="flex justify-center">
                <div className="w-24 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-500 text-xs">Brand {item}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}