import { redirect } from "next/navigation";

/**
 * Legacy Personal Order detail — redirect to combined order detail.
 */
export default async function AdminPersonalOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/orders/${id}`);
}
