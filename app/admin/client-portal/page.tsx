import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { getClientPortalForAdmin } from "@/lib/server/client-portal-data";
import AdminClientPortalContent from "@/components/admin/AdminClientPortalContent";

/**
 * Admin Client Portal page — dashboard for viewing client (role=client) users,
 * their orders, invoices, and activity. Admin-only.
 */
export default async function AdminClientPortalPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/admin");
  const initialStats = await getClientPortalForAdmin();
  return <AdminClientPortalContent initialStats={initialStats} />;
}
