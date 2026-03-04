/**
 * OpenAPI 3.0 specification endpoint
 * GET /api/openapi — returns OpenAPI JSON for the Stockly API (no auth required)
 */

import { NextRequest, NextResponse } from "next/server";
import { getOpenApiSpec } from "@/lib/api/openapi-spec";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    const spec = getOpenApiSpec({ baseUrl });
    return NextResponse.json(spec, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate OpenAPI spec" },
      { status: 500 }
    );
  }
}
