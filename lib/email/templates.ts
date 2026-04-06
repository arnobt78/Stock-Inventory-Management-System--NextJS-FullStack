/**
 * Email Templates
 * Reusable email templates for different notification types
 * All templates support both HTML and plain text versions
 * Optimized for Gmail, Yahoo, Outlook compatibility
 */

import type {
  EmailContent,
  InventoryReportData,
  LowStockAlertData,
  StockOutNotificationData,
} from "./types";

// Re-export order-related email templates from separate file
export {
  generateOrderConfirmationEmail,
  generateInvoiceEmail,
  generateShippingNotificationEmail,
  generateOrderStatusUpdateEmail,
} from "./templates-order";

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
 * Generate low stock alert email
 *
 * @param data - Low stock alert data
 * @returns EmailContent - Email content with HTML and text versions
 */
export function generateLowStockAlertEmail(
  data: LowStockAlertData
): EmailContent {
  const { productName, currentQuantity, threshold, sku, category } = data;

  const subject = generateUniqueSubject(`Low Stock Alert: ${productName}`);

  // Table-based layout for better email client compatibility (Gmail, Yahoo, Outlook)
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>Low Stock Alert</title>
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
                <h1 style="color: #e67e22; margin: 0 0 20px 0; font-size: 24px; font-weight: 600; line-height: 1.2;">⚠️ Low Stock Alert</h1>
                
                <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">This is an automated alert to notify you that a product is running low on stock.</p>
                
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; margin: 20px 0;">
                  <tr>
                    <td style="padding: 15px;">
                      <h2 style="margin: 0 0 15px 0; color: #856404; font-size: 18px; font-weight: 600;">Product Information</h2>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333; width: 150px;">Product Name:</td>
                          <td style="padding: 8px 0; color: #666666;">${productName}</td>
                        </tr>
                        ${
                          sku
                            ? `<tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333;">SKU:</td>
                          <td style="padding: 8px 0; color: #666666;">${sku}</td>
                        </tr>`
                            : ""
                        }
                        ${
                          category
                            ? `<tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333;">Category:</td>
                          <td style="padding: 8px 0; color: #666666;">${category}</td>
                        </tr>`
                            : ""
                        }
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333;">Current Quantity:</td>
                          <td style="padding: 8px 0; color: #e67e22; font-size: 18px; font-weight: 700;">${currentQuantity}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333;">Threshold:</td>
                          <td style="padding: 8px 0; color: #666666;">${threshold}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <p style="font-size: 14px; line-height: 1.6; color: #666666; margin: 20px 0 0 0;">
                  Please consider restocking this item to ensure continuous availability.
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
Low Stock Alert: ${productName}

This is an automated alert to notify you that a product is running low on stock.

Product Information:
- Product Name: ${productName}
${sku ? `- SKU: ${sku}\n` : ""}${
    category ? `- Category: ${category}\n` : ""
  }- Current Quantity: ${currentQuantity}
- Threshold: ${threshold}

Please consider restocking this item to ensure continuous availability.

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
 * Generate stock out notification email
 *
 * @param data - Stock out notification data
 * @returns EmailContent - Email content with HTML and text versions
 */
export function generateStockOutNotificationEmail(
  data: StockOutNotificationData
): EmailContent {
  const { productName, sku, category } = data;

  const subject = generateUniqueSubject(`Stock Out Alert: ${productName}`);

  // Table-based layout for better email client compatibility (Gmail, Yahoo, Outlook)
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>Stock Out Alert</title>
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
                <h1 style="color: #e74c3c; margin: 0 0 20px 0; font-size: 24px; font-weight: 600; line-height: 1.2;">🚨 Stock Out Alert</h1>
                
                <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 20px 0;">This is an urgent alert to notify you that a product is completely out of stock.</p>
                
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8d7da; border-left: 4px solid #dc3545; border-radius: 4px; margin: 20px 0;">
                  <tr>
                    <td style="padding: 15px;">
                      <h2 style="margin: 0 0 15px 0; color: #721c24; font-size: 18px; font-weight: 600;">Product Information</h2>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333; width: 150px;">Product Name:</td>
                          <td style="padding: 8px 0; color: #666666;">${productName}</td>
                        </tr>
                        ${
                          sku
                            ? `<tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333;">SKU:</td>
                          <td style="padding: 8px 0; color: #666666;">${sku}</td>
                        </tr>`
                            : ""
                        }
                        ${
                          category
                            ? `<tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333;">Category:</td>
                          <td style="padding: 8px 0; color: #666666;">${category}</td>
                        </tr>`
                            : ""
                        }
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #333333;">Status:</td>
                          <td style="padding: 8px 0; color: #e74c3c; font-size: 18px; font-weight: 700;">OUT OF STOCK</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <p style="font-size: 14px; line-height: 1.6; color: #666666; margin: 20px 0 0 0;">
                  <strong>Action Required:</strong> Please restock this item immediately to resume sales.
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
Stock Out Alert: ${productName}

This is an urgent alert to notify you that a product is completely out of stock.

Product Information:
- Product Name: ${productName}
${sku ? `- SKU: ${sku}\n` : ""}${
    category ? `- Category: ${category}\n` : ""
  }- Status: OUT OF STOCK

Action Required: Please restock this item immediately to resume sales.

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
 * Generate inventory report email
 *
 * @param data - Inventory report data
 * @returns EmailContent - Email content with HTML and text versions
 */
export function generateInventoryReportEmail(
  data: InventoryReportData
): EmailContent {
  const {
    totalProducts,
    totalValue,
    lowStockItems,
    outOfStockItems,
    reportDate,
    reportType,
  } = data;

  const baseSubject = `${
    reportType.charAt(0).toUpperCase() + reportType.slice(1)
  } Inventory Report - ${reportDate}`;
  const subject = generateUniqueSubject(baseSubject);

  const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inventory Report</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h1 style="color: #2c3e50; margin-top: 0; font-size: 24px;">📊 ${
        reportType.charAt(0).toUpperCase() + reportType.slice(1)
      } Inventory Report</h1>
      
      <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Report Date: ${reportDate}</p>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
        <div style="background: #e8f4f8; border-radius: 8px; padding: 20px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #3498db; margin-bottom: 5px;">${totalProducts}</div>
          <div style="font-size: 14px; color: #666;">Total Products</div>
        </div>
        <div style="background: #e8f8f5; border-radius: 8px; padding: 20px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #27ae60; margin-bottom: 5px;">$${totalValue.toLocaleString()}</div>
          <div style="font-size: 14px; color: #666;">Total Value</div>
        </div>
        <div style="background: #fff3cd; border-radius: 8px; padding: 20px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #f39c12; margin-bottom: 5px;">${lowStockItems}</div>
          <div style="font-size: 14px; color: #666;">Low Stock Items</div>
        </div>
        <div style="background: #f8d7da; border-radius: 8px; padding: 20px; text-align: center;">
          <div style="font-size: 32px; font-weight: bold; color: #e74c3c; margin-bottom: 5px;">${outOfStockItems}</div>
          <div style="font-size: 14px; color: #666;">Out of Stock</div>
        </div>
      </div>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="font-size: 12px; color: #999; margin: 0;">
        This is an automated email from Stock Inventory Management. Please do not reply to this email.
      </p>
    </div>
  </body>
</html>
  `.trim();

  const textContent = `
${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Inventory Report
Report Date: ${reportDate}

Summary:
- Total Products: ${totalProducts}
- Total Value: $${totalValue.toLocaleString()}
- Low Stock Items: ${lowStockItems}
- Out of Stock: ${outOfStockItems}

---
This is an automated email from Stock Inventory Management. Please do not reply to this email.
  `.trim();

  return {
    subject,
    htmlContent,
    textContent,
  };
}
