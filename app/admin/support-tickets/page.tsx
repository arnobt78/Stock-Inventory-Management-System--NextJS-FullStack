import { getSession } from "@/lib/auth-server";
import {
  getSupportTicketsForAdmin,
  getProductOwnersForSupport,
} from "@/lib/server/support-tickets-data";
import AdminSupportTicketsContent from "@/components/admin/AdminSupportTicketsContent";

export default async function AdminSupportTicketsPage() {
  const user = await getSession();
  if (!user) return null;
  const [initialTickets, productOwners] = await Promise.all([
    getSupportTicketsForAdmin(user.id),
    getProductOwnersForSupport(),
  ]);
  return (
    <AdminSupportTicketsContent
      initialTickets={initialTickets}
      productOwners={productOwners}
    />
  );
}
