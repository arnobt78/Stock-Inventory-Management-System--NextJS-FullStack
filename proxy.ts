import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public routes that don't require authentication
  const publicRoutes = ["/login", "/register"];

  // Skip middleware for public routes
  if (publicRoutes.includes(path)) {
    return NextResponse.next();
  }

  // Define protected routes that require authentication
  const protectedRoutes = [
    "/",
    "/api-docs",
    "/api-status",
    "/business-insights",
  ];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    route === "/" ? path === "/" : path.startsWith(route)
  );

  if (isProtectedRoute) {
    // Get the session token from cookies
    const sessionToken = request.cookies.get("session_id")?.value;

    // If no session token, redirect to login
    if (
      !sessionToken ||
      sessionToken === "null" ||
      sessionToken === "undefined"
    ) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }

    // Validate session with auth API (server-side check)
    try {
      const authCheckUrl = new URL("/api/auth/session", request.url);
      const response = await fetch(authCheckUrl, {
        headers: {
          Cookie: `session_id=${sessionToken}`,
        },
      });

      // If session is invalid, redirect to login
      if (!response.ok) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", path);
        return NextResponse.redirect(loginUrl);
      }
    } catch (error) {
      // If validation fails, redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
