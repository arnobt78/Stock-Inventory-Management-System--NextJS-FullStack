import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import InvoiceDetailPage from "@/components/Pages/InvoiceDetailPage";

/**
 * Invoice detail route — server component.
 * If user is not logged in, redirect to login. Otherwise render InvoiceDetailPage.
 * Id is read by the client via useParams().
 */
export default async function InvoiceDetailRoute() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  return <InvoiceDetailPage />;
}
