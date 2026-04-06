/**
 * Server-side session helper for App Router pages (e.g. app/page.tsx).
 * Uses next/headers cookies and getSessionFromRequest for session checks; call in server components only.
 */
import { cookies } from "next/headers";
import { getSessionFromRequest } from "@/utils/auth";

export async function getSession() {
  const cookieStore = await cookies();
  return getSessionFromRequest({ cookies: cookieStore });
}
