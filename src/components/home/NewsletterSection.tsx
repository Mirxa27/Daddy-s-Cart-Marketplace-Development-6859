'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // TODO: Implement actual newsletter subscription API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubscribed(true);
      setEmail('');
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl p-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Thank You for Subscribing!
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                You're all set! We'll send you the latest deals and updates straight to your inbox.
              </p>
              <button
                onClick={() => setIsSubscribed(false)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Subscribe another email
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
            {/* Icon */}
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>

            {/* Header */}
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Stay in the Loop
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter and be the first to know about exclusive deals, 
              new arrivals, and special promotions. Join over 50,000 happy subscribers!
            </p>

            {/* Newsletter Form */}
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isSubmitting}
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-2 text-left">{error}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
            </form>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 text-xl">🎯</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Exclusive Deals</h3>
                <p className="text-sm text-gray-600">
                  Get access to subscriber-only discounts and flash sales
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 text-xl">📦</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">New Arrivals</h3>
                <p className="text-sm text-gray-600">
                  Be the first to discover the latest products and trends
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 text-xl">💡</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Expert Tips</h3>
                <p className="text-sm text-gray-600">
                  Receive buying guides and product recommendations
                </p>
              </div>
            </div>

            {/* Privacy Note */}
            <p className="text-xs text-gray-500 mt-8">
              We respect your privacy. Unsubscribe at any time. 
              <br className="hidden sm:block" />
              By subscribing, you agree to our{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}