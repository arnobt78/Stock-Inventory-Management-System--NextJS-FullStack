import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import ProductsPage from "@/components/Pages/ProductsPage";
import {
  getProductsForUser,
  getProductsBySupplierId,
  type ProductForHome,
} from "@/lib/server/home-data";
import { getSupplierByUserId } from "@/prisma/supplier";

/**
 * Products route — server component.
 * If user is not logged in, redirect to login.
 * Client role: ProductsPage renders ClientProductList (browse by owner).
 * Supplier role: show only products where supplierId = their linked supplier.
 * Admin/User: show their own products.
 * Client: initialOwnerId from ?ownerId= for catalog deep links.
 */
export default async function ProductsRoute({
  searchParams,
}: {
  searchParams: Promise<{ ownerId?: string }>;
}) {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  const params = await searchParams;
  const initialOwnerId = params?.ownerId ?? "";
  let initialProducts: ProductForHome[];
  if (user.role === "client") {
    initialProducts = [];
  } else if (user.role === "supplier") {
    const supplier = await getSupplierByUserId(user.id);
    initialProducts = supplier
      ? await getProductsBySupplierId(supplier.id)
      : [];
  } else {
    initialProducts = await getProductsForUser(user.id);
  }
  return (
    <ProductsPage
      initialProducts={initialProducts}
      userRole={user.role ?? undefined}
      initialOwnerId={initialOwnerId}
    />
  );
}
