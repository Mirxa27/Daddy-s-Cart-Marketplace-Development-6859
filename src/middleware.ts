import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route requires authentication
  const protectedRoutes = ['/admin', '/profile', '/orders', '/seller'];
  const adminRoutes = ['/admin'];
  const sellerRoutes = ['/seller'];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isSellerRoute = sellerRoutes.some(route => pathname.startsWith(route));

  // Skip authentication for public routes
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get auth token from cookies
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // Redirect to login if no token
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify token
    const payload = verifyToken(token);

    // Check admin access
    if (isAdminRoute && !['SUPER_ADMIN', 'ADMIN'].includes(payload.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Check seller access
    if (isSellerRoute && !['SUPER_ADMIN', 'ADMIN', 'SELLER'].includes(payload.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid token, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    
    const response = NextResponse.redirect(loginUrl);
    // Clear invalid token
    response.cookies.delete('auth-token');
    
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};