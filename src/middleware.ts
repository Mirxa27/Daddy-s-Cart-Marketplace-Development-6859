import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Rate limiting store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMITS = {
  '/api/auth/register': { requests: 5, window: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  '/api/auth/forgot-password': { requests: 3, window: 15 * 60 * 1000 }, // 3 requests per 15 minutes
  '/api/newsletter/subscribe': { requests: 10, window: 60 * 60 * 1000 }, // 10 requests per hour
  '/api/upload': { requests: 50, window: 60 * 60 * 1000 }, // 50 uploads per hour
  default: { requests: 100, window: 15 * 60 * 1000 }, // Default: 100 requests per 15 minutes
};

function getRateLimit(pathname: string) {
  for (const [path, limit] of Object.entries(RATE_LIMITS)) {
    if (path !== 'default' && pathname.startsWith(path)) {
      return limit;
    }
  }
  return RATE_LIMITS.default;
}

function checkRateLimit(identifier: string, pathname: string): boolean {
  const now = Date.now();
  const limit = getRateLimit(pathname);
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + limit.window,
    });
    return true;
  }

  if (record.count >= limit.requests) {
    return false;
  }

  record.count++;
  return true;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip || 'unknown';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Security headers
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const clientIP = getClientIP(request);
    const identifier = `${clientIP}-${pathname}`;

    if (!checkRateLimit(identifier, pathname)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '900', // 15 minutes
          },
        }
      );
    }

    // Add rate limit headers
    const limit = getRateLimit(pathname);
    const record = rateLimitMap.get(identifier);
    
    if (record) {
      response.headers.set('X-RateLimit-Limit', limit.requests.toString());
      response.headers.set('X-RateLimit-Remaining', (limit.requests - record.count).toString());
      response.headers.set('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
    }
  }

  // Authentication checks for protected routes
  if (pathname.startsWith('/admin')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL('/auth/signin', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check admin access
    if (!['ADMIN', 'SUPER_ADMIN', 'VENDOR'].includes(token.role as string)) {
      const homeUrl = new URL('/', request.url);
      homeUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(homeUrl);
    }

    // Vendor access restrictions
    if (token.role === 'VENDOR') {
      const restrictedPaths = [
        '/admin/customers',
        '/admin/vendors',
        '/admin/settings',
        '/admin/reports',
      ];
      
      if (restrictedPaths.some(path => pathname.startsWith(path))) {
        const dashboardUrl = new URL('/admin', request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    }
  }

  // Skip maintenance mode check during build or if no database
  // This will be handled at the application level instead

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};