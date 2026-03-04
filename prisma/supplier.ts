import { logger } from "@/lib/logger";
import { prisma } from "@/prisma/client";

/** Email of the global demo supplier user (test@supplier.com). Used so all admins see Demo Supplier in dropdowns. */
const DEMO_SUPPLIER_EMAIL = "test@supplier.com";

/**
 * User id of the demo supplier account (test@supplier.com), if it exists.
 * Suppliers linked to this user are shown to all admins as "global" demo options.
 */
export async function getDemoSupplierUserId(): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_SUPPLIER_EMAIL },
    select: { id: true },
  });
  return user?.id ?? null;
}

/**
 * Fetch suppliers for an admin/user: their own plus the global Demo Supplier (linked to test@supplier.com).
 * So every admin sees at least the demo supplier in product dropdown and suppliers list.
 */
export async function getSuppliersForAdminIncludingDemo(
  userId: string,
): Promise<Awaited<ReturnType<typeof getSuppliersByUser>>> {
  const demoUserId = await getDemoSupplierUserId();
  const where =
    demoUserId != null
      ? { OR: [{ userId }, { userId: demoUserId }] }
      : { userId };
  return prisma.supplier.findMany({
    where,
    orderBy: { name: "asc" },
  });
}

/**
 * Create a new supplier with audit fields
 */
export const createSupplier = async (data: {
  name: string;
  userId: string;
}) => {
  logger.debug("Creating supplier with data:", data);
  return prisma.supplier.create({
    data: {
      name: data.name,
      userId: data.userId,
      createdBy: data.userId, // Set createdBy same as userId
      createdAt: new Date(),
    },
  });
};

export const getSuppliersByUser = async (userId: string) => {
  return prisma.supplier.findMany({
    where: { userId },
  });
};

/**
 * Get the supplier entity linked to a supplier user (userId = supplier user id).
 * Used for role=supplier to resolve supplierId for "My Products" / "View Orders".
 * Returns null if no supplier is linked (e.g. supplier user not yet linked).
 */
export async function getSupplierByUserId(userId: string) {
  return prisma.supplier.findFirst({
    where: { userId },
    select: { id: true, name: true },
  });
}

/**
 * Get supplier by ID with all related data
 * Fetches a single supplier with products and related order items
 *
 * @param supplierId - Supplier ID
 * @param userId - User ID (for authorization check)
 * @returns Promise<Supplier | null> - Supplier or null if not found
 */
export const getSupplierById = async (supplierId: string, userId: string) => {
  return prisma.supplier.findFirst({
    where: {
      id: supplierId,
      userId, // Ensure user can only access their own suppliers
    },
    // Note: Products relation is not directly defined in schema;
    // we fetch products separately in the API route
  });
};

/**
 * Update a supplier with audit fields
 */
export const updateSupplier = async (
  id: string,
  data: { name?: string; updatedBy?: string }
) => {
  return prisma.supplier.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.updatedBy && { updatedBy: data.updatedBy }),
      updatedAt: new Date(), // Always update timestamp
    },
  });
};

export const deleteSupplier = async (id: string) => {
  return prisma.supplier.delete({
    where: { id },
  });
};
