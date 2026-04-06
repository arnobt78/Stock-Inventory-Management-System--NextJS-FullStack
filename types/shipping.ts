/**
 * Shipping-related type definitions
 */

/**
 * Shipping carrier
 */
export type ShippingCarrier = "usps" | "ups" | "fedex" | "dhl" | "other";

/**
 * Shipping address
 */
export interface ShippingAddress {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
}

/**
 * Parcel dimensions
 */
export interface ParcelDimensions {
  length: string;
  width: string;
  height: string;
  weight: string;
}

/**
 * Shipping rate from Shippo
 */
export interface ShippingRate {
  objectId: string;
  carrier: string;
  carrierAccount: string;
  servicelevel: {
    name: string;
    token: string;
    terms?: string;
  };
  amount: string;
  currency: string;
  estimatedDays?: number;
  durationTerms?: string;
}

/**
 * Generate label input
 */
export interface GenerateLabelInput {
  orderId: string;
  carrier?: ShippingCarrier;
  service?: string;
  rateObjectId?: string;
  fromAddress?: ShippingAddress;
  toAddress?: ShippingAddress;
  parcel?: ParcelDimensions;
}

/**
 * Generate label response
 */
export interface GenerateLabelResponse {
  orderId: string;
  trackingNumber: string;
  trackingCarrier: ShippingCarrier;
  labelUrl?: string;
  trackingUrl?: string;
  status: string;
  updatedAt: string;
}

/**
 * Add tracking input
 */
export interface AddTrackingInput {
  orderId: string;
  trackingNumber: string;
  trackingCarrier?: ShippingCarrier;
}

/**
 * Get rates input
 */
export interface GetRatesInput {
  fromAddress?: ShippingAddress;
  toAddress: ShippingAddress;
  parcel?: ParcelDimensions;
}

/**
 * Get rates response
 */
export interface GetRatesResponse {
  rates: ShippingRate[];
  shipmentId: string;
}

/**
 * Tracking status
 */
export type TrackingStatus =
  | "UNKNOWN"
  | "PRE_TRANSIT"
  | "TRANSIT"
  | "DELIVERED"
  | "RETURNED"
  | "FAILURE";

/**
 * Tracking event
 */
export interface TrackingEvent {
  date: string;
  time: string;
  location?: string;
  status: TrackingStatus;
  statusDetails?: string;
}

/**
 * Tracking info response
 */
export interface TrackingInfoResponse {
  trackingNumber: string;
  carrier: string;
  status: TrackingStatus;
  estimatedDelivery?: string;
  events: TrackingEvent[];
}

/**
 * Webhook tracking payload
 */
export interface ShippoWebhookPayload {
  event: string;
  data: {
    tracking_status: {
      status: string;
      status_date: string;
      status_details?: string;
      location?: {
        city?: string;
        state?: string;
        country?: string;
      };
    };
    tracking_number: string;
    carrier: string;
    metadata?: string;
  };
}
