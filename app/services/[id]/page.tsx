import Link from "next/link";
import { notFound } from "next/navigation";
import { getAvailableSlots, getService } from "@/lib/clinic";
import { dayKey, formatDay, formatNumber, formatTime } from "@/lib/format";
import { getUser } from "@/lib/session";
import { BookForm } from "./book-form";

export default async function ServicePage(props: PageProps<"/services/[id]">) {
  const { id } = await props.params;
  const service = await getService(id);
  if (!service) notFound();

  const slots = await getAvailableSlots(service.id);
  const user = await getUser();

  // نجمع الأوقات حسب اليوم ونجهّز النصوص هنا، حتى يكون مكوّن الحجز بسيطًا
  const days = new Map<string, { label: string; slots: { id: number; time: string }[] }>();
  for (const slot of slots) {
    const key = dayKey(slot.startsAt);
    if (!days.has(key)) days.set(key, { label: formatDay(slot.startsAt), slots: [] });
    days.get(key)!.slots.push({ id: slot.id, time: formatTime(slot.startsAt) });
  }

  return (
    <>
      <Link href="/" className="text-sm text-teal-700 hover:underline">
        الرجوع إلى الخدمات
      </Link>
      <h1 className="mt-3 text-2xl font-bold">{service.name}</h1>
      <p className="mt-2 text-slate-600">{service.description}</p>
      <p className="mt-2 text-sm text-slate-500">
        المدة {formatNumber(service.durationMinutes)} دقيقة · السعر {formatNumber(service.priceSar)} ريال
      </p>

      <h2 className="mt-8 text-lg font-bold">الأوقات المتاحة خلال الأسبوع القادم</h2>
      {!user && (
        <p className="mt-2 text-sm text-slate-600">
          <Link href="/sign-in" className="font-medium text-teal-700 hover:underline">
            سجّل دخولك
          </Link>{" "}
          لتحجز موعدًا.
        </p>
      )}

      {days.size === 0 ? (
        <p className="mt-4 rounded-xl bg-white p-5 text-slate-600">
          لا توجد أوقات متاحة لهذه الخدمة حاليًا. جرّب خدمة أخرى أو عُد لاحقًا.
        </p>
      ) : (
        <BookForm days={[...days.values()]} />
      )}
    </>
  );
}
