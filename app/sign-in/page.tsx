"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    setError("");

    const { error } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });

    setPending(false);
    if (error) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      return;
    }
    router.push("/appointments");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold">تسجيل الدخول</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <label className="block">
          <span className="text-sm font-medium">البريد الإلكتروني</span>
          <input
            name="email"
            type="email"
            dir="ltr"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">كلمة المرور</span>
          <input
            name="password"
            type="password"
            dir="ltr"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <button
          disabled={pending}
          className="w-full rounded-lg bg-teal-600 py-2 font-medium text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {pending ? "جارٍ الدخول…" : "دخول"}
        </button>
      </form>

      <p className="mt-4 rounded-lg bg-teal-50 p-3 text-sm text-teal-900">
        حساب تجريبي: <span dir="ltr">demo@smile.clinic</span> / <span dir="ltr">demo1234</span>
      </p>
    </div>
  );
}
