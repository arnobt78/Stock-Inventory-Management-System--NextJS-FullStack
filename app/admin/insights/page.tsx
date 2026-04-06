import { redirect } from "next/navigation";

/**
 * Legacy Admin Insights — redirect to merged Store Dashboard & Analytics.
 */
export default function AdminInsightsPage() {
  redirect("/admin/dashboard-overall-insights");
}
