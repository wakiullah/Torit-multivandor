import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  const publicPaths = ["/auth/login", "/auth/signup"];
  const isAdminRoute = pathname.startsWith("/admin");
  const isVendorRoute =
    pathname.startsWith("/store") ||
    pathname.startsWith("/api/store") ||
    pathname.startsWith("/api/products");
  const isUserRoute =
    pathname.startsWith("/profile") || pathname.startsWith("/orders");
  const isOrderApiRoute =
    pathname.startsWith("/api/order/place") ||
    pathname.startsWith("/api/order/userorders");
  const protectedRoutes = [
    "/admin",
    "/store",
    "/profile",
    "/orders",
    "/create-store",
    "/api/store",
    "/api/products",
    "/api/order/place",
    "/api/order/userorders",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!token && isProtectedRoute) {
    console.log(
      `[Middleware Debug] No token and protected route: ${pathname}. Redirecting to /auth/login`
    );

    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);

      console.log(
        `[Middleware Debug] Token verified. User role: ${payload.role}, pathname: ${pathname}`
      );

      const role = payload.role;

      if (publicPaths.includes(pathname)) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      if (isAdminRoute && role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }

      if (isVendorRoute && role === "vendor") {
        const storeApiUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}/api/store`;

        let storeId = null;

        let storeStatus = null;

        console.log(
          `[Middleware Debug] Vendor route (${pathname}) and role is vendor. Attempting to fetch store data from: ${storeApiUrl}`
        );

        try {
          const storeResponse = await fetch(storeApiUrl, {
            headers: req.headers,
          });

          console.log(
            `[Middleware Debug] Fetch response status for ${storeApiUrl}: ${storeResponse.status}`
          );

          if (storeResponse.status === 404) {
            console.log(
              `[Middleware Debug] Store not found (404) for vendor. Redirecting to /create-store`
            );

            return NextResponse.redirect(new URL("/create-store", req.url));
          }

          if (!storeResponse.ok) {
            const errorText = await storeResponse.text();

            console.error(
              `[Middleware Debug] Error fetching store data: Status ${storeResponse.status}, StatusText: ${storeResponse.statusText}, Response Body: ${errorText}`
            );

            const response = NextResponse.redirect(
              new URL("/auth/login", req.url)
            );

            response.cookies.delete("token");

            return response;
          }

          const storeData = await storeResponse.json();
          console.log("storeData", storeData);

          storeId = storeData._id;

          storeStatus = storeData.status;

          console.log(
            `[Middleware Debug] Fetched store data: storeId=${storeId}, storeStatus=${storeStatus}`
          );
        } catch (fetchError) {
          console.error(
            `[Middleware Debug] Network or fetch error during store data retrieval: ${fetchError.message}`,
            fetchError
          );

          const response = NextResponse.redirect(
            new URL("/auth/login", req.url)
          );

          response.cookies.delete("token");

          return response;
        }

        if (!storeId) {
          console.log(
            `[Middleware Debug] storeId is null after fetch. Redirecting to /create-store`
          );

          return NextResponse.redirect(new URL("/create-store", req.url));
        }

        if (storeStatus !== "approved") {
          console.log(
            `[Middleware Debug] Store status is '${storeStatus}' (not approved). Redirecting to /store/pending-approval`
          );

          return NextResponse.redirect(
            new URL("/store/pending-approval", req.url)
          );
        }
      }

      if (isVendorRoute && role !== "vendor") {
        return NextResponse.redirect(new URL("/", req.url));
      }

      if (isOrderApiRoute && role !== "user") {
        return NextResponse.redirect(new URL("/", req.url));
      }

      // You can add more role-based checks here if needed
    } catch (err) {
      console.error(
        `[Middleware Debug] JWT verification failed: ${err.message}`,
        err
      );

      const response = NextResponse.redirect(new URL("/auth/login", req.url));

      response.cookies.delete("token");

      return response;
    }
  }

  console.log(
    `[Middleware Debug] No redirection for pathname: ${pathname}. Proceeding to next response.`
  );

  // Add security headers

  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");

  response.headers.set("X-Frame-Options", "SAMEORIGIN");

  response.headers.set("X-XSS-Protection", "1; mode=block");

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
    // Added 'store' to the negative lookahead to exclude /store route
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
