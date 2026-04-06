/**
 * OAuth Utilities
 * Google OAuth configuration and utilities
 * Gracefully degrades if OAuth is not configured
 */

import { logger } from "@/lib/logger";

/**
 * Check if Google OAuth is configured
 *
 * @returns boolean - True if Google OAuth credentials are configured
 */
export function isGoogleOAuthConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  );
}

/**
 * Get Google OAuth client ID (public)
 *
 * @returns string | undefined - Google OAuth client ID for client-side
 */
export function getGoogleClientId(): string | undefined {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
}

/**
 * Get Google OAuth client secret (server-side only)
 *
 * @returns string | undefined - Google OAuth client secret
 */
export function getGoogleClientSecret(): string | undefined {
  return process.env.GOOGLE_CLIENT_SECRET;
}

/**
 * Google OAuth configuration
 * Returns null if OAuth is not configured (graceful degradation)
 */
export interface GoogleOAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
}

/**
 * Get Google OAuth configuration
 *
 * @param redirectUri - OAuth callback redirect URI
 * @returns GoogleOAuthConfig | null - OAuth configuration or null
 */
export function getGoogleOAuthConfig(
  redirectUri: string
): GoogleOAuthConfig | null {
  const clientId = getGoogleClientId();
  if (!clientId) {
    return null;
  }

  return {
    clientId,
    redirectUri,
    scope: "openid email profile",
  };
}

/**
 * Generate Google OAuth authorization URL
 *
 * @param redirectUri - OAuth callback redirect URI
 * @param state - OAuth state parameter for CSRF protection
 * @returns string | null - OAuth authorization URL or null
 */
export function getGoogleOAuthUrl(
  redirectUri: string,
  state: string
): string | null {
  const config = getGoogleOAuthConfig(redirectUri);
  if (!config) {
    return null;
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: config.scope,
    state,
    access_type: "offline",
    prompt: "consent",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
