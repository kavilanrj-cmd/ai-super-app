import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value || request.cookies.get('refresh_token')?.value;
  const { pathname } = request.nextUrl;

  const publicPaths = ['/login', '/register'];
  if (publicPaths.some((path) => pathname === path || pathname.startsWith(path + '/'))) {
    return NextResponse.next();
  }

  if (pathname !== '/' && !pathname.startsWith('/_next') && !pathname.startsWith('/static') && !pathname.startsWith('/api')) {
    if (!token && !pathname.startsWith('/login')) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
