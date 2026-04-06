/**
 * Environment Variables Validation
 * Validates all required environment variables at startup.
 * Optional vars enable features (Stripe, Brevo, Redis, etc.); app runs with only required vars.
 */

/** Must be set for the app to start; used by getEnvVar() and validateEnv(). */
const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
  "NEXT_PUBLIC_API_URL",
] as const;

/** Optional: when set, enable ImageKit, OAuth, email, cache, payments, shipping, etc. */
const optionalEnvVars = [
  "IMAGEKIT_PUBLIC_KEY",
  "IMAGEKIT_PRIVATE_KEY",
  "IMAGEKIT_URL_ENDPOINT",
  "NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY",
  "NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "NEXT_PUBLIC_GOOGLE_CLIENT_ID",
  "BREVO_API_KEY",
  "BREVO_SENDER_EMAIL",
  "BREVO_SENDER_NAME",
  "BREVO_ADMIN_EMAIL",
  "SENTRY_DSN",
  "NEXT_PUBLIC_SENTRY_DSN",
  "UPSTASH_REDIS_URL",
  "UPSTASH_REDIS_TOKEN",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "QSTASH_URL",
  "QSTASH_TOKEN",
  "QSTASH_CURRENT_SIGNING_KEY",
  "QSTASH_NEXT_SIGNING_KEY",
  "OPENROUTER_API_KEY",
  "STRIPE_API_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "SHIPPO_API_KEY",
  "SHIPPO_FROM_NAME",
  "SHIPPO_FROM_STREET1",
  "SHIPPO_FROM_STREET2",
  "SHIPPO_FROM_CITY",
  "SHIPPO_FROM_STATE",
  "SHIPPO_FROM_ZIP",
  "SHIPPO_FROM_COUNTRY",
  "SHIPPO_FROM_PHONE",
  "SHIPPO_FROM_EMAIL",
] as const;

type RequiredEnvVar = (typeof requiredEnvVars)[number];
type OptionalEnvVar = (typeof optionalEnvVars)[number];
type EnvVar = RequiredEnvVar | OptionalEnvVar;

/**
 * Get environment variable with validation
 */
export function getEnvVar(key: RequiredEnvVar): string;
export function getEnvVar(key: OptionalEnvVar): string | undefined;
export function getEnvVar(key: EnvVar): string | undefined {
  const value = process.env[key];

  if (!value && requiredEnvVars.includes(key as RequiredEnvVar)) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

/**
 * Validate all required environment variables
 * Call this at app startup to fail fast if config is missing
 */
export function validateEnv(): void {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing
        .map((v) => `  - ${v}`)
        .join("\n")}`,
    );
  }

  console.log("✅ Environment variables validated");
}

/**
 * Get all environment variables with their status
 * Useful for debugging configuration issues
 */
export function getEnvStatus() {
  return {
    required: requiredEnvVars.map((key) => ({
      key,
      configured: !!process.env[key],
    })),
    optional: optionalEnvVars.map((key) => ({
      key,
      configured: !!process.env[key],
    })),
  };
}
