'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  comment: string;
  product?: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Verified Buyer',
    avatar: '/images/avatars/sarah.jpg',
    rating: 5,
    comment: "Amazing experience! The product quality exceeded my expectations and the delivery was super fast. I'll definitely be shopping here again.",
    product: 'Premium Wireless Headphones',
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Regular Customer',
    avatar: '/images/avatars/michael.jpg',
    rating: 5,
    comment: "Great marketplace with authentic products. The customer service is outstanding and they always resolve any issues quickly.",
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Verified Buyer',
    avatar: '/images/avatars/emily.jpg',
    rating: 4,
    comment: "Love the variety of products available. Found exactly what I was looking for at a great price. Highly recommended!",
    product: 'Smart Fitness Watch',
  },
  {
    id: '4',
    name: 'David Thompson',
    role: 'Premium Member',
    avatar: '/images/avatars/david.jpg',
    rating: 5,
    comment: "As a seller, I appreciate the professional platform and the support provided. It's helped me grow my business significantly.",
  },
  {
    id: '5',
    name: 'Lisa Park',
    role: 'Verified Buyer',
    avatar: '/images/avatars/lisa.jpg',
    rating: 5,
    comment: "Secure payment, fast shipping, and excellent product quality. This has become my go-to marketplace for all my shopping needs.",
  },
  {
    id: '6',
    name: 'James Wilson',
    role: 'Repeat Customer',
    avatar: '/images/avatars/james.jpg',
    rating: 4,
    comment: "User-friendly interface and great deals. The mobile app makes shopping on the go super convenient.",
  },
];

export function TestimonialsSection() {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='30' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236b7280' font-size='20' font-family='Arial, sans-serif'%3E👤%3C/text%3E%3C/svg%3E";
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what real customers have to say about their shopping experience.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border border-gray-100"
            >
              {/* Quote Icon */}
              <div className="mb-4">
                <Quote className="w-8 h-8 text-blue-600 opacity-20" />
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4">
                {renderStars(testimonial.rating)}
              </div>

              {/* Comment */}
              <p className="text-gray-700 mb-6 line-clamp-4">
                "{testimonial.comment}"
              </p>

              {/* Product Reference */}
              {testimonial.product && (
                <div className="mb-4">
                  <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {testimonial.product}
                  </span>
                </div>
              )}

              {/* Customer Info */}
              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                  onError={handleImageError}
                />
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">4.8</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">99%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Customer Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}