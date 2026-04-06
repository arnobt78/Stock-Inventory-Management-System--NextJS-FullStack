import { getSession } from "@/lib/auth-server";
import { getProductsForUser } from "@/lib/server/home-data";
import AdminProductsContent from "@/components/admin/AdminProductsContent";

export default async function AdminProductsPage() {
  const user = await getSession();
  if (!user) return null;
  const initialProducts = await getProductsForUser(user.id);
  return <AdminProductsContent initialProducts={initialProducts} />;
}
