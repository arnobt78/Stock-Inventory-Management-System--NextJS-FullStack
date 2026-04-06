import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import ApiStatusPage from "@/components/Pages/ApiStatusPage";

/**
 * API Status route — server component.
 * If user is not logged in, redirect to login. Otherwise render ApiStatusPage.
 */
export default async function ApiStatusRoute() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  return <ApiStatusPage />;
}
