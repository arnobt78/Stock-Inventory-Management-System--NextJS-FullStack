import AdminOrderDetailContent from "@/components/admin/AdminOrderDetailContent";

/**
 * Admin Order detail — combined list back link to /admin/orders.
 */
export default function AdminOrderDetailPage() {
  return <AdminOrderDetailContent backHref="/admin/orders" />;
}
