import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import SupplierDetailPage from "@/components/Pages/SupplierDetailPage";

/**
 * Admin supplier detail — same SupplierDetailPage under admin layout.
 * Back button will go to previous page (e.g. /admin/supplier-portal or /suppliers).
 */
export default async function AdminSupplierDetailPage() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  return <SupplierDetailPage embedInAdmin />;
}
