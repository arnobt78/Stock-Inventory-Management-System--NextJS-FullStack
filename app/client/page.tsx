import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import ClientPortalPage from "@/components/Pages/ClientPortalPage";

/**
 * Client Portal route — server component.
 * If user is not logged in, redirect to login. Otherwise render ClientPortalPage (placeholder for future client catalog, cart, checkout).
 */
export default async function ClientPortalRoute() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  return <ClientPortalPage />;
}
