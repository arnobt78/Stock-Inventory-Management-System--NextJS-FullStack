import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import SuppliersPage from "@/components/Pages/SuppliersPage";
import { getSuppliersForUser } from "@/lib/server/home-data";

/**
 * Suppliers route — server component.
 * If user is not logged in, redirect to login. Otherwise fetch suppliers on the server
 * and pass to SuppliersPage so the client can hydrate React Query in one round-trip.
 */
export default async function SuppliersRoute() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  const initialSuppliers = await getSuppliersForUser(user.id);
  return <SuppliersPage initialSuppliers={initialSuppliers} />;
}
