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

  // Maintenance mode check
  if (pathname !== '/admin' && !pathname.startsWith('/api/')) {
    try {
      const maintenanceMode = await prisma?.setting.findUnique({
        where: { key: 'maintenance_mode' },
      });
      
      if (maintenanceMode && JSON.parse(maintenanceMode.value as string) === true) {
        const token = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET,
        });
        
        // Allow admins to access during maintenance
        if (!token || !['ADMIN', 'SUPER_ADMIN'].includes(token.role as string)) {
          return new NextResponse(
            `<!DOCTYPE html>
            <html>
            <head>
              <title>Maintenance Mode</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body { font-family: system-ui; text-align: center; padding: 50px; background: #f5f5f5; }
                .container { max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                h1 { color: #333; margin-bottom: 20px; }
                p { color: #666; line-height: 1.6; }
                .logo { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 30px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="logo">Daddy's Cart</div>
                <h1>We'll be back soon!</h1>
                <p>We're currently performing scheduled maintenance to improve your shopping experience.</p>
                <p>Please check back in a few minutes.</p>
              </div>
            </body>
            </html>`,
            {
              status: 503,
              headers: {
                'Content-Type': 'text/html',
                'Retry-After': '3600', // 1 hour
              },
            }
          );
        }
      }
    } catch (error) {
      // If we can't check maintenance mode, continue normally
    }
  }

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