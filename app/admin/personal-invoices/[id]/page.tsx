import { redirect } from "next/navigation";

/**
 * Legacy Personal Invoice detail — redirect to combined invoice detail.
 */
export default async function AdminPersonalInvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/invoices/${id}`);
}
