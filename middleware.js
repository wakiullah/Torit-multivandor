import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get('token')?.value;

    const publicPaths = ['/auth/login', '/auth/signup'];
    const isAdminRoute = pathname.startsWith('/admin');
    const isVendorRoute = pathname.startsWith('/store');
    const isUserRoute = pathname.startsWith('/profile') || pathname.startsWith('/orders');

    const protectedRoutes = [
        '/admin',
        '/store',
        '/profile',
        '/orders',
        '/create-store',
    ];

    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (!token && isProtectedRoute) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    if (token) {
        try {
            const { payload } = await jwtVerify(token, secret);
            const role = payload.role;

            if (publicPaths.includes(pathname)) {
                return NextResponse.redirect(new URL('/', req.url));
            }

            if (isAdminRoute && role !== 'admin') {
                return NextResponse.redirect(new URL('/', req.url));
            }

            if (isVendorRoute && role !== 'vendor') {
                return NextResponse.redirect(new URL('/', req.url));
            }

            // You can add more role-based checks here if needed

        } catch (err) {
            // Token is invalid or expired
            const response = NextResponse.redirect(new URL('/auth/login', req.url));
            response.cookies.delete('token');
            return response;
        }
    }

    // Add security headers
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-XSS-Protection', '1; mode=block');

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
