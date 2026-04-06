import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import ProductDetailPage from "@/components/Pages/ProductDetailPage";

/**
 * Admin product detail — same ProductDetailPage under admin layout.
 * Back button will go to previous page (e.g. /admin/products or /admin/supplier-portal).
 */
export default async function AdminProductDetailPage() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  return <ProductDetailPage embedInAdmin />;
}
