export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import { HeroSection } from '@/components/home/hero-section';
import { FeaturedProducts } from '@/components/home/featured-products';
import { CategoryGrid } from '@/components/home/category-grid';
import { PromoSection } from '@/components/home/promo-section';
import { Newsletter } from '@/components/home/newsletter';
import { MainNav } from '@/components/layout/main-nav';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Home',
};

export default function HomePage() {
  return (
    <>
      <MainNav />
      <main className="flex min-h-screen flex-col">
        <HeroSection />
        <CategoryGrid />
        <FeaturedProducts />
        <PromoSection />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}