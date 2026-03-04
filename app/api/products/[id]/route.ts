/**
 * Product Detail API Route Handler
 * App Router route handler for individual product operations (GET)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { logger } from "@/lib/logger";
import { getProductById } from "@/prisma/product";
import { getSupplierByUserId } from "@/prisma/supplier";
import { getCache, setCache, invalidateCache, cacheKeys } from "@/lib/cache";
import { withRateLimit, defaultRateLimits } from "@/lib/api/rate-limit";
import { prisma } from "@/prisma/client";

/**
 * GET /api/products/:id
 * Get product details by ID with all related data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Rate limiting check
    const rateLimitResponse = await withRateLimit(
      request,
      defaultRateLimits.standard,
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.id;
    const isAdmin = session.role === "admin";
    const isSupplier = session.role === "supplier";
    const isClient = session.role === "client";

    // Check cache first
    const cacheKey = cacheKeys.products.detail(id);
    const cachedProduct = await getCache<unknown>(cacheKey);
    if (cachedProduct) {
      logger.info(`✅ Cache hit for product: ${cacheKey}`);
      return NextResponse.json(cachedProduct);
    }

    // Cache miss: fetch from database
    logger.info(
      `❌ Cache miss for product: ${cacheKey} - fetching from database`,
    );

    // Fetch product (admin: any by id; supplier: by supplierId; client: any by id; else: own by userId)
    let product: Awaited<ReturnType<typeof getProductById>> | null;
    const productInclude = {
      orderItems: {
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              subtotal: true,
              total: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" as const },
      },
    };
    if (isAdmin) {
      product = await prisma.product.findFirst({
        where: { id },
        include: productInclude,
      });
    } else if (isSupplier) {
      const supplier = await getSupplierByUserId(userId);
      if (!supplier) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      product = await prisma.product.findFirst({
        where: { id, supplierId: supplier.id },
        include: productInclude,
      });
    } else if (isClient) {
      product = await prisma.product.findFirst({
        where: { id },
        include: productInclude,
      });
    } else {
      product = await getProductById(id, userId);
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Fetch category and supplier details
    const [category, supplier] = await Promise.all([
      prisma.category.findUnique({
        where: { id: product.categoryId },
        select: { id: true, name: true, description: true, status: true },
      }),
      prisma.supplier.findUnique({
        where: { id: product.supplierId },
        select: { id: true, name: true, description: true, status: true },
      }),
    ]);

    // Fetch creator and updater user details (for email)
    const [creatorUser, updaterUser] = await Promise.all([
      product.createdBy
        ? prisma.user.findUnique({
            where: { id: product.createdBy },
            select: { id: true, email: true, name: true },
          })
        : null,
      product.updatedBy
        ? prisma.user.findUnique({
            where: { id: product.updatedBy },
            select: { id: true, email: true, name: true },
          })
        : null,
    ]);

    // Calculate statistics from order items
    const orderItems = product.orderItems || [];
    const totalQuantitySold = orderItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    // Revenue = product's proportional share of order total (includes tax, shipping, discount)
    const totalRevenue = orderItems.reduce((sum, item) => {
      const order = item.order as { subtotal?: number; total: number };
      const orderSubtotal = order.subtotal ?? 0;
      const share =
        orderSubtotal > 0
          ? (item.subtotal / orderSubtotal) * order.total
          : item.subtotal;
      return sum + share;
    }, 0);
    const uniqueOrders = new Set(orderItems.map((item) => item.orderId)).size;

    // Transform product for response
    const transformedProduct = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: Number(product.price),
      quantity: Number(product.quantity),
      reservedQuantity: Number(product.reservedQuantity ?? 0),
      status: product.status,
      categoryId: product.categoryId,
      supplierId: product.supplierId,
      category: category
        ? {
            id: category.id,
            name: category.name,
            description: category.description,
            status: category.status,
          }
        : null,
      supplier: supplier
        ? {
            id: supplier.id,
            name: supplier.name,
            description: supplier.description,
            status: supplier.status,
          }
        : null,
      userId: product.userId,
      createdBy: product.createdBy,
      updatedBy: product.updatedBy || null,
      creator: creatorUser
        ? {
            id: creatorUser.id,
            email: creatorUser.email,
            name: creatorUser.name,
          }
        : null,
      updater: updaterUser
        ? {
            id: updaterUser.id,
            email: updaterUser.email,
            name: updaterUser.name,
          }
        : null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt?.toISOString() || null,
      qrCodeUrl: product.qrCodeUrl || null,
      qrCodeFileId: product.qrCodeFileId || null,
      imageUrl: product.imageUrl || null,
      imageFileId: product.imageFileId || null,
      expirationDate: product.expirationDate?.toISOString() || null,
      // Statistics
      statistics: {
        totalQuantitySold,
        totalRevenue,
        uniqueOrders,
        totalValue: Number(product.price) * Number(product.quantity), // Current stock value
      },
      // Recent orders containing this product
      recentOrders: orderItems.slice(0, 10).map((item) => {
        const order = item.order as { subtotal?: number; total: number };
        const orderSubtotal = order.subtotal ?? 0;
        const proportionalAmount =
          orderSubtotal > 0
            ? (item.subtotal / orderSubtotal) * order.total
            : item.subtotal;
        return {
          id: item.id,
          orderId: item.order.id,
          orderNumber: item.order.orderNumber,
          orderStatus: item.order.status,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
          proportionalAmount,
          orderTotal: order.total,
          orderDate: item.order.createdAt.toISOString(),
        };
      }),
    };

    // Cache the result for 5 minutes
    await setCache(cacheKey, transformedProduct, 300);

    return NextResponse.json(transformedProduct);
  } catch (error) {
    logger.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}
