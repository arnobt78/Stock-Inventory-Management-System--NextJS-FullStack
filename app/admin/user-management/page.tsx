import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { getUsersForAdmin } from "@/lib/server/users-data";
import AdminUserManagementContent from "@/components/admin/AdminUserManagementContent";

/**
 * Admin User Management page — list users, link to detail.
 * Admin-only. Server fetches users. Layout from app/admin/layout.tsx.
 */
export default async function AdminUserManagementPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/admin");
  const initialUsers = await getUsersForAdmin();
  return <AdminUserManagementContent initialUsers={initialUsers} />;
}
