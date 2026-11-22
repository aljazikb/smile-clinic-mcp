// كل تنسيق التاريخ والوقت والأرقام في مكان واحد
const locale = "ar-SA-u-ca-gregory"; // عربي بتقويم ميلادي
const timeZone = "Asia/Riyadh";

export function formatDay(date: Date) {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function formatTime(date: Date) {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat(locale).format(value);
}

// مفتاح اليوم بصيغة 2026-11-24 بتوقيت الرياض، نستخدمه لتجميع الأوقات حسب اليوم
export function dayKey(date: Date) {
  return date.toLocaleDateString("en-CA", { timeZone });
}
