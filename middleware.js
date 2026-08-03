import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    // Session token check handles fallback redirect on server-side if not logged in
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard-bk/:path*'],
};
