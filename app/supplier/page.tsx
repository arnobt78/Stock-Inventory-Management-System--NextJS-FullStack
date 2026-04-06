import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import SupplierPortalPage from "@/components/Pages/SupplierPortalPage";

/**
 * Supplier Portal route — server component.
 * Only users with role="supplier" or "admin" can access this page.
 */
export default async function SupplierPortalRoute() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  // Allow supplier and admin roles
  if (user.role !== "supplier" && user.role !== "admin") {
    redirect("/");
  }
  return <SupplierPortalPage />;
}
