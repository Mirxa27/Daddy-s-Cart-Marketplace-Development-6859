import { Metadata } from 'next';
import { MainNav } from '@/components/navigation/MainNav';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';

export const metadata: Metadata = {
  title: "Daddy's Cart - Your One-Stop Marketplace",
  description: 'Discover amazing products from trusted sellers at unbeatable prices. Shop electronics, clothing, home goods, and more.',
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      
      <main className="flex-1">
        <HeroSection />
        <CategoryGrid />
        <FeaturedProducts />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
      
      <Footer />
    </div>
  );
}