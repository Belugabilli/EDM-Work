import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'vit_auth_token';

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'vit_bhopal_super_secure_auth_secret_key_2026_dev_prod'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';

  // Enforce custom domain: redirect any *.vercel.app access to the primary custom domain
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (nextAuthUrl && host.endsWith('.vercel.app')) {
    try {
      const customHost = new URL(nextAuthUrl).host;
      if (customHost && host !== customHost) {
        const targetUrl = new URL(request.url);
        targetUrl.host = customHost;
        targetUrl.protocol = 'https:';
        return NextResponse.redirect(targetUrl, 308);
      }
    } catch {}
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  let sessionUser: any = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      sessionUser = payload;
    } catch {
      sessionUser = null;
    }
  }

  const isStudentRoute = pathname.startsWith('/student');
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginRoute = pathname === '/login';

  // 1. Protected Student Routes
  if (isStudentRoute) {
    if (!sessionUser) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If an Admin tries to access student portal, route them to Admin Portal
    if (sessionUser.role === 'ADMIN' || sessionUser.role === 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // 2. Protected Admin Routes
  if (isAdminRoute) {
    if (!sessionUser) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If a Student manually tries to enter /admin/*, forbid access and redirect to Student Dashboard
    if (sessionUser.role !== 'ADMIN' && sessionUser.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(
        new URL('/student/dashboard?error=forbidden_admin_access', request.url)
      );
    }
  }

  // 3. Login page redirection if already authenticated
  if (isLoginRoute && sessionUser) {
    const dest =
      sessionUser.role === 'ADMIN' || sessionUser.role === 'SUPER_ADMIN'
        ? '/admin/dashboard'
        : '/student/dashboard';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/student/:path*', '/admin/:path*', '/login'],
};
