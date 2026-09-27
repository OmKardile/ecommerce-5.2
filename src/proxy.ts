import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || 'patel_networks_secure_jwt_secret_key_32_bytes!';
const JWT_KEY = new TextEncoder().encode(JWT_SECRET_STRING);

/**
 * Middleware proxy (formerly named `middleware`) — runs before every matched
 * route. Implements three independent route guards:
 *
 *   1. /admin/*           — requires a valid `pn_admin_session` JWT whose
 *                            `role` claim is SUPER_ADMIN or STAFF.
 *                            SUPER_ADMIN: full access.
 *                            STAFF: access scoped to permissions (enforced
 *                            downstream by the layout + sidebar + page
 *                            components).
 *   2. /account/*         — requires a valid `pn_session` (customer) cookie.
 *   3. /stock/*           — requires a valid `pn_stock_session` (staff)
 *                            JWT with the `STOCK_VIEW` permission in its
 *                            `permissions` string array.
 *
 * The x-pathname header is set on every request so downstream server
 * components can read the original pathname via `headers().get('x-pathname')`.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  // 1. Admin Command Center Protection (ADR-019)
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      // If already authenticated as admin/staff, redirect to admin dashboard
      const adminToken = request.cookies.get('pn_admin_session')?.value;
      if (adminToken) {
        try {
          const { payload } = await jwtVerify(adminToken, JWT_KEY);
          const role = (payload as any)?.role;
          if (role === 'SUPER_ADMIN' || role === 'STAFF') {
            return NextResponse.redirect(new URL('/admin', request.url));
          }
        } catch {
          // Token invalid, continue to login page
        }
      }
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // Require a valid pn_admin_session JWT for all other /admin routes.
    const adminToken = request.cookies.get('pn_admin_session')?.value;
    if (!adminToken) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(adminToken, JWT_KEY);
      const role = (payload as any)?.role;
      // Only SUPER_ADMIN or STAFF may enter the operations console.
      if (role !== 'SUPER_ADMIN' && role !== 'STAFF') {
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Customer Account Portal Protection (ADR-003 / ADR-011)
  if (pathname.startsWith('/account') && pathname !== '/account/login') {
    const customerToken = request.cookies.get('pn_session')?.value;
    if (!customerToken) {
      return NextResponse.redirect(new URL('/account/login', request.url));
    }
    try {
      await jwtVerify(customerToken, JWT_KEY);
    } catch {
      return NextResponse.redirect(new URL('/account/login', request.url));
    }
  }

  // 3. Stock Monitor Employee Panel Protection (ADR-026)
  // Isolated `pn_stock_session` cookie — separate from admin + customer.
  // Stock-panel sessions always carry role: 'STAFF' + permissions: string[].
  if (pathname.startsWith('/stock') && pathname !== '/stock/login') {
    // Already-authenticated employees hitting /stock/login get redirected to
    // the dashboard so they don't see the login form again.
    const stockToken = request.cookies.get('pn_stock_session')?.value;
    if (!stockToken) {
      const loginUrl = new URL('/stock/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(stockToken, JWT_KEY);
      // Permissions live in the JWT payload as a string[] — gate entry on
      // STOCK_VIEW (string literal, no enum).
      const permissions = Array.isArray((payload as any)?.permissions)
        ? ((payload as any).permissions as unknown[])
        : [];
      if (!permissions.includes('STOCK_VIEW')) {
        return NextResponse.redirect(new URL('/stock/login', request.url));
      }
      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
      const loginUrl = new URL('/stock/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/stock/:path*'],
};
