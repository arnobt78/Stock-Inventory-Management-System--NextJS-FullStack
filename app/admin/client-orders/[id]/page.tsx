import { redirect } from "next/navigation";

/**
 * Legacy Client Order detail — redirect to combined order detail.
 */
export default async function AdminClientOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/orders/${id}`);
}
