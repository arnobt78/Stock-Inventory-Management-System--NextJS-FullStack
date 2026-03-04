import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import AdminUserManagementDetailContent from "@/components/admin/AdminUserManagementDetailContent";

/**
 * Admin User Management detail — view and edit a user. Admin-only.
 * Layout from app/admin/layout.tsx.
 */
export default async function AdminUserManagementDetailPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/admin");
  return <AdminUserManagementDetailContent />;
}
