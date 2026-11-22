import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { pool } from "./db";

export const auth = betterAuth({
  database: pool,
  emailAndPassword: {
    enabled: true,
    // لا يمكن إنشاء حساب من الموقع، والحسابات التجريبية يُنشئها الـ seed
    disableSignUp: true,
  },
  // يجب أن يكون nextCookies آخر plugin حتى تعمل الكوكيز مع Server Actions
  plugins: [nextCookies()],
});
