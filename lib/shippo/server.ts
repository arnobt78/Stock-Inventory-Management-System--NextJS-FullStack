/**
 * Shippo Server-Side Client
 * Use this for server-side Shippo operations (shipping labels, rates, tracking)
 */

import { Shippo } from "shippo";

// Lazy initialization to avoid issues during build
let shippoInstance: Shippo | null = null;

/**
 * Default sender address (warehouse/store)
 * Can be overridden via environment variables
 */
export const DEFAULT_FROM_ADDRESS = {
  name: process.env.SHIPPO_FROM_NAME || "Stock Inventory Store",
  street1: process.env.SHIPPO_FROM_STREET1 || "123 Main St",
  street2: process.env.SHIPPO_FROM_STREET2 || "",
  city: process.env.SHIPPO_FROM_CITY || "New York",
  state: process.env.SHIPPO_FROM_STATE || "NY",
  zip: process.env.SHIPPO_FROM_ZIP || "10001",
  country: process.env.SHIPPO_FROM_COUNTRY || "US",
  phone: process.env.SHIPPO_FROM_PHONE || "+1 555 123 4567",
  email: process.env.SHIPPO_FROM_EMAIL || "store@example.com",
};

/**
 * Carrier tracking URLs
 */
export const CARRIER_TRACKING_URLS: Record<
  string,
  (trackingNumber: string) => string
> = {
  usps: (trackingNumber) =>
    `https://tools.usps.com/go/TrackConfirmAction_input?origTrackNum=${trackingNumber}`,
  ups: (trackingNumber) =>
    `https://www.ups.com/track?tracknum=${trackingNumber}`,
  fedex: (trackingNumber) =>
    `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
  dhl: (trackingNumber) =>
    `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`,
};

/**
 * Get Shippo client instance
 */
export function getShippo(): Shippo {
  if (!shippoInstance) {
    const apiKey = process.env.SHIPPO_API_KEY;
    if (!apiKey) {
      throw new Error("SHIPPO_API_KEY is not configured");
    }
    shippoInstance = new Shippo({
      apiKeyHeader: apiKey,
    });
  }
  return shippoInstance;
}

/**
 * Check if Shippo is configured
 */
export function isShippoConfigured(): boolean {
  return !!process.env.SHIPPO_API_KEY;
}

/**
 * Check if Shippo is in test mode
 */
export function isShippoTestMode(): boolean {
  const apiKey = process.env.SHIPPO_API_KEY || "";
  return apiKey.startsWith("shippo_test_");
}

/**
 * Generate tracking URL for a carrier
 */
export function getTrackingUrl(
  carrier: string,
  trackingNumber: string,
): string | null {
  const carrierLower = carrier.toLowerCase();
  const urlGenerator = CARRIER_TRACKING_URLS[carrierLower];
  return urlGenerator ? urlGenerator(trackingNumber) : null;
}

/**
 * Supported carriers
 */
export const SUPPORTED_CARRIERS = [
  { value: "usps", label: "USPS" },
  { value: "ups", label: "UPS" },
  { value: "fedex", label: "FedEx" },
  { value: "dhl", label: "DHL" },
  { value: "other", label: "Other" },
] as const;

export type ShippingCarrier = (typeof SUPPORTED_CARRIERS)[number]["value"];
