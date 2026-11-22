// npm run db:seed
// يجهّز بيانات العيادة: الجداول، والخدمات، والأوقات، والحسابان التجريبيان.
// يمكن تشغيله أكثر من مرة بأمان، فهو لا يكرر شيئًا موجودًا.
import { readFileSync } from "node:fs";
import { betterAuth } from "better-auth";
import { pool } from "../lib/db";
import { bookSlot, getAvailableSlots, getMyAppointments } from "../lib/clinic";
import { addSlots } from "./slots";

// ١) جداول العيادة
await pool.query(readFileSync("db/schema.sql", "utf8"));

// ٢) الخدمات
const services = [
  { id: "checkup", name: "كشف", description: "فحص شامل للأسنان واللثة مع خطة علاج.", duration: 30, price: 150 },
  { id: "cleaning", name: "تنظيف", description: "إزالة الجير والتصبغات وتلميع الأسنان.", duration: 45, price: 300 },
  { id: "filling", name: "حشوة", description: "علاج التسوس بحشوة تجميلية بلون السن.", duration: 60, price: 450 },
  { id: "whitening", name: "تبييض", description: "جلسة تبييض في العيادة لأسنان أفتح بعدة درجات.", duration: 60, price: 1200 },
];
for (const s of services) {
  await pool.query(
    `insert into services (id, name, description, duration_minutes, price_sar)
     values ($1, $2, $3, $4, $5)
     on conflict (id) do update
       set name = $2, description = $3, duration_minutes = $4, price_sar = $5`,
    [s.id, s.name, s.description, s.duration, s.price],
  );
}

// ٣) الأوقات لـ ٦٠ يومًا
const added = await addSlots(60);

// ٤) الحسابان التجريبيان
// التسجيل مقفل في lib/auth.ts (disableSignUp)، وهذا يمنع signUpEmail حتى من السيرفر.
// لذلك نستخدم هنا نسخة من Better Auth خاصة بالـ seed، التسجيل فيها مفتوح،
// وتكتب في نفس قاعدة البيانات. الموقع لا يستورد هذه النسخة أبدًا.
const seedAuth = betterAuth({ database: pool, emailAndPassword: { enabled: true } });

const users = [
  { name: "مريض تجريبي", email: "demo@smile.clinic", password: "demo1234" },
  { name: "سارة", email: "sara@smile.clinic", password: "demo1234" },
];
for (const u of users) {
  const { rows } = await pool.query(`select id from "user" where email = $1`, [u.email]);
  if (rows.length === 0) await seedAuth.api.signUpEmail({ body: u });
}

// ٥) موعد واحد للحساب التجريبي حتى لا تكون صفحة «مواعيدي» فارغة
const { rows } = await pool.query(`select id from "user" where email = 'demo@smile.clinic'`);
const demoId = rows[0].id;
if ((await getMyAppointments(demoId)).length === 0) {
  const [slot] = await getAvailableSlots("cleaning", 14);
  if (slot) await bookSlot(demoId, slot.id);
}

console.log(`تم تجهيز البيانات. عدد الأوقات الجديدة: ${added}`);
await pool.end();
