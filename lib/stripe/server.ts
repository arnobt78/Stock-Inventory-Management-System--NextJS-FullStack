/**
 * Stripe Server-Side Client
 * Use this for server-side Stripe operations (checkout sessions, webhooks, etc.)
 */

import Stripe from "stripe";

// Stripe API version - using latest supported by the installed package
const STRIPE_API_VERSION = "2026-01-28.clover" as const;

// Lazy initialization to avoid issues during build
let stripeInstance: Stripe | null = null;

/**
 * Get Stripe server instance
 */
export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_API_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_API_KEY is not configured");
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: STRIPE_API_VERSION,
      typescript: true,
    });
  }
  return stripeInstance;
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_API_KEY;
}

/**
 * Get webhook secret
 */
export function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }
  return secret;
}

export { Stripe };
