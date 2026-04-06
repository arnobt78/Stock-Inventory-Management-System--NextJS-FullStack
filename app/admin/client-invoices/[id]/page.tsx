import { redirect } from "next/navigation";

/**
 * Legacy Client Invoice detail — redirect to combined invoice detail.
 */
export default async function AdminClientInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/invoices/${id}`);
}
