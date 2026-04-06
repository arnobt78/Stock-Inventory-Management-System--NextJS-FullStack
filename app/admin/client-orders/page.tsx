import { redirect } from "next/navigation";

/**
 * Legacy Client Orders — redirect to combined Orders page.
 */
export default function AdminClientOrdersPage() {
  redirect("/admin/orders");
}
