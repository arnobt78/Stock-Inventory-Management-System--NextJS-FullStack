import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import EmailPreferencesPage from "@/components/Pages/EmailPreferencesPage";

/**
 * Email Preferences route — server component.
 * If user is not logged in, redirect to login. Otherwise render EmailPreferencesPage.
 */
export default async function EmailPreferencesRoute() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }
  return <EmailPreferencesPage />;
}
