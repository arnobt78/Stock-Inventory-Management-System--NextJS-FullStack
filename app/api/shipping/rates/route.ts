/**
 * Shipping Rates API Route
 * POST /api/shipping/rates — get shipping rates from Shippo
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { logger } from "@/lib/logger";
import {
  getShippo,
  isShippoConfigured,
  DEFAULT_FROM_ADDRESS,
} from "@/lib/shippo";
import { withRateLimit, defaultRateLimits } from "@/lib/api/rate-limit";
import type { GetRatesInput, GetRatesResponse, ShippingRate } from "@/types";

/**
 * POST /api/shipping/rates
 * Get shipping rates for an address
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = await withRateLimit(
      request,
      defaultRateLimits.standard,
    );
    if (rateLimitResponse) return rateLimitResponse;

    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isShippoConfigured()) {
      return NextResponse.json(
        { error: "Shipping service is not configured" },
        { status: 503 },
      );
    }

    const body: GetRatesInput = await request.json();
    const { toAddress, fromAddress, parcel } = body;

    if (
      !toAddress ||
      !toAddress.street1 ||
      !toAddress.city ||
      !toAddress.state ||
      !toAddress.zip
    ) {
      return NextResponse.json(
        { error: "Missing required address fields" },
        { status: 400 },
      );
    }

    const shippo = getShippo();

    // Create shipment to get rates
    const shipment = await shippo.shipments.create({
      addressFrom: {
        name: fromAddress?.name || DEFAULT_FROM_ADDRESS.name,
        street1: fromAddress?.street1 || DEFAULT_FROM_ADDRESS.street1,
        street2: fromAddress?.street2 || DEFAULT_FROM_ADDRESS.street2,
        city: fromAddress?.city || DEFAULT_FROM_ADDRESS.city,
        state: fromAddress?.state || DEFAULT_FROM_ADDRESS.state,
        zip: fromAddress?.zip || DEFAULT_FROM_ADDRESS.zip,
        country: fromAddress?.country || DEFAULT_FROM_ADDRESS.country,
        phone: fromAddress?.phone || DEFAULT_FROM_ADDRESS.phone,
        email: fromAddress?.email || DEFAULT_FROM_ADDRESS.email,
      },
      addressTo: {
        name: toAddress.name,
        street1: toAddress.street1,
        street2: toAddress.street2 || "",
        city: toAddress.city,
        state: toAddress.state,
        zip: toAddress.zip,
        country: toAddress.country || "US",
        phone: toAddress.phone || "",
        email: toAddress.email || "",
      },
      parcels: [
        {
          length: parcel?.length || "10",
          width: parcel?.width || "8",
          height: parcel?.height || "4",
          distanceUnit: "in",
          weight: parcel?.weight || "2",
          massUnit: "lb",
        },
      ],
    });

    // Transform rates to our format
    const rates: ShippingRate[] = (shipment.rates || []).map((rate) => ({
      objectId: rate.objectId || "",
      carrier: rate.provider || "",
      carrierAccount: rate.carrierAccount || "",
      servicelevel: {
        name: rate.servicelevel?.name || "",
        token: rate.servicelevel?.token || "",
        terms: rate.servicelevel?.terms || "",
      },
      amount: rate.amount || "0",
      currency: rate.currency || "USD",
      estimatedDays: rate.estimatedDays,
      durationTerms: rate.durationTerms,
    }));

    // Sort by price
    rates.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));

    const response: GetRatesResponse = {
      rates,
      shipmentId: shipment.objectId || "",
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Error getting shipping rates:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get shipping rates",
      },
      { status: 500 },
    );
  }
}
