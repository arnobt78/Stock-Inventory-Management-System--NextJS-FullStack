import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import ProductDetailPage from "@/components/Pages/ProductDetailPage";

/**
 * Product detail route — server component.
 * If user is not logged in, redirect to login. Otherwise render ProductDetailPage.
 * Id is read by the client via useParams().
 */
export default async function ProductDetailRoute() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  return <ProductDetailPage />;
}
