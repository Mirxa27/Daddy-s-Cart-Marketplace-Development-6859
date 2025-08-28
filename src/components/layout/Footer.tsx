'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  CreditCard,
  Shield,
  Truck,
  RotateCcw
} from 'lucide-react';

const footerLinks = {
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Our Story', href: '/story' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Blog', href: '/blog' },
  ],
  customer: [
    { label: 'Customer Service', href: '/support' },
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Returns', href: '/returns' },
    { label: 'Shipping Info', href: '/shipping' },
  ],
  seller: [
    { label: 'Sell on Daddy\'s Cart', href: '/seller/register' },
    { label: 'Seller Hub', href: '/seller/dashboard' },
    { label: 'Seller Policies', href: '/seller/policies' },
    { label: 'Fee Structure', href: '/seller/fees' },
    { label: 'Performance', href: '/seller/performance' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Accessibility', href: '/accessibility' },
    { label: 'Sitemap', href: '/sitemap.xml' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com/daddyscart', label: 'Facebook' },
  { icon: Twitter, href: 'https://twitter.com/daddyscart', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com/daddyscart', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com/daddyscart', label: 'YouTube' },
];

const trustBadges = [
  { icon: Shield, text: 'Secure Shopping' },
  { icon: Truck, text: 'Fast Delivery' },
  { icon: RotateCcw, text: 'Easy Returns' },
  { icon: CreditCard, text: 'Safe Payments' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Trust Badges */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center justify-center space-x-3">
                <badge.icon className="w-8 h-8 text-blue-400" />
                <span className="text-sm font-medium">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 text-2xl font-bold mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white text-sm font-bold">
                DC
              </div>
              <span>Daddy's Cart</span>
            </Link>
            
            <p className="text-gray-300 mb-6 max-w-md">
              Your trusted marketplace for quality products from verified sellers. 
              Discover amazing deals and shop with confidence.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">123 Commerce St, Business District, NY 10001</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">support@daddyscart.com</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Care</h3>
            <ul className="space-y-2">
              {footerLinks.customer.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">For Sellers</h3>
            <ul className="space-y-2">
              {footerLinks.seller.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-gray-300 mb-4">
              Subscribe to get special offers, updates, and promotions.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-lg transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 text-sm mb-4 md:mb-0">
              © {currentYear} Daddy's Cart. All rights reserved.
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-end space-x-4">
              {footerLinks.legal.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-gray-300 hover:text-white text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">We accept</p>
              <div className="flex justify-center space-x-4">
                {['Visa', 'Mastercard', 'PayPal', 'Apple Pay', 'Google Pay'].map((method) => (
                  <div
                    key={method}
                    className="w-12 h-8 bg-white rounded flex items-center justify-center"
                  >
                    <span className="text-xs text-gray-600 font-medium">
                      {method.slice(0, 4)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}