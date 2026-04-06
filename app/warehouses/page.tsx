import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import WarehousesPage from "@/components/Pages/WarehousesPage";
import { getWarehousesForUser } from "@/lib/server/warehouses-data";

/**
 * Warehouses route — server component.
 * If user is not logged in, redirect to login. Otherwise fetch warehouses on the server
 * and pass to WarehousesPage so the client can hydrate React Query in one round-trip.
 */
export default async function WarehousesRoute() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  const initialWarehouses = await getWarehousesForUser(user.id);
  return <WarehousesPage initialWarehouses={initialWarehouses} />;
}
