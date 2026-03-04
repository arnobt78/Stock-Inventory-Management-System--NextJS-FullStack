/**
 * Order-Related Email Templates
 * Templates for order confirmations, invoices, shipping, and status updates
 * All templates support both HTML and plain text versions
 * Optimized for Gmail, Yahoo, Outlook compatibility
 * 
 * NOTE: These templates are ready to use once order/invoice systems are implemented
 */

import type {
  EmailContent,
  OrderConfirmationData,
  InvoiceEmailData,
  ShippingNotificationData,
  OrderStatusUpdateData,
} from "./types";

/**
 * Generate unique subject with timestamp and random number to avoid spam
 *
 * @param baseSubject - Base subject line
 * @returns string - Subject with timestamp and random number
 */
function generateUniqueSubject(baseSubject: string): string {
  const timestamp = Date.now();
  const randomNumber = Math.floor(Math.random() * 10000);
  return `${baseSubject} [${timestamp}-${randomNumber}]`;
}

/**
 * Format currency amount
 *
 * @param amount - Amount to format
 * @returns string - Formatted currency string
 */
function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Generate order confirmation email
 * Sent to client when order is placed
 *
 * @param data - Order confirmation data
 * @returns EmailContent - Email content with HTML and text versions
 */
export function generateOrderConfirmationEmail(
  data: OrderConfirmationData
): EmailContent {
  const {
    orderNumber,
    orderDate,
    clientName,
    items,
    subtotal,
    tax,
    shipping,
    total,
    shippingAddress,
    orderStatus,
    estimatedDelivery,
  } = data;

  const subject = generateUniqueSubject(`Order Confirmation: ${orderNumber}`);

  // Generate items table rows
  const itemsRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #333333;">${item.productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #666666; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #666666; text-align: right;">${formatCurrency(item.price)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #333333; text-align: right; font-weight: 600;">${formatCurrency(item.subtotal)}</td>
        </tr>
      `
    )
    .join("");

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>Order Confirmation</title>
    <!--[if mso]>
    <style type="text/css">
      body, table, td {font-family: Arial, sans-serif !important;}
    </style>
    <![endif]-->
  </head>
  <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding: 30px;">
                <h1 style="color: #27ae60; margin: 0 0 20px 0; font-size: 24px; font-weight: 600; line-height: 1.2;">✅ Order Confirmed</h1>
                
                <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">Thank you for your order, ${clientName}! We've received your order and will begin processing it shortly.</p>
                
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #e8f8f5; border-left: 4px solid #27ae60; border-radius: 4px; margin: 20px 0;">
                  <tr>
                    <td style="padding: 15px;">
                      <h2 style="margin: 0 0 15px 0; color: #1e8449; font-size: 18px; font-weight: 600;">Order Details</h2>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333; width: 150px;">Order Number:</td>
                          <td style="padding: 8px 0; color: #666666; font-weight: 600;">${orderNumber}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333;">Order Date:</td>
                          <td style="padding: 8px 0; color: #666666;">${orderDate}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333;">Status:</td>
                          <td style="padding: 8px 0; color: #27ae60; font-weight: 600; text-transform: uppercase;">${orderStatus}</td>
                        </tr>
                        ${
                          estimatedDelivery
                            ? `<tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333;">Est. Delivery:</td>
                          <td style="padding: 8px 0; color: #666666;">${estimatedDelivery}</td>
                        </tr>`
                            : ""
                        }
                      </table>
                    </td>
                  </tr>
                </table>

                <h2 style="color: #333333; margin: 30px 0 15px 0; font-size: 18px; font-weight: 600;">Order Items</h2>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 1px solid #eeeeee; border-radius: 4px; margin: 0 0 20px 0;">
                  <tr style="background-color: #f8f9fa;">
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #333333; border-bottom: 2px solid #dee2e6;">Product</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600; color: #333333; border-bottom: 2px solid #dee2e6;">Qty</th>
                    <th style="padding: 12px; text-align: right; font-weight: 600; color: #333333; border-bottom: 2px solid #dee2e6;">Price</th>
                    <th style="padding: 12px; text-align: right; font-weight: 600; color: #333333; border-bottom: 2px solid #dee2e6;">Subtotal</th>
                  </tr>
                  ${itemsRows}
                </table>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
                  <tr>
                    <td style="padding: 8px 0; text-align: right; color: #666666;">Subtotal:</td>
                    <td style="padding: 8px 0; padding-left: 20px; text-align: right; color: #333333; font-weight: 600; width: 120px;">${formatCurrency(subtotal)}</td>
                  </tr>
                  ${
                    tax
                      ? `<tr>
                    <td style="padding: 8px 0; text-align: right; color: #666666;">Tax:</td>
                    <td style="padding: 8px 0; padding-left: 20px; text-align: right; color: #333333; font-weight: 600;">${formatCurrency(tax)}</td>
                  </tr>`
                      : ""
                  }
                  ${
                    shipping
                      ? `<tr>
                    <td style="padding: 8px 0; text-align: right; color: #666666;">Shipping:</td>
                    <td style="padding: 8px 0; padding-left: 20px; text-align: right; color: #333333; font-weight: 600;">${formatCurrency(shipping)}</td>
                  </tr>`
                      : ""
                  }
                  <tr style="border-top: 2px solid #333333;">
                    <td style="padding: 12px 0; text-align: right; color: #333333; font-size: 18px; font-weight: 700;">Total:</td>
                    <td style="padding: 12px 0; padding-left: 20px; text-align: right; color: #27ae60; font-size: 18px; font-weight: 700;">${formatCurrency(total)}</td>
                  </tr>
                </table>

                ${
                  shippingAddress
                    ? `<div style="margin: 30px 0;">
                  <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Shipping Address</h2>
                  <p style="font-size: 14px; line-height: 1.6; color: #666666; margin: 0;">
                    ${shippingAddress.street}<br>
                    ${shippingAddress.city}${shippingAddress.state ? `, ${shippingAddress.state}` : ""} ${shippingAddress.zipCode}<br>
                    ${shippingAddress.country}
                  </p>
                </div>`
                    : ""
                }
                
                <p style="font-size: 14px; line-height: 1.6; color: #666666; margin: 30px 0 0 0;">
                  We'll send you another email when your order ships. If you have any questions, please contact our support team.
                </p>
                
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0 0 0;">
                  <tr>
                    <td style="border-top: 1px solid #eeeeee; padding: 30px 0 0 0;">
                      <p style="font-size: 12px; line-height: 1.5; color: #999999; margin: 0;">
                        This is an automated email from Stock Inventory Management. Please do not reply to this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  const itemsText = items
    .map(
      (item) => `- ${item.productName} (Qty: ${item.quantity}) - ${formatCurrency(item.price)} each = ${formatCurrency(item.subtotal)}`
    )
    .join("\n");

  const textContent = `
Order Confirmation: ${orderNumber}

Thank you for your order, ${clientName}! We've received your order and will begin processing it shortly.

Order Details:
- Order Number: ${orderNumber}
- Order Date: ${orderDate}
- Status: ${orderStatus.toUpperCase()}
${estimatedDelivery ? `- Estimated Delivery: ${estimatedDelivery}\n` : ""}

Order Items:
${itemsText}

Order Summary:
- Subtotal: ${formatCurrency(subtotal)}
${tax ? `- Tax: ${formatCurrency(tax)}\n` : ""}${shipping ? `- Shipping: ${formatCurrency(shipping)}\n` : ""}- Total: ${formatCurrency(total)}

${shippingAddress ? `Shipping Address:\n${shippingAddress.street}\n${shippingAddress.city}${shippingAddress.state ? `, ${shippingAddress.state}` : ""} ${shippingAddress.zipCode}\n${shippingAddress.country}\n\n` : ""}We'll send you another email when your order ships. If you have any questions, please contact our support team.

---
This is an automated email from Stock Inventory Management. Please do not reply to this email.
  `.trim();

  return {
    subject,
    htmlContent,
    textContent,
  };
}

/**
 * Generate invoice email
 * Sent to client with invoice details and payment link
 *
 * @param data - Invoice email data
 * @returns EmailContent - Email content with HTML and text versions
 */
export function generateInvoiceEmail(data: InvoiceEmailData): EmailContent {
  const {
    invoiceNumber,
    invoiceDate,
    dueDate,
    clientName,
    orderNumber,
    items,
    subtotal,
    tax,
    shipping,
    discount,
    total,
    amountPaid,
    amountDue,
    paymentLink,
    invoiceUrl,
    status,
  } = data;

  const subject = generateUniqueSubject(`Invoice ${invoiceNumber}${status === "overdue" ? " - Payment Overdue" : ""}`);

  // Generate items table rows
  const itemsRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #333333;">${item.description}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #666666; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #666666; text-align: right;">${formatCurrency(item.unitPrice)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #333333; text-align: right; font-weight: 600;">${formatCurrency(item.subtotal)}</td>
        </tr>
      `
    )
    .join("");

  const statusColor =
    status === "paid"
      ? "#27ae60"
      : status === "overdue"
      ? "#e74c3c"
      : status === "sent"
      ? "#3498db"
      : "#95a5a6";

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>Invoice</title>
    <!--[if mso]>
    <style type="text/css">
      body, table, td {font-family: Arial, sans-serif !important;}
    </style>
    <![endif]-->
  </head>
  <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding: 30px;">
                <h1 style="color: ${statusColor}; margin: 0 0 20px 0; font-size: 24px; font-weight: 600; line-height: 1.2;">📄 Invoice ${invoiceNumber}</h1>
                
                <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">Dear ${clientName},</p>
                <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">Please find your invoice details below.${status === "overdue" ? " <strong style='color: #e74c3c;'>This invoice is overdue. Please make payment immediately.</strong>" : ""}</p>
                
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-left: 4px solid ${statusColor}; border-radius: 4px; margin: 20px 0;">
                  <tr>
                    <td style="padding: 15px;">
                      <h2 style="margin: 0 0 15px 0; color: #333333; font-size: 18px; font-weight: 600;">Invoice Information</h2>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333; width: 150px;">Invoice Number:</td>
                          <td style="padding: 8px 0; color: #666666; font-weight: 600;">${invoiceNumber}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333;">Invoice Date:</td>
                          <td style="padding: 8px 0; color: #666666;">${invoiceDate}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333;">Due Date:</td>
                          <td style="padding: 8px 0; color: ${status === "overdue" ? "#e74c3c" : "#666666"}; font-weight: ${status === "overdue" ? "700" : "400"};">${dueDate}${status === "overdue" ? " (OVERDUE)" : ""}</td>
                        </tr>
                        ${
                          orderNumber
                            ? `<tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333;">Order Number:</td>
                          <td style="padding: 8px 0; color: #666666;">${orderNumber}</td>
                        </tr>`
                            : ""
                        }
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333;">Status:</td>
                          <td style="padding: 8px 0; color: ${statusColor}; font-weight: 600; text-transform: uppercase;">${status}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <h2 style="color: #333333; margin: 30px 0 15px 0; font-size: 18px; font-weight: 600;">Invoice Items</h2>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 1px solid #eeeeee; border-radius: 4px; margin: 0 0 20px 0;">
                  <tr style="background-color: #f8f9fa;">
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #333333; border-bottom: 2px solid #dee2e6;">Description</th>
                    <th style="padding: 12px; text-align: center; font-weight: 600; color: #333333; border-bottom: 2px solid #dee2e6;">Qty</th>
                    <th style="padding: 12px; text-align: right; font-weight: 600; color: #333333; border-bottom: 2px solid #dee2e6;">Unit Price</th>
                    <th style="padding: 12px; text-align: right; font-weight: 600; color: #333333; border-bottom: 2px solid #dee2e6;">Amount</th>
                  </tr>
                  ${itemsRows}
                </table>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
                  <tr>
                    <td style="padding: 8px 0; text-align: right; color: #666666;">Subtotal:</td>
                    <td style="padding: 8px 0; padding-left: 20px; text-align: right; color: #333333; font-weight: 600; width: 120px;">${formatCurrency(subtotal)}</td>
                  </tr>
                  ${
                    discount
                      ? `<tr>
                    <td style="padding: 8px 0; text-align: right; color: #666666;">Discount:</td>
                    <td style="padding: 8px 0; padding-left: 20px; text-align: right; color: #27ae60; font-weight: 600;">-${formatCurrency(discount)}</td>
                  </tr>`
                      : ""
                  }
                  ${
                    tax
                      ? `<tr>
                    <td style="padding: 8px 0; text-align: right; color: #666666;">Tax:</td>
                    <td style="padding: 8px 0; padding-left: 20px; text-align: right; color: #333333; font-weight: 600;">${formatCurrency(tax)}</td>
                  </tr>`
                      : ""
                  }
                  ${
                    shipping
                      ? `<tr>
                    <td style="padding: 8px 0; text-align: right; color: #666666;">Shipping:</td>
                    <td style="padding: 8px 0; padding-left: 20px; text-align: right; color: #333333; font-weight: 600;">${formatCurrency(shipping)}</td>
                  </tr>`
                      : ""
                  }
                  <tr style="border-top: 2px solid #333333;">
                    <td style="padding: 12px 0; text-align: right; color: #333333; font-size: 18px; font-weight: 700;">Total:</td>
                    <td style="padding: 12px 0; padding-left: 20px; text-align: right; color: #333333; font-size: 18px; font-weight: 700;">${formatCurrency(total)}</td>
                  </tr>
                  ${
                    amountPaid
                      ? `<tr>
                    <td style="padding: 8px 0; text-align: right; color: #666666;">Amount Paid:</td>
                    <td style="padding: 8px 0; padding-left: 20px; text-align: right; color: #27ae60; font-weight: 600;">${formatCurrency(amountPaid)}</td>
                  </tr>`
                      : ""
                  }
                  <tr style="border-top: 2px solid ${status === "overdue" ? "#e74c3c" : "#333333"};">
                    <td style="padding: 12px 0; text-align: right; color: ${status === "overdue" ? "#e74c3c" : "#333333"}; font-size: 18px; font-weight: 700;">Amount Due:</td>
                    <td style="padding: 12px 0; padding-left: 20px; text-align: right; color: ${status === "overdue" ? "#e74c3c" : "#27ae60"}; font-size: 18px; font-weight: 700;">${formatCurrency(amountDue)}</td>
                  </tr>
                </table>

                ${
                  paymentLink
                    ? `<div style="margin: 30px 0; text-align: center;">
                  <a href="${paymentLink}" style="display: inline-block; padding: 14px 28px; background-color: #27ae60; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Pay Invoice Now</a>
                </div>`
                    : ""
                }

                ${
                  invoiceUrl
                    ? `<p style="font-size: 14px; line-height: 1.6; color: #666666; margin: 20px 0; text-align: center;">
                  <a href="${invoiceUrl}" style="color: #3498db; text-decoration: underline;">View or Download Invoice PDF</a>
                </p>`
                    : ""
                }
                
                <p style="font-size: 14px; line-height: 1.6; color: #666666; margin: 30px 0 0 0;">
                  ${status === "overdue" ? "<strong>This invoice is overdue. Please make payment immediately to avoid any service interruptions.</strong><br><br>" : ""}If you have any questions about this invoice, please contact our support team.
                </p>
                
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0 0 0;">
                  <tr>
                    <td style="border-top: 1px solid #eeeeee; padding: 30px 0 0 0;">
                      <p style="font-size: 12px; line-height: 1.5; color: #999999; margin: 0;">
                        This is an automated email from Stock Inventory Management. Please do not reply to this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  const itemsText = items
    .map(
      (item) => `- ${item.description} (Qty: ${item.quantity}) - ${formatCurrency(item.unitPrice)} each = ${formatCurrency(item.subtotal)}`
    )
    .join("\n");

  const textContent = `
Invoice ${invoiceNumber}${status === "overdue" ? " - Payment Overdue" : ""}

Dear ${clientName},

Please find your invoice details below.${status === "overdue" ? " THIS INVOICE IS OVERDUE. Please make payment immediately." : ""}

Invoice Information:
- Invoice Number: ${invoiceNumber}
- Invoice Date: ${invoiceDate}
- Due Date: ${dueDate}${status === "overdue" ? " (OVERDUE)" : ""}
${orderNumber ? `- Order Number: ${orderNumber}\n` : ""}- Status: ${status.toUpperCase()}

Invoice Items:
${itemsText}

Invoice Summary:
- Subtotal: ${formatCurrency(subtotal)}
${discount ? `- Discount: -${formatCurrency(discount)}\n` : ""}${tax ? `- Tax: ${formatCurrency(tax)}\n` : ""}${shipping ? `- Shipping: ${formatCurrency(shipping)}\n` : ""}- Total: ${formatCurrency(total)}
${amountPaid ? `- Amount Paid: ${formatCurrency(amountPaid)}\n` : ""}- Amount Due: ${formatCurrency(amountDue)}

${paymentLink ? `Pay Invoice: ${paymentLink}\n\n` : ""}${invoiceUrl ? `View Invoice: ${invoiceUrl}\n\n` : ""}${status === "overdue" ? "THIS INVOICE IS OVERDUE. Please make payment immediately to avoid any service interruptions.\n\n" : ""}If you have any questions about this invoice, please contact our support team.

---
This is an automated email from Stock Inventory Management. Please do not reply to this email.
  `.trim();

  return {
    subject,
    htmlContent,
    textContent,
  };
}

