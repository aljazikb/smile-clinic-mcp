import type { Metadata } from "next";
import Link from "next/link";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { getUser } from "@/lib/session";
import { SignOutButton } from "./sign-out-button";
import "./globals.css";

const font = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-plex-arabic",
});

export const metadata: Metadata = {
  title: "عيادة ابتسامة",
  description: "احجز موعدك في عيادة ابتسامة لطب الأسنان",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getUser();

  return (
    <html lang="ar" dir="rtl" className={`${font.variable} antialiased`}>
      <body className="min-h-screen font-sans">
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4">
            <Link href="/" className="text-lg font-bold text-teal-700">
              عيادة ابتسامة
            </Link>
            <Link href="/" className="text-slate-600 hover:text-teal-700">
              الخدمات
            </Link>
            <Link href="/appointments" className="text-slate-600 hover:text-teal-700">
              مواعيدي
            </Link>
            <div className="ms-auto flex items-center gap-3 text-sm">
              {user ? (
                <>
                  <span className="text-slate-500">{user.name}</span>
                  <SignOutButton />
                </>
              ) : (
                <Link href="/sign-in" className="font-medium text-teal-700 hover:underline">
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
