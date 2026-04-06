/**
 * AI-powered inventory insights via OpenRouter (OpenAI-compatible models)
 * POST /api/ai/insights — accepts summary of analytics, returns short AI recommendations
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { createChatCompletion, isOpenRouterConfigured } from "@/lib/ai";
import { successResponse, errorResponse } from "@/lib/api/response-helpers";

const SYSTEM_PROMPT = `You are a concise inventory advisor. Given a short summary of inventory metrics, reply with 2-4 brief, actionable recommendations (one short sentence each). Focus on reorder suggestions, low-stock attention, and value optimization. Keep the tone professional and direct. Do not use markdown or bullet symbols.`;

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    if (!isOpenRouterConfigured()) {
      return errorResponse(
        "AI insights are not configured. Set OPENROUTER_API_KEY in .env.",
        503,
      );
    }

    let body: { summary?: string };
    try {
      body = await request.json();
    } catch {
      return errorResponse("Invalid JSON body", 400);
    }

    const summary =
      typeof body?.summary === "string" && body.summary.trim().length > 0
        ? body.summary.trim()
        : null;

    if (!summary) {
      return errorResponse("Missing or empty summary in body", 400);
    }

    const response = await createChatCompletion(
      [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: summary },
      ],
      { max_tokens: 512, temperature: 0.5 },
    );

    if (!response?.choices?.[0]?.message?.content) {
      return errorResponse("AI service did not return insights", 502);
    }

    const text = response.choices[0].message.content.trim();
    return successResponse({ text });
  } catch (error) {
    console.error("[AI insights]", error);
    return errorResponse(
      error instanceof Error ? error.message : "Failed to generate insights",
      500,
    );
  }
}
