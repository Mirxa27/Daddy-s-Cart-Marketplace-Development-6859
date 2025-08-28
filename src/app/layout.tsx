import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Daddy's Cart - Your One-Stop Marketplace",
  description: 'Discover amazing products from trusted sellers at unbeatable prices.',
  keywords: 'marketplace, ecommerce, shopping, online store, products',
  authors: [{ name: "Daddy's Cart Team" }],
  openGraph: {
    title: "Daddy's Cart",
    description: 'Your one-stop marketplace for everything',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Daddy's Cart",
    description: 'Your one-stop marketplace for everything',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn('scroll-smooth', inter.className)}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div id="root" className="relative flex min-h-screen flex-col">
          {children}
        </div>
        <div id="modal-root" />
        <div id="toast-root" />
      </body>
    </html>
  );
}