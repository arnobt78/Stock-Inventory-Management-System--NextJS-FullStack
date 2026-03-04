/**
 * Server-side data fetching for invoices page SSR
 * Fetches invoices using the same logic and cache as GET /api/invoices (no filters).
 * Only import this from server code (e.g. app/invoices/page.tsx).
 */

import { getCache, setCache, cacheKeys } from "@/lib/cache";
import { getInvoicesByUser, getInvoicesByClientId, getInvoicesByOrderIds } from "@/prisma/invoice";
import { getOrdersContainingProductOwnerProducts } from "@/prisma/order";
import { prisma } from "@/prisma/client";

/** Invoice shape returned by invoices API GET (dates as ISO strings) */
export type InvoiceForPage = {
  id: string;
  invoiceNumber: string;
  orderId: string;
  userId: string;
  clientId: string | null;
  status: string;
  subtotal: number;
  tax: number | null;
  shipping: number | null;
  discount: number | null;
  total: number;
  amountPaid: number;
  amountDue: number;
  dueDate: string;
  issuedAt: string;
  sentAt: string | null;
  paidAt: string | null;
  cancelledAt: string | null;
  paymentLink: string | null;
  notes: string | null;
  billingAddress: unknown;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
  /** Client/customer display name (for admin list; from order shipping or placer) */
  customerDisplay?: string | null;
};

/**
 * Fetch invoices for the given user (no filters — default list view).
 * Uses the same cache key as GET /api/invoices with empty filters so Redis is shared.
 */
export async function getInvoicesForUser(
  userId: string
): Promise<InvoiceForPage[]> {
  const filters = {};
  const cacheKey = cacheKeys.invoices.list(filters);
  const cached = await getCache<InvoiceForPage[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const invoices = await getInvoicesByUser(userId, undefined);

  const transformed: InvoiceForPage[] = invoices.map((invoice) => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    orderId: invoice.orderId,
    userId: invoice.userId,
    clientId: invoice.clientId ?? null,
    status: invoice.status,
    subtotal: invoice.subtotal,
    tax: invoice.tax ?? null,
    shipping: invoice.shipping ?? null,
    discount: invoice.discount ?? null,
    total: invoice.total,
    amountPaid: invoice.amountPaid,
    amountDue: invoice.amountDue,
    dueDate: invoice.dueDate.toISOString(),
    issuedAt: invoice.issuedAt.toISOString(),
    sentAt: invoice.sentAt?.toISOString() || null,
    paidAt: invoice.paidAt?.toISOString() || null,
    cancelledAt: invoice.cancelledAt?.toISOString() || null,
    paymentLink: invoice.paymentLink,
    notes: invoice.notes,
    billingAddress: invoice.billingAddress,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt?.toISOString() || null,
    createdBy: invoice.createdBy,
    updatedBy: invoice.updatedBy,
  }));

  await setCache(cacheKey, transformed, 300);
  return transformed;
}

/**
 * Fetch invoices where the given user is the client (clientId = clientUserId).
 * Used for client role on /invoices page SSR.
 */
export async function getInvoicesForClientId(
  clientUserId: string,
): Promise<InvoiceForPage[]> {
  const cacheKey = cacheKeys.invoices.list({
    byClient: true,
    userId: clientUserId,
  });
  const cached = await getCache<InvoiceForPage[]>(cacheKey);
  if (cached) return cached;

  const invoices = await getInvoicesByClientId(clientUserId, undefined);
  const transformed: InvoiceForPage[] = invoices.map((invoice) => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    orderId: invoice.orderId,
    userId: invoice.userId,
    clientId: invoice.clientId ?? null,
    status: invoice.status,
    subtotal: invoice.subtotal,
    tax: invoice.tax ?? null,
    shipping: invoice.shipping ?? null,
    discount: invoice.discount ?? null,
    total: invoice.total,
    amountPaid: invoice.amountPaid,
    amountDue: invoice.amountDue,
    dueDate: invoice.dueDate.toISOString(),
    issuedAt: invoice.issuedAt.toISOString(),
    sentAt: invoice.sentAt?.toISOString() || null,
    paidAt: invoice.paidAt?.toISOString() || null,
    cancelledAt: invoice.cancelledAt?.toISOString() || null,
    paymentLink: invoice.paymentLink,
    notes: invoice.notes,
    billingAddress: invoice.billingAddress,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt?.toISOString() || null,
    createdBy: invoice.createdBy,
    updatedBy: invoice.updatedBy,
  }));

  await setCache(cacheKey, transformed, 300);
  return transformed;
}

/**
 * Fetch invoices for orders that contain products owned by the given user (product owner).
 * Used for admin "Client Invoices" list.
 */
export async function getClientInvoicesForProductOwner(
  productOwnerUserId: string,
): Promise<InvoiceForPage[]> {
  const cacheKey = cacheKeys.invoices.list({
    productOwnerId: productOwnerUserId,
  });
  const cached = await getCache<InvoiceForPage[]>(cacheKey);
  if (cached) return cached;

  const orders = await getOrdersContainingProductOwnerProducts(
    productOwnerUserId,
  );
  const orderIds = orders.map((o) => o.id);
  const invoices = await getInvoicesByOrderIds(orderIds);

  const userIds = [...new Set(orders.map((o) => o.userId))];
  const users =
    userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        })
      : [];
  const userMap = new Map(users.map((u) => [u.id, u]));

  const orderCustomerDisplay = new Map<string, string>();
  for (const order of orders) {
    const addr = order.shippingAddress as { name?: string; email?: string } | null | undefined;
    const name = addr?.name ?? addr?.email ?? null;
    const u = userMap.get(order.userId);
    const placedByName = u?.name ?? u?.email ?? null;
    orderCustomerDisplay.set(order.id, name ?? placedByName ?? "Client");
  }

  const transformed: InvoiceForPage[] = invoices.map((invoice) => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    orderId: invoice.orderId,
    userId: invoice.userId,
    clientId: invoice.clientId ?? null,
    status: invoice.status,
    subtotal: invoice.subtotal,
    tax: invoice.tax ?? null,
    shipping: invoice.shipping ?? null,
    discount: invoice.discount ?? null,
    total: invoice.total,
    amountPaid: invoice.amountPaid,
    amountDue: invoice.amountDue,
    dueDate: invoice.dueDate.toISOString(),
    issuedAt: invoice.issuedAt.toISOString(),
    sentAt: invoice.sentAt?.toISOString() || null,
    paidAt: invoice.paidAt?.toISOString() || null,
    cancelledAt: invoice.cancelledAt?.toISOString() || null,
    paymentLink: invoice.paymentLink,
    notes: invoice.notes,
    billingAddress: invoice.billingAddress,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt?.toISOString() || null,
    createdBy: invoice.createdBy,
    updatedBy: invoice.updatedBy,
    customerDisplay: orderCustomerDisplay.get(invoice.orderId) ?? null,
  }));

  await setCache(cacheKey, transformed, 300);
  return transformed;
}
