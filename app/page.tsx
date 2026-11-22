import Link from "next/link";
import { getServices } from "@/lib/clinic";
import { formatNumber } from "@/lib/format";

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <h1 className="text-2xl font-bold">خدماتنا</h1>
      <p className="mt-2 text-slate-600">اختر الخدمة لترى الأوقات المتاحة وتحجز موعدك.</p>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <li key={service.id}>
            <Link
              href={`/services/${service.id}`}
              className="block h-full rounded-xl border border-slate-200 bg-white p-5 transition hover:border-teal-500 hover:shadow-sm"
            >
              <h2 className="text-lg font-bold">{service.name}</h2>
              <p className="mt-1 text-sm text-slate-600">{service.description}</p>
              <p className="mt-4 flex justify-between text-sm">
                <span className="text-slate-500">{formatNumber(service.durationMinutes)} دقيقة</span>
                <span className="font-bold text-teal-700">{formatNumber(service.priceSar)} ريال</span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
