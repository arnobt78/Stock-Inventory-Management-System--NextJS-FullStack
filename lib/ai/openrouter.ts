/**
 * OpenRouter API client
 * Use OpenAI-compatible models (and others) via OpenRouter free tier.
 * Base URL: https://openrouter.ai/api/v1
 * Docs: https://openrouter.ai/docs
 */

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterChatOptions {
  /** Model ID (e.g. openai/gpt-4o-mini, openai/gpt-3.5-turbo). Default: openai/gpt-4o-mini */
  model?: string;
  /** Max tokens in response */
  max_tokens?: number;
  /** Temperature 0-2 */
  temperature?: number;
}

export interface OpenRouterChatResponse {
  id: string;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Check if OpenRouter is configured (API key set and non-empty)
 */
export function isOpenRouterConfigured(): boolean {
  const key = process.env.OPENROUTER_API_KEY;
  return typeof key === "string" && key.trim().length > 0;
}

/**
 * Create a chat completion via OpenRouter (OpenAI-compatible API).
 * Uses OPENROUTER_API_KEY from env. Gracefully returns null if not configured or on error.
 */
export async function createChatCompletion(
  messages: OpenRouterMessage[],
  options: OpenRouterChatOptions = {},
): Promise<OpenRouterChatResponse | null> {
  if (!isOpenRouterConfigured()) {
    return null;
  }

  const apiKey = process.env.OPENROUTER_API_KEY!;
  const model = options.model ?? "openai/gpt-4o-mini";

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options.max_tokens ?? 1024,
        temperature: options.temperature ?? 0.7,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[OpenRouter] API error:", response.status, text);
      return null;
    }

    const data = (await response.json()) as OpenRouterChatResponse;
    return data;
  } catch (error) {
    console.error("[OpenRouter] Request failed:", error);
    return null;
  }
}
