'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Laptop, 
  Shirt, 
  Home, 
  Dumbbell, 
  BookOpen, 
  Gamepad2,
  Heart,
  ShoppingBag
} from 'lucide-react';

const categories = [
  {
    id: 1,
    name: 'Electronics',
    slug: 'electronics',
    icon: Laptop,
    color: 'bg-blue-500',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop',
  },
  {
    id: 2,
    name: 'Fashion',
    slug: 'clothing',
    icon: Shirt,
    color: 'bg-pink-500',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop',
  },
  {
    id: 3,
    name: 'Home & Garden',
    slug: 'home-garden',
    icon: Home,
    color: 'bg-green-500',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop',
  },
  {
    id: 4,
    name: 'Sports',
    slug: 'sports-outdoors',
    icon: Dumbbell,
    color: 'bg-orange-500',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop',
  },
  {
    id: 5,
    name: 'Books',
    slug: 'books',
    icon: BookOpen,
    color: 'bg-purple-500',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  },
  {
    id: 6,
    name: 'Toys & Games',
    slug: 'toys-games',
    icon: Gamepad2,
    color: 'bg-red-500',
    image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=400&fit=crop',
  },
  {
    id: 7,
    name: 'Beauty',
    slug: 'health-beauty',
    icon: Heart,
    color: 'bg-rose-500',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
  },
  {
    id: 8,
    name: 'More',
    slug: 'categories',
    icon: ShoppingBag,
    color: 'bg-indigo-500',
    image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=400&fit=crop',
  },
];

export function CategoryGrid() {
  return (
    <section className="py-12 sm:py-16">
      <div className="container-mobile mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Shop by Category</h2>
          <p className="text-muted-foreground">Find exactly what you're looking for</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  href={`/categories/${category.slug}`}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-lg aspect-square">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Icon and Text Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <div className={`${category.color} p-3 rounded-full mb-2 bg-opacity-90 transition-transform group-hover:scale-110`}>
                        <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold">{category.name}</h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}