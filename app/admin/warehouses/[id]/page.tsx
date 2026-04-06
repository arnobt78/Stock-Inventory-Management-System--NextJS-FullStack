import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import WarehouseDetailPage from "@/components/Pages/WarehouseDetailPage";

/**
 * Admin warehouse detail — same WarehouseDetailPage under admin layout.
 * Back button will go to previous page (e.g. /admin/warehouses).
 */
export default async function AdminWarehouseDetailPage() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  return <WarehouseDetailPage embedInAdmin />;
}
