import { redirect } from "next/navigation";

/**
 * Legacy Personal Orders — redirect to combined Orders page.
 */
export default function AdminPersonalOrdersPage() {
  redirect("/admin/orders");
}
