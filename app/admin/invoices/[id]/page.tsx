import InvoiceDetailPage from "@/components/Pages/InvoiceDetailPage";

/**
 * Admin Invoice detail — combined list back link to /admin/invoices.
 */
export default function AdminInvoiceDetailPage() {
  return (
    <InvoiceDetailPage backHref="/admin/invoices" embedInAdmin />
  );
}
