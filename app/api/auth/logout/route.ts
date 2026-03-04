/**
 * Logout API Route Handler
 * App Router route handler for user logout
 * Migrated from Pages API to App Router
 */

import { NextRequest, NextResponse } from "next/server";
import { createCorsHeaders, handleCorsPreflight } from "@/lib/api/cors";
import { logger } from "@/lib/logger";

/**
 * POST /api/auth/logout
 * Clear session cookie and logout user
 */
export async function POST(request: NextRequest) {
  try {
    // Handle CORS
    const responseHeaders = createCorsHeaders(request);

    // Determine if connection is secure
    const isSecure =
      request.headers.get("x-forwarded-proto") === "https" ||
      process.env.NODE_ENV !== "development";

    // Create response
    const response = NextResponse.json(
      { success: true },
      { status: 200, headers: responseHeaders }
    );

    // Clear session cookie. Use sameSite "lax" so cookie clears reliably on same-origin (matches login).
    response.cookies.set("session_id", "", {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    logger.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/auth/logout
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request);
}
