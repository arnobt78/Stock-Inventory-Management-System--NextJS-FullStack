import { redirect } from "next/navigation";

/**
 * Redirect legacy /admin/history to /admin/activity-history.
 * See PROJECT_PLAN § 9.16.1.
 */
export default function AdminHistoryRedirect() {
  redirect("/admin/activity-history");
}
