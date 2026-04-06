/**
 * Server-side admin counts for sidebar badges.
 * Used by GET /api/admin/counts. Only import from server code.
 */

import { prisma } from "@/prisma/client";
import { getSuppliersForAdminIncludingDemo } from "@/prisma/supplier";
import type { AdminCounts } from "@/types";

/**
 * Get counts for admin sidebar: orders, invoices, support tickets, product reviews,
 * products, warehouses, suppliers, clients, users.
 * Client orders/invoices and product reviews: scoped to product owner (userId).
 * Products, warehouses: scoped to this admin (userId).
 * Suppliers: own + Demo Supplier (same as Supplier Portal and GET /api/suppliers).
 * Clients: users with role client. Users: all users (user management).
 */
export async function getAdminCounts(userId: string): Promise<AdminCounts> {
  const [clientOrderIds, supportTicketsCount, productIdsOwned, productsCount, warehousesCount, suppliersForAdmin, clientsCount, usersCount] =
    await Promise.all([
      getClientOrderIdsForProductOwner(userId),
      prisma.supportTicket.count({ where: { assignedToId: userId } }),
      prisma.product.findMany({
        where: { userId },
        select: { id: true },
      }).then((rows) => rows.map((p) => p.id)),
      prisma.product.count({ where: { userId } }),
      prisma.warehouse.count({ where: { userId } }),
      getSuppliersForAdminIncludingDemo(userId),
      prisma.user.count({ where: { role: "client" } }),
      prisma.user.count(),
    ]);

  const suppliersCount = suppliersForAdmin.length;

  const productReviewsCountForOwner =
    productIdsOwned.length > 0
      ? await prisma.productReview.count({
          where: { productId: { in: productIdsOwned } },
        })
      : 0;

  const clientOrdersCount = clientOrderIds.length;
  const clientInvoicesCount =
    clientOrderIds.length > 0
      ? await prisma.invoice.count({
          where: { orderId: { in: clientOrderIds } },
        })
      : 0;

  return {
    clientOrders: clientOrdersCount,
    clientInvoices: clientInvoicesCount,
    supportTickets: supportTicketsCount,
    productReviews: productReviewsCountForOwner,
    products: productsCount,
    warehouses: warehousesCount,
    suppliers: suppliersCount,
    clients: clientsCount,
    users: usersCount,
  };
}

async function getClientOrderIdsForProductOwner(
  productOwnerUserId: string,
): Promise<string[]> {
  const orderItems = await prisma.orderItem.findMany({
    where: {
      product: {
        userId: productOwnerUserId,
      },
    },
    select: { orderId: true },
    distinct: ["orderId"],
  });
  return orderItems.map((o) => o.orderId);
}
