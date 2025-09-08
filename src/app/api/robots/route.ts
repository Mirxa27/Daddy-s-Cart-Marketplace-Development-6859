import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://marketplace.vercel.app';
  
  const robots = `User-agent: *
Allow: /

# Disallow admin and auth pages
Disallow: /admin/
Disallow: /auth/
Disallow: /api/
Disallow: /checkout/
Disallow: /account/

# Allow specific pages
Allow: /auth/signin
Allow: /auth/signup

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay
Crawl-delay: 1

# Cache
# Cache-Control: public, max-age=86400`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}