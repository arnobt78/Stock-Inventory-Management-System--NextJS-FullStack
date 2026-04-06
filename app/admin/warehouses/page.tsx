import { getSession } from "@/lib/auth-server";
import { getWarehousesForUser } from "@/lib/server/warehouses-data";
import AdminWarehousesContent from "@/components/admin/AdminWarehousesContent";

export default async function AdminWarehousesPage() {
  const user = await getSession();
  if (!user) return null;
  const initialWarehouses = await getWarehousesForUser(user.id);
  return <AdminWarehousesContent initialWarehouses={initialWarehouses} />;
}
