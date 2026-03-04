import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import OrderDetailPage from "@/components/Pages/OrderDetailPage";

/**
 * Order detail route — server component.
 * If user is not logged in, redirect to login. Otherwise render OrderDetailPage.
 * Id is read by the client via useParams().
 */
export default async function OrderDetailRoute() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  return <OrderDetailPage />;
}
