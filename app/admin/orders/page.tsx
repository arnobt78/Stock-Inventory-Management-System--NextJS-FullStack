import { getSession } from "@/lib/auth-server";
import AdminCombinedOrdersContent from "@/components/admin/AdminCombinedOrdersContent";

/**
 * Admin Orders — combined personal + client orders with Order type filter (My Store).
 */
export default async function AdminOrdersPage() {
  const user = await getSession();
  if (!user) return null;
  return <AdminCombinedOrdersContent />;
}
