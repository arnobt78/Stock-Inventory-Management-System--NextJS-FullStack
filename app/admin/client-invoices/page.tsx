import { redirect } from "next/navigation";

/**
 * Legacy Client Invoices — redirect to combined Invoices page.
 */
export default function AdminClientInvoicesPage() {
  redirect("/admin/invoices");
}
