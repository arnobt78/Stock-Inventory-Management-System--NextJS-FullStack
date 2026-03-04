/**
 * Session API Route Handler
 * App Router route handler for session verification
 * Migrated from Pages API to App Router
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { logger } from "@/lib/logger";

/**
 * GET /api/auth/session
 * Get current user session
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return user data without sensitive information; role defaults to "user" for existing users
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image || null, // Profile image URL (from Google OAuth)
      role: user.role ?? "user",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    logger.error("Session error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
