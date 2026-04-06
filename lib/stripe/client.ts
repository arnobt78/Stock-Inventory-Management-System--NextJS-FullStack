/**
 * Stripe Client-Side Loader
 * Use this for client-side Stripe operations (Elements, Checkout redirect)
 */

import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get Stripe client instance (singleton)
 */
export function getStripeClient(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured");
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

/**
 * Check if Stripe is configured on client
 */
export function isStripeClientConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
}
