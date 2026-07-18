import { NextRequest, NextResponse } from 'next/server';
import { hasValidSessionCookie } from '@/lib/supabase-server';

/**
 * Edge middleware — runs before every matched request.
 *
 * Strategy:
 *  - Page routes   → pass through; AuthGuard handles client-side protection.
 *  - API routes    → reject with 401 immediately if no valid session cookie.
 *    Individual handlers also call getRouteUser() for full JWT verification.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  if (!hasValidSessionCookie(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