/**
 * Generate shipping notification email
 * Sent to client when order is shipped with tracking information
 *
 * @param data - Shipping notification data
 * @returns EmailContent - Email content with HTML and text versions
 */
export function generateShippingNotificationEmail(
  data: ShippingNotificationData
): EmailContent {
  const {
    orderNumber,
    clientName,
    trackingNumber,
    carrier,
    shippingDate,
    estimatedDelivery,
    shippingAddress,
    items,
    trackingUrl,
  } = data;

  const subject = generateUniqueSubject(`Your Order ${orderNumber} Has Shipped`);

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>Order Shipped</title>
    <!--[if mso]>
    <style type="text/css">
      body, table, td {font-family: Arial, sans-serif !important;}
    </style>
    <![endif]-->
  </head>
  <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding: 30px;">
                <h1 style="color: #3498db; margin: 0 0 20px 0; font-size: 24px; font-weight: 600; line-height: 1.2;">🚚 Your Order Has Shipped!</h1>
                
                <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">Great news, ${clientName}! Your order ${orderNumber} has been shipped and is on its way to you.</p>
                
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #e8f4f8; border-left: 4px solid #3498db; border-radius: 4px; margin: 20px 0;">
                  <tr>
                    <td style="padding: 15px;">
                      <h2 style="margin: 0 0 15px 0; color: #1e5f8f; font-size: 18px; font-weight: 600;">Tracking Information</h2>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333; width: 150px;">Order Number:</td>
                          <td style="padding: 8px 0; color: #666666; font-weight: 600;">${orderNumber}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333;">Tracking Number:</td>
                          <td style="padding: 8px 0; color: #3498db; font-weight: 700; font-size: 16px;">${trackingNumber}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333;">Carrier:</td>
                          <td style="padding: 8px 0; color: #666666;">${carrier}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333;">Shipped Date:</td>
                          <td style="padding: 8px 0; color: #666666;">${shippingDate}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333;">Est. Delivery:</td>
                          <td style="padding: 8px 0; color: #27ae60; font-weight: 600;">${estimatedDelivery}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                ${
                  trackingUrl
                    ? `<div style="margin: 20px 0; text-align: center;">
                  <a href="${trackingUrl}" style="display: inline-block; padding: 14px 28px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Track Your Package</a>
                </div>`
                    : ""
                }

                <h2 style="color: #333333; margin: 30px 0 15px 0; font-size: 18px; font-weight: 600;">Shipped Items</h2>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 1px solid #eeeeee; border-radius: 4px; margin: 0 0 20px 0;">
                  ${items
                    .map(
                      (item) => `
                    <tr>
                      <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #333333;">${item.productName}</td>
                      <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #666666; text-align: right;">Quantity: ${item.quantity}</td>
                    </tr>
                  `
                    )
                    .join("")}
                </table>

                <div style="margin: 30px 0;">
                  <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Delivery Address</h2>
                  <p style="font-size: 14px; line-height: 1.6; color: #666666; margin: 0;">
                    ${shippingAddress.street}<br>
                    ${shippingAddress.city}${shippingAddress.state ? `, ${shippingAddress.state}` : ""} ${shippingAddress.zipCode}<br>
                    ${shippingAddress.country}
                  </p>
                </div>
                
                <p style="font-size: 14px; line-height: 1.6; color: #666666; margin: 30px 0 0 0;">
                  You can track your package using the tracking number above. If you have any questions, please contact our support team.
                </p>
                
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0 0 0;">
                  <tr>
                    <td style="border-top: 1px solid #eeeeee; padding: 30px 0 0 0;">
                      <p style="font-size: 12px; line-height: 1.5; color: #999999; margin: 0;">
                        This is an automated email from Stock Inventory Management. Please do not reply to this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  const itemsText = items
    .map((item) => `- ${item.productName} (Quantity: ${item.quantity})`)
    .join("\n");

  const textContent = `
Your Order ${orderNumber} Has Shipped

Great news, ${clientName}! Your order ${orderNumber} has been shipped and is on its way to you.

Tracking Information:
- Order Number: ${orderNumber}
- Tracking Number: ${trackingNumber}
- Carrier: ${carrier}
- Shipped Date: ${shippingDate}
- Estimated Delivery: ${estimatedDelivery}

${trackingUrl ? `Track Your Package: ${trackingUrl}\n\n` : ""}Shipped Items:
${itemsText}

Delivery Address:
${shippingAddress.street}
${shippingAddress.city}${shippingAddress.state ? `, ${shippingAddress.state}` : ""} ${shippingAddress.zipCode}
${shippingAddress.country}

You can track your package using the tracking number above. If you have any questions, please contact our support team.

---
This is an automated email from Stock Inventory Management. Please do not reply to this email.
  `.trim();

  return {
    subject,
    htmlContent,
    textContent,
  };
}

