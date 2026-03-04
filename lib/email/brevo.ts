/**
 * Brevo Email Service Client
 * Handles email sending via Brevo API
 * Supports transactional emails with proper error handling
 */

import { getEnvVar } from "@/lib/env";
import { logger } from "@/lib/logger";
import type {
  BrevoApiResponse,
  EmailRecipient,
  EmailSendResult,
  EmailSender,
  SendEmailRequest,
} from "./types";

/**
 * Brevo API configuration
 */
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

/**
 * Get Brevo configuration from environment variables
 */
function getBrevoConfig() {
  const apiKey = getEnvVar("BREVO_API_KEY");
  const senderEmail = getEnvVar("BREVO_SENDER_EMAIL") || process.env.BREVO_SENDER_EMAIL;
  const senderName = getEnvVar("BREVO_SENDER_NAME") || process.env.BREVO_SENDER_NAME || "Stock Inventory Management";
  const adminEmail = getEnvVar("BREVO_ADMIN_EMAIL") || process.env.BREVO_ADMIN_EMAIL;

  if (!apiKey) {
    throw new Error("BREVO_API_KEY environment variable is not set");
  }

  if (!senderEmail) {
    throw new Error("BREVO_SENDER_EMAIL environment variable is not set");
  }

  return {
    apiKey,
    senderEmail,
    senderName,
    adminEmail,
  };
}

/**
 * Send email via Brevo API
 *
 * @param request - Email request payload
 * @returns Promise<EmailSendResult> - Email send result
 */
export async function sendEmailViaBrevo(request: SendEmailRequest): Promise<EmailSendResult> {
  try {
    const config = getBrevoConfig();

    // Normalize recipients to array
    const recipients = Array.isArray(request.to) ? request.to : [request.to];

    // Build email payload
    const emailData = {
      sender: {
        name: config.senderName,
        email: config.senderEmail,
      },
      to: recipients.map((recipient) => ({
        email: recipient.email,
        name: recipient.name,
      })),
      subject: request.subject,
      htmlContent: request.htmlContent,
      ...(request.textContent && { textContent: request.textContent }),
      replyTo: request.replyTo || {
        email: config.senderEmail,
        name: config.senderName,
      },
      ...(request.tags && request.tags.length > 0 && { tags: request.tags }),
      headers: {
        "X-Mailer": "Stock Inventory Management Email System",
        "X-Priority": "3",
        Importance: "normal",
        Precedence: "bulk",
        "Auto-Submitted": "auto-generated",
        "List-Unsubscribe": `<mailto:${config.senderEmail}?subject=unsubscribe>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    };

    // Send email via Brevo API
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": config.apiKey,
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = `Brevo API error: ${response.status} - ${errorText}`;
      logger.error("Failed to send email via Brevo", {
        status: response.status,
        error: errorText,
        recipients: recipients.map((r) => r.email),
      });
      return {
        success: false,
        error: errorMessage,
        provider: "Brevo",
      };
    }

    const result: BrevoApiResponse = await response.json();

    logger.info("Email sent successfully via Brevo", {
      messageId: result.messageId,
      recipients: recipients.map((r) => r.email),
      subject: request.subject,
    });

    return {
      success: true,
      messageId: result.messageId,
      provider: "Brevo",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    logger.error("Failed to send email via Brevo", {
      error: errorMessage,
      recipients: Array.isArray(request.to) ? request.to.map((r) => r.email) : request.to.email,
    });
    return {
      success: false,
      error: errorMessage,
      provider: "Brevo",
    };
  }
}

/**
 * Check if Brevo is configured
 *
 * @returns boolean - True if Brevo is configured, false otherwise
 */
export function isBrevoConfigured(): boolean {
  try {
    const apiKey = getEnvVar("BREVO_API_KEY");
    const senderEmail = getEnvVar("BREVO_SENDER_EMAIL") || process.env.BREVO_SENDER_EMAIL;
    return !!apiKey && !!senderEmail;
  } catch {
    return false;
  }
}

/**
 * Get admin email from configuration
 *
 * @returns string | undefined - Admin email if configured
 */
export function getAdminEmail(): string | undefined {
  try {
    return getEnvVar("BREVO_ADMIN_EMAIL") || process.env.BREVO_ADMIN_EMAIL;
  } catch {
    return undefined;
  }
}

/**
 * Get sender email from configuration
 *
 * @returns string | undefined - Sender email if configured
 */
export function getSenderEmail(): string | undefined {
  try {
    const senderEmail = getEnvVar("BREVO_SENDER_EMAIL") || process.env.BREVO_SENDER_EMAIL;
    return senderEmail;
  } catch {
    return undefined;
  }
}

/**
 * Get sender name from configuration
 *
 * @returns string - Sender name (defaults to "Stock Inventory Management")
 */
export function getSenderName(): string {
  try {
    return (
      getEnvVar("BREVO_SENDER_NAME") ||
      process.env.BREVO_SENDER_NAME ||
      "Stock Inventory Management"
    );
  } catch {
    return "Stock Inventory Management";
  }
}
