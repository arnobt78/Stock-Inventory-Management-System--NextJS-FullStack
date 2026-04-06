import { getSession } from "@/lib/auth-server";
import {
  getHistoryForUser,
  getActivityLogsForPage,
} from "@/lib/server/history-data";
import AdminHistoryContent from "@/components/admin/AdminHistoryContent";

/**
 * Admin Activity History — import history + activity log (CRUD) with date filters.
 */
export default async function AdminActivityHistoryPage() {
  const user = await getSession();
  if (!user) return null;
  const [initialHistory, initialActivityLogs] = await Promise.all([
    getHistoryForUser(user.id),
    getActivityLogsForPage("7days", user.id),
  ]);
  return (
    <AdminHistoryContent
      initialHistory={initialHistory}
      initialActivityLogs={initialActivityLogs}
      detailHrefBase="/admin/activity-history"
    />
  );
}
