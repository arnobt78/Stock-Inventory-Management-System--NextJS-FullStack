import { redirect } from "next/navigation";

/**
 * Redirect legacy /admin/history/[id] to /admin/activity-history/[id].
 * See PROJECT_PLAN § 9.16.1.
 */
export default async function AdminHistoryDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/activity-history/${id}`);
}
