import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import RegisterPage from "@/components/Pages/RegisterPage";

/**
 * Register route — server component.
 * If user is already logged in (session cookie), redirect to home.
 * Otherwise render the client RegisterPage.
 */
export default async function RegisterRoute() {
  const user = await getSession();
  if (user) {
    redirect("/");
  }
  return <RegisterPage />;
}
