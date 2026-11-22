"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button onClick={signOut} className="text-slate-600 hover:text-red-600">
      تسجيل الخروج
    </button>
  );
}
