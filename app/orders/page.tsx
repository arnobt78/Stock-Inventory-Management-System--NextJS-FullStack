import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import OrdersPage from "@/components/Pages/OrdersPage";
import {
  getOrdersForUser,
  getOrdersForClientId,
  getOrdersForSupplierId,
} from "@/lib/server/orders-data";
import { getSupplierByUserId } from "@/prisma/supplier";

/**
 * Orders route — server component.
 * If user is not logged in, redirect to login. Otherwise fetch orders on the server
 * and pass to OrdersPage so the client can hydrate React Query in one round-trip.
 * Client: orders where they are the customer. Supplier: orders that contain their products. Admin: orders they created.
 */
export default async function OrdersRoute() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  let initialOrders;
  if (user.role === "client") {
    initialOrders = await getOrdersForClientId(user.id);
  } else if (user.role === "supplier") {
    const supplier = await getSupplierByUserId(user.id);
    initialOrders = supplier
      ? await getOrdersForSupplierId(supplier.id)
      : [];
  } else {
    initialOrders = await getOrdersForUser(user.id);
  }
  return (
    <OrdersPage initialOrders={initialOrders} userRole={user.role ?? undefined} />
  );
}
