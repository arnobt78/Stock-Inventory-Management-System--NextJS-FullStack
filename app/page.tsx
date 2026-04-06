import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import HomePage from "@/components/Pages/HomePage";
import {
  getProductsForUser,
  getCategoriesForUser,
  getSuppliersForUser,
} from "@/lib/server/home-data";

/**
 * Home route — server component.
 * If user is not logged in (no session cookie), redirect to login.
 * Otherwise fetch products, categories, and suppliers on the server and pass
 * them to HomePage so the client can hydrate React Query in one round-trip.
 */
export default async function HomeRoute() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  if (user.role === "client") {
    redirect("/client");
  }
  if (user.role === "supplier") {
    redirect("/supplier");
  }
  const [products, categories, suppliers] = await Promise.all([
    getProductsForUser(user.id),
    getCategoriesForUser(user.id),
    getSuppliersForUser(user.id),
  ]);
  return (
    <HomePage
      initialProducts={products}
      initialCategories={categories}
      initialSuppliers={suppliers}
    />
  );
}
