/**
 * Category Detail API Route Handler
 * App Router route handler for individual category operations (GET)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { logger } from "@/lib/logger";
import { getCategoryById } from "@/prisma/category";
import { getCache, setCache, invalidateCache, cacheKeys } from "@/lib/cache";
import { withRateLimit, defaultRateLimits } from "@/lib/api/rate-limit";
import { prisma } from "@/prisma/client";

/**
 * GET /api/categories/:id
 * Get category details by ID with all related data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting check
    const rateLimitResponse = await withRateLimit(
      request,
      defaultRateLimits.standard
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
    const isClient = session.role === "client";

    // Check cache first
    const cacheKey = cacheKeys.categories.detail(id);
    const cachedCategory = await getCache<unknown>(cacheKey);
    if (cachedCategory) {
      logger.info(`✅ Cache hit for category: ${cacheKey}`);
      return NextResponse.json(cachedCategory);
    }

    // Cache miss: fetch from database
    logger.info(`❌ Cache miss for category: ${cacheKey} - fetching from database`);

    // Fetch category (admin or client: any by id; else own by userId)
    const category =
      isAdmin || isClient
        ? await prisma.category.findUnique({ where: { id } })
        : await getCategoryById(id, userId);

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Fetch all products in this category
    const products = await prisma.product.findMany({
      where: {
        categoryId: category.id,
        ...(isClient ? {} : { userId }), // Client: all products in category; admin: only user's products
      },
      include: {
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
        },
      },
    });

    // Calculate statistics from products and their order items
    const totalProducts = products.length;
    let totalQuantitySold = 0;
    let totalRevenue = 0;
    const orderMap = new Map<string, { orderNumber: string; status: string; total: number; createdAt: Date }>();

    products.forEach((product) => {
      product.orderItems?.forEach((item) => {
        totalQuantitySold += item.quantity;
        const order = item.order as { subtotal?: number; total: number };
        const orderSubtotal = order.subtotal ?? 0;
        const share =
          orderSubtotal > 0
            ? (item.subtotal / orderSubtotal) * order.total
            : item.subtotal;
        totalRevenue += share;
        // Track unique orders
        if (item.order && !orderMap.has(item.order.id)) {
          orderMap.set(item.order.id, {
            orderNumber: item.order.orderNumber,
            status: item.order.status,
            total: item.order.total,
            createdAt: item.order.createdAt,
          });
        }
      });
    });

    // Calculate total value of all products in this category
    const totalValue = products.reduce(
      (sum, product) => sum + Number(product.price) * Number(product.quantity),
      0
    );

    // Fetch creator and updater user details (for email)
    const [creatorUser, updaterUser] = await Promise.all([
      category.createdBy
        ? prisma.user.findUnique({
            where: { id: category.createdBy },
            select: { id: true, email: true, name: true },
          })
        : null,
      category.updatedBy
        ? prisma.user.findUnique({
            where: { id: category.updatedBy },
            select: { id: true, email: true, name: true },
          })
        : null,
    ]);

    // Get recent order items from products in this category
    const allOrderItems = products.flatMap((product) =>
      (product.orderItems || []).map((item) => {
        const order = item.order as { subtotal?: number; total: number } | null;
        const orderSubtotal = order?.subtotal ?? 0;
        const orderTotal = order?.total ?? 0;
        const proportionalAmount =
          orderSubtotal > 0
            ? (item.subtotal / orderSubtotal) * orderTotal
            : item.subtotal;
        return {
          id: item.id,
          orderId: item.order?.id || "",
          orderNumber: item.order?.orderNumber || "",
          orderStatus: item.order?.status || "",
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
          proportionalAmount,
          orderTotal,
          orderDate: item.order?.createdAt || item.createdAt,
          createdAt: item.createdAt,
        };
      })
    );

    // Sort by order date (most recent first) and take top 10
    const recentOrders = allOrderItems
      .sort((a, b) => {
        const dateA = new Date(a.orderDate).getTime();
        const dateB = new Date(b.orderDate).getTime();
        return dateB - dateA;
      })
      .slice(0, 10);

    // Transform category for response
    const transformedCategory = {
      id: category.id,
      name: category.name,
      status: category.status,
      description: category.description || null,
      notes: category.notes || null,
      userId: category.userId,
      createdBy: category.createdBy,
      updatedBy: category.updatedBy || null,
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
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt?.toISOString() || null,
      // Statistics
      statistics: {
        totalProducts,
        totalQuantitySold,
        totalRevenue,
        uniqueOrders: orderMap.size,
        totalValue, // Current stock value of all products in this category
      },
      // Products in this category
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: Number(product.price),
        quantity: Number(product.quantity),
        status: product.status,
        imageUrl: product.imageUrl || null,
      })),
      // Recent orders containing products in this category
      recentOrders,
    };

    // Cache the result for 5 minutes
    await setCache(cacheKey, transformedCategory, 300);

    return NextResponse.json(transformedCategory);
  } catch (error) {
    logger.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}