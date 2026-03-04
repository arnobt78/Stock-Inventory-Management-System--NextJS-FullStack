import { redirect } from "next/navigation";

/**
 * Legacy Personal Invoices — redirect to combined Invoices page.
 */
export default function AdminPersonalInvoicesPage() {
  redirect("/admin/invoices");
}
