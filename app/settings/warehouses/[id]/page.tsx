import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import WarehouseDetailPage from "@/components/Pages/WarehouseDetailPage";

/**
 * Warehouse detail route — server component.
 * If user is not logged in, redirect to login. Otherwise render WarehouseDetailPage.
 * Id is read by the client via useParams().
 */
export default async function WarehouseDetailRoute() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  return <WarehouseDetailPage />;
}
