import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import CategoryDetailPage from "@/components/Pages/CategoryDetailPage";

/**
 * Admin category detail — same CategoryDetailPage under admin layout.
 * Back button will go to previous page (e.g. /admin/products or /categories).
 */
export default async function AdminCategoryDetailPage() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  return <CategoryDetailPage embedInAdmin />;
}
