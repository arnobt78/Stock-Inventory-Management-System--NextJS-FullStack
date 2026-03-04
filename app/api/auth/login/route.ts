/**
 * Login API Route Handler
 * POST /api/auth/login: validates email/password with Zod, checks user in DB, compares password
 * with bcrypt, then issues a JWT and sets it in a cookie (session_id) for subsequent requests.
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { generateToken } from "@/utils/auth";
import { loginSchema } from "@/lib/validations";
import { createCorsHeaders, handleCorsPreflight } from "@/lib/api/cors";
import { logger } from "@/lib/logger";
import { prisma } from "@/prisma/client";

/**
 * POST /api/auth/login
 * Authenticate user and create session
 */
export async function POST(request: NextRequest) {
  try {
    // Handle CORS
    const responseHeaders = createCorsHeaders(request);

    // Parse and validate request body
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400, headers: responseHeaders },
      );
    }

    // Validate with Zod schema
    const { email, password } = loginSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401, headers: responseHeaders },
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "User data corrupted: password missing" },
        { status: 500, headers: responseHeaders },
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401, headers: responseHeaders },
      );
    }

    if (!user.id) {
      return NextResponse.json(
        { error: "User data corrupted: id missing" },
        { status: 500, headers: responseHeaders },
      );
    }

    // Generate token
    const token = generateToken(user.id);

    if (!token) {
      return NextResponse.json(
        { error: "Failed to generate session token" },
        { status: 500, headers: responseHeaders },
      );
    }

    // Determine if connection is secure
    const isSecure =
      request.headers.get("x-forwarded-proto") === "https" ||
      process.env.NODE_ENV !== "development";

    // Role for access control; existing users without role default to "user"
    const userRole = user.role ?? "user";

    // Create response
    const response = NextResponse.json(
      {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole,
        sessionId: token,
      },
      { status: 200, headers: responseHeaders },
    );

    response.cookies.set("session_id", token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour (in seconds)
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid email or password format" },
        { status: 400 },
      );
    }

    logger.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * OPTIONS /api/auth/login
 * Handle CORS preflight requests
 */
/**
 * OPTIONS /api/auth/login
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request);
}
