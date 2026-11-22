// npm run db:slots
// شغّله عندما تقترب الأوقات من النفاد. يضيف أوقات الـ ٦٠ يومًا القادمة فقط، ولا يحذف شيئًا.
import { pool } from "../lib/db";
import { addSlots } from "./slots";

const added = await addSlots(60);
console.log(`عدد الأوقات الجديدة: ${added}`);
await pool.end();
