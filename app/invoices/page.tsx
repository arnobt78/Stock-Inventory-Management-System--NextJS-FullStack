import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import InvoicesPage from "@/components/Pages/InvoicesPage";
import {
  getInvoicesForUser,
  getInvoicesForClientId,
} from "@/lib/server/invoices-data";

/**
 * Invoices route — server component.
 * If user is not logged in, redirect to login.
 * Client role: invoices where they are the client. Admin/supplier: invoices they created.
 */
export default async function InvoicesRoute() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  const initialInvoices =
    user.role === "client"
      ? await getInvoicesForClientId(user.id)
      : await getInvoicesForUser(user.id);
  return <InvoicesPage initialInvoices={initialInvoices} />;
}
