/**
 * Stripe Refund Utilities
 * Used when cancelling/refunding paid orders or invoices
 */

import { logger } from "@/lib/logger";
import { getStripe, isStripeConfigured } from "./server";

/**
 * Create a full refund for a Stripe PaymentIntent.
 * Uses the test-mode API key when STRIPE_API_KEY is for test mode.
 *
 * @param paymentIntentId - Stripe PaymentIntent ID (e.g. pi_xxx)
 * @param reason - Optional refund reason: duplicate, fraudulent, requested_by_customer
 * @returns Stripe Refund object or null if refund failed/skipped
 */
export async function createStripeRefund(
  paymentIntentId: string,
  reason?: "duplicate" | "fraudulent" | "requested_by_customer",
): Promise<{ id: string } | null> {
  if (!isStripeConfigured()) {
    logger.warn("Stripe refund skipped: Stripe is not configured");
    return null;
  }

  if (!paymentIntentId) {
    logger.warn("Stripe refund skipped: no payment intent ID");
    return null;
  }

  try {
    const stripe = getStripe();
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: reason ?? "requested_by_customer",
    });

    logger.info(`Stripe refund created: ${refund.id} for PaymentIntent ${paymentIntentId}`);
    return { id: refund.id };
  } catch (error) {
    // Handle already-refunded case (idempotent)
    const err = error as { code?: string; type?: string };
    if (err.code === "charge_already_refunded" || err.type === "StripeInvalidRequestError") {
      logger.info(`PaymentIntent ${paymentIntentId} already refunded, skipping`);
      return null;
    }
    logger.error("Stripe refund failed", { paymentIntentId, error });
    throw error;
  }
}
