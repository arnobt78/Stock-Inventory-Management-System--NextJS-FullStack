import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import CategoryDetailPage from "@/components/Pages/CategoryDetailPage";

/**
 * Category detail route — server component.
 * If user is not logged in, redirect to login. Otherwise render CategoryDetailPage.
 * Id is read by the client via useParams().
 */
export default async function CategoryDetailRoute() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  return <CategoryDetailPage />;
}
