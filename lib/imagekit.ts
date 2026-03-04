/**
 * ImageKit Utility
 * Centralized ImageKit integration for uploading and managing images
 * Uses @imagekit/nodejs SDK for server-side operations
 */

import ImageKit, { toFile } from "@imagekit/nodejs";

/**
 * Get ImageKit instance (lazy initialization)
 * Initializes only when needed to avoid build-time errors
 */
function getImageKitInstance(): ImageKit {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error(
      "ImageKit credentials are missing. Please set IMAGEKIT_PRIVATE_KEY environment variable."
    );
  }

  return new ImageKit({ privateKey });
}

/**
 * Upload QR code image to ImageKit
 * @param file - Base64 encoded image data or Buffer
 * @param fileName - Name for the uploaded file (e.g., product SKU)
 * @param folder - Folder path in ImageKit (default: /stock-inventory/qr-codes/)
 * @returns Promise with ImageKit upload result containing URL
 */
export async function uploadQRCodeToImageKit(
  file: string | Buffer,
  fileName: string,
  folder: string = "/stock-inventory/qr-codes/"
): Promise<{ url: string; fileId: string }> {
  try {
    const imagekit = getImageKitInstance();

    // Ensure fileName is safe (remove special characters, add .png extension)
    const safeFileName = `${fileName.replace(/[^a-zA-Z0-9-_]/g, "_")}.png`;

    const filePayload =
      typeof file === "string"
        ? await toFile(Buffer.from(file, "base64"), safeFileName)
        : await toFile(file, safeFileName);

    const result = await imagekit.files.upload({
      file: filePayload,
      fileName: safeFileName,
      folder,
      useUniqueFileName: true,
      overwriteFile: false,
    });

    if (!result.url || !result.fileId) {
      throw new Error("ImageKit upload failed: Missing URL or fileId");
    }

    return {
      url: result.url,
      fileId: result.fileId,
    };
  } catch (error) {
    throw new Error(
      `Failed to upload QR code to ImageKit: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Delete QR code image from ImageKit
 * @param fileId - ImageKit file ID
 * @returns Promise<void>
 */
export async function deleteQRCodeFromImageKit(fileId: string): Promise<void> {
  try {
    const imagekit = getImageKitInstance();
    await imagekit.files.delete(fileId);
  } catch (error) {
    throw new Error(
      `Failed to delete QR code from ImageKit: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Generate QR code data URL (base64)
 * This is a helper function that can be used server-side
 * @param data - Data to encode in QR code
 * @param size - QR code size in pixels (default: 200)
 * @returns Promise with base64 data URL
 */
export async function generateQRCodeDataURL(
  data: string,
  size: number = 200
): Promise<string> {
  // Dynamic import of qrcode for server-side use
  const QRCode = (await import("qrcode")).default;

  return QRCode.toDataURL(data, {
    width: size,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
}

/**
 * Generate and upload QR code to ImageKit in one step
 * @param data - Data to encode in QR code
 * @param fileName - Name for the uploaded file
 * @param size - QR code size in pixels (default: 200)
 * @param folder - Folder path in ImageKit (default: /stock-inventory/qr-codes/)
 * @returns Promise with ImageKit URL and fileId
 */
export async function generateAndUploadQRCode(
  data: string,
  fileName: string,
  size: number = 200,
  folder: string = "/stock-inventory/qr-codes/"
): Promise<{ url: string; fileId: string }> {
  // Generate QR code as base64
  const qrCodeDataURL = await generateQRCodeDataURL(data, size);

  // Convert data URL to buffer for ImageKit
  // Remove data:image/png;base64, prefix
  const base64Data = qrCodeDataURL.split(",")[1];
  if (!base64Data) {
    throw new Error("Failed to generate QR code data");
  }
  const buffer = Buffer.from(base64Data, "base64");

  // Upload to ImageKit
  const result = await uploadQRCodeToImageKit(buffer, fileName, folder);

  return {
    url: result.url,
    fileId: result.fileId,
  };
}

/**
 * Upload product image to ImageKit
 * @param file - File buffer or base64 string
 * @param fileName - Name for the uploaded file (e.g., product SKU)
 * @param folder - Folder path in ImageKit (default: /stock-inventory/products/)
 * @returns Promise with ImageKit upload result containing URL and fileId
 */
export async function uploadProductImageToImageKit(
  file: string | Buffer,
  fileName: string,
  folder: string = "/stock-inventory/products/"
): Promise<{ url: string; fileId: string }> {
  try {
    const imagekit = getImageKitInstance();

    const safeFileName = fileName.replace(/[^a-zA-Z0-9-_.]/g, "_");
    const filePayload =
      typeof file === "string"
        ? await toFile(Buffer.from(file, "base64"), safeFileName)
        : await toFile(file, safeFileName);

    const result = await imagekit.files.upload({
      file: filePayload,
      fileName: safeFileName,
      folder,
      useUniqueFileName: true,
      overwriteFile: false,
    });

    if (!result.url || !result.fileId) {
      throw new Error("ImageKit upload failed: Missing URL or fileId");
    }

    return {
      url: result.url,
      fileId: result.fileId,
    };
  } catch (error) {
    throw new Error(
      `Failed to upload product image to ImageKit: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Delete product image from ImageKit
 * @param fileId - ImageKit file ID
 * @returns Promise<void>
 */
export async function deleteProductImageFromImageKit(
  fileId: string
): Promise<void> {
  try {
    const imagekit = getImageKitInstance();
    await imagekit.files.delete(fileId);
  } catch (error) {
    throw new Error(
      `Failed to delete product image from ImageKit: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
