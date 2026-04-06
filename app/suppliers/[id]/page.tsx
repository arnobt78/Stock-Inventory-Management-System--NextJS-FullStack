import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import SupplierDetailPage from "@/components/Pages/SupplierDetailPage";

/**
 * Supplier detail route — server component.
 * If user is not logged in, redirect to login. Otherwise render SupplierDetailPage.
 * Id is read by the client via useParams().
 */
export default async function SupplierDetailRoute() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  return <SupplierDetailPage />;
}
