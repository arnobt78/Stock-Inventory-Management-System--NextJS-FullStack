import { getSession } from "@/lib/auth-server";
import AdminCombinedInvoicesContent from "@/components/admin/AdminCombinedInvoicesContent";

/**
 * Admin Invoices — combined personal + client invoices with Invoice type filter (My Store).
 */
export default async function AdminInvoicesPage() {
  const user = await getSession();
  if (!user) return null;
  return <AdminCombinedInvoicesContent />;
}
