import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import AdminLayout from "@/components/layouts/AdminLayout";

/**
 * Admin layout — all /admin/* routes share Navbar + AdminSidebar.
 * Requires authenticated user.
 */
export default async function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  return <AdminLayout>{children}</AdminLayout>;
}
