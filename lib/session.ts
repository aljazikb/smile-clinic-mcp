import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

// ترجع المستخدم الحالي، أو null إذا لم يسجّل دخوله
export async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

// للصفحات والأفعال التي تحتاج تسجيل دخول
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/sign-in");
  return user;
}