/**
 * Generate order status update email
 * Sent to client when order status changes
 *
 * @param data - Order status update data
 * @returns EmailContent - Email content with HTML and text versions
 */
export function generateOrderStatusUpdateEmail(
  data: OrderStatusUpdateData
): EmailContent {
  const {
    orderNumber,
    clientName,
    previousStatus,
    newStatus,
    statusMessage,
    orderUrl,
    estimatedDelivery,
  } = data;

  const subject = generateUniqueSubject(`Order ${orderNumber} Status Update: ${newStatus}`);

  // Status color mapping
  const statusColors: Record<string, string> = {
    pending: "#f39c12",
    confirmed: "#3498db",
    processing: "#9b59b6",
    shipped: "#3498db",
    delivered: "#27ae60",
    cancelled: "#e74c3c",
    refunded: "#95a5a6",
  };

  const statusColor = statusColors[newStatus.toLowerCase()] || "#95a5a6";

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>Order Status Update</title>
    <!--[if mso]>
    <style type="text/css">
      body, table, td {font-family: Arial, sans-serif !important;}
    </style>
    <![endif]-->
  </head>
  <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <tr>
              <td style="padding: 30px;">
                <h1 style="color: ${statusColor}; margin: 0 0 20px 0; font-size: 24px; font-weight: 600; line-height: 1.2;">📦 Order Status Update</h1>
                
                <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">Hello ${clientName},</p>
                <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">We wanted to let you know that your order status has been updated.</p>
                
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-left: 4px solid ${statusColor}; border-radius: 4px; margin: 20px 0;">
                  <tr>
                    <td style="padding: 15px;">
                      <h2 style="margin: 0 0 15px 0; color: #333333; font-size: 18px; font-weight: 600;">Order Status Change</h2>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333; width: 150px;">Order Number:</td>
                          <td style="padding: 8px 0; color: #666666; font-weight: 600;">${orderNumber}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333;">Previous Status:</td>
                          <td style="padding: 8px 0; color: #666666; text-transform: uppercase;">${previousStatus}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333;">New Status:</td>
                          <td style="padding: 8px 0; color: ${statusColor}; font-weight: 700; font-size: 16px; text-transform: uppercase;">${newStatus}</td>
                        </tr>
                        ${
                          estimatedDelivery
                            ? `<tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333;">Est. Delivery:</td>
                          <td style="padding: 8px 0; color: #666666;">${estimatedDelivery}</td>
                        </tr>`
                            : ""
                        }
                      </table>
                    </td>
                  </tr>
                </table>

                ${
                  statusMessage
                    ? `<div style="background-color: #e8f4f8; border-left: 4px solid #3498db; border-radius: 4px; padding: 15px; margin: 20px 0;">
                  <p style="font-size: 14px; line-height: 1.6; color: #333333; margin: 0;">
                    <strong>Message:</strong> ${statusMessage}
                  </p>
                </div>`
                    : ""
                }

                ${
                  orderUrl
                    ? `<div style="margin: 30px 0; text-align: center;">
                  <a href="${orderUrl}" style="display: inline-block; padding: 14px 28px; background-color: ${statusColor}; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">View Order Details</a>
                </div>`
                    : ""
                }
                
                <p style="font-size: 14px; line-height: 1.6; color: #666666; margin: 30px 0 0 0;">
                  If you have any questions about your order, please contact our support team.
                </p>
                
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0 0 0;">
                  <tr>
                    <td style="border-top: 1px solid #eeeeee; padding: 30px 0 0 0;">
                      <p style="font-size: 12px; line-height: 1.5; color: #999999; margin: 0;">
                        This is an automated email from Stock Inventory Management. Please do not reply to this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();

  const textContent = `
Order ${orderNumber} Status Update: ${newStatus}

Hello ${clientName},

We wanted to let you know that your order status has been updated.

Order Status Change:
- Order Number: ${orderNumber}
- Previous Status: ${previousStatus.toUpperCase()}
- New Status: ${newStatus.toUpperCase()}
${estimatedDelivery ? `- Estimated Delivery: ${estimatedDelivery}\n` : ""}

${statusMessage ? `Message: ${statusMessage}\n\n` : ""}${orderUrl ? `View Order Details: ${orderUrl}\n\n` : ""}If you have any questions about your order, please contact our support team.

---
This is an automated email from Stock Inventory Management. Please do not reply to this email.
  `.trim();

  return {
    subject,
    htmlContent,
    textContent,
  };
}
