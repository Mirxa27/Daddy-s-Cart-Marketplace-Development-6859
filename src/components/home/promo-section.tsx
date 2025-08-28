'use client';

import { motion } from 'framer-motion';
import { Truck, Shield, RefreshCw, Headphones } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over $50',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% protected transactions',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '30-day return policy',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Dedicated customer service',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
];

export function PromoSection() {
  return (
    <section className="py-12 sm:py-16">
      <div className="container-mobile mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div
                    className={`${feature.bgColor} ${feature.color} p-4 rounded-full transition-transform group-hover:scale-110`}
                  >
                    <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}