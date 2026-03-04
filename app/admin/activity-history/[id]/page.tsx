import AdminHistoryDetailContent from "@/components/admin/AdminHistoryDetailContent";

/**
 * Admin Activity History detail — view a single import history record.
 * Canonical route; /admin/history/[id] redirects here.
 */
export default function AdminActivityHistoryDetailPage() {
  return <AdminHistoryDetailContent backHref="/admin/activity-history" />;
}
