import { redirect } from "next/navigation";

/**
 * Legacy admin hub — redirect to merged Store Dashboard & Analytics.
 */
export default function AdminDashboardPage() {
  redirect("/admin/dashboard-overall-insights");
}
