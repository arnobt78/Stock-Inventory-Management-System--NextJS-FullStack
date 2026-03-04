/**
 * Client Portal Catalog API Route
 * GET /api/portal/client/catalog — read-only catalog (suppliers, categories, products) for client role
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { logger } from "@/lib/logger";
import { getCache, setCache } from "@/lib/cache";
import { withRateLimit, defaultRateLimits } from "@/lib/api/rate-limit";
import { prisma } from "@/prisma/client";
import type { ClientCatalogOverview } from "@/types";

const CATALOG_LIMIT_SUPPLIERS = 30;
const CATALOG_LIMIT_CATEGORIES = 30;
const CATALOG_LIMIT_PRODUCTS = 50;
const CACHE_TTL = 300; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rateLimitResponse = await withRateLimit(
      request,
      defaultRateLimits.standard,
      session.id,
    );
    if (rateLimitResponse) return rateLimitResponse;

    if (session.role !== "client") {
      return NextResponse.json(
        { error: "Access denied. Client role required." },
        { status: 403 },
      );
    }

    const cacheKey = `portal:client:catalog:${session.id}`;
    const cached = await getCache<ClientCatalogOverview>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const [suppliers, categories, products] = await Promise.all([
      prisma.supplier.findMany({
        orderBy: { name: "asc" },
        take: CATALOG_LIMIT_SUPPLIERS,
        select: { id: true, name: true, status: true },
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
        take: CATALOG_LIMIT_CATEGORIES,
        select: { id: true, name: true, status: true, userId: true },
      }),
      prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        take: CATALOG_LIMIT_PRODUCTS,
        select: {
          id: true,
          name: true,
          sku: true,
          price: true,
          status: true,
          categoryId: true,
          supplierId: true,
          userId: true,
        },
      }),
    ]);

    const categoryIds = [...new Set(products.map((p) => p.categoryId))];
    const supplierIds = [...new Set(products.map((p) => p.supplierId))];
    const creatorIds = [
      ...new Set([
        ...categories.map((c) => c.userId),
        ...products.map((p) => p.userId),
      ]),
    ];
    const [categoryList, supplierList, supplierCounts, categoryCounts, users] =
      await Promise.all([
        prisma.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true },
        }),
        prisma.supplier.findMany({
          where: { id: { in: supplierIds } },
          select: { id: true, name: true },
        }),
        prisma.product.groupBy({
          by: ["supplierId"],
          _count: { id: true },
        }),
        prisma.product.groupBy({
          by: ["categoryId"],
          _count: { id: true },
        }),
        prisma.user.findMany({
          where: { id: { in: creatorIds } },
          select: { id: true, name: true },
        }),
      ]);
    const categoryMap = new Map(categoryList.map((c) => [c.id, c.name]));
    const supplierMap = new Map(supplierList.map((s) => [s.id, s.name]));
    const userMap = new Map(users.map((u) => [u.id, u.name]));
    const productCountBySupplier = new Map(
      supplierCounts.map((s) => [s.supplierId, s._count.id]),
    );
    const productCountByCategory = new Map(
      categoryCounts.map((c) => [c.categoryId, c._count.id]),
    );

    const overview: ClientCatalogOverview = {
      suppliers: suppliers.map((s) => ({
        id: s.id,
        name: s.name,
        status: s.status ? "Active" : "Inactive",
        productCount: productCountBySupplier.get(s.id) ?? 0,
      })),
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        status: c.status ? "Active" : "Inactive",
        productCount: productCountByCategory.get(c.id) ?? 0,
        categoryCreatorId: c.userId,
        categoryCreatorName: userMap.get(c.userId) ?? null,
      })),
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        categoryId: p.categoryId,
        categoryName: categoryMap.get(p.categoryId) ?? "—",
        supplierId: p.supplierId,
        supplierName: supplierMap.get(p.supplierId) ?? "—",
        price: Number(p.price),
        status: p.status,
        productOwnerId: p.userId,
        productOwnerName: userMap.get(p.userId) ?? null,
      })),
    };

    await setCache(cacheKey, overview, CACHE_TTL);
    return NextResponse.json(overview);
  } catch (error) {
    logger.error("Error fetching client catalog:", error);
    return NextResponse.json(
      { error: "Failed to fetch catalog" },
      { status: 500 },
    );
  }
}
