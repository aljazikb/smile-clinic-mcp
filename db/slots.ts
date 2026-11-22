// تضيف أوقاتًا للأيام القادمة. لا تحذف ولا تعدّل أي وقت أو موعد موجود.
import { pool } from "../lib/db";

const OPEN_HOUR = 9; // ٩ صباحًا
const CLOSE_HOUR = 17; // ٥ مساءً
const WORK_DAYS = [0, 1, 2, 3, 4]; // من الأحد (0) إلى الخميس (4)
const RIYADH = "+03:00"; // الرياض UTC+3 طول السنة، بدون توقيت صيفي

export async function addSlots(days: number) {
  const { rows: services } = await pool.query(
    `select id, duration_minutes as "durationMinutes" from services`,
  );
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Riyadh" }); // مثل 2026-11-24
  const now = new Date();
  let added = 0;

  for (const service of services) {
    const times: Date[] = [];

    for (let d = 0; d < days; d++) {
      const midnight = new Date(`${today}T00:00:00${RIYADH}`);
      midnight.setUTCDate(midnight.getUTCDate() + d);
      const date = midnight.toLocaleDateString("en-CA", { timeZone: "Asia/Riyadh" });
      const weekday = new Date(`${date}T12:00:00${RIYADH}`).getUTCDay();
      if (!WORK_DAYS.includes(weekday)) continue;

      for (let m = OPEN_HOUR * 60; m + service.durationMinutes <= CLOSE_HOUR * 60; m += service.durationMinutes) {
        const hh = String(Math.floor(m / 60)).padStart(2, "0");
        const mm = String(m % 60).padStart(2, "0");
        const start = new Date(`${date}T${hh}:${mm}:00${RIYADH}`);
        if (start > now) times.push(start);
      }
    }

    // on conflict do nothing: إذا كان الوقت موجودًا من قبل نتركه كما هو
    const result = await pool.query(
      `insert into slots (service_id, starts_at)
       select $1, unnest($2::timestamptz[])
       on conflict (service_id, starts_at) do nothing`,
      [service.id, times],
    );
    added += result.rowCount ?? 0;
  }

  return added;
}
