import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { getSupplierPortalForAdmin } from "@/lib/server/supplier-portal-data";
import AdminSupplierPortalContent from "@/components/admin/AdminSupplierPortalContent";

/**
 * Admin Supplier Portal page — dashboard for viewing supplier entities,
 * their products, orders, and activity. Admin-only.
 */
export default async function AdminSupplierPortalPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/admin");
  const initialStats = await getSupplierPortalForAdmin(user.id);
  return <AdminSupplierPortalContent initialStats={initialStats} />;
}
