import Link from "next/link";
import { getMyAppointments } from "@/lib/clinic";
import { formatDay, formatTime } from "@/lib/format";
import { requireUser } from "@/lib/session";
import { CancelButton } from "./cancel-button";

export default async function AppointmentsPage() {
  const user = await requireUser();
  const appointments = await getMyAppointments(user.id);
  const now = new Date();
  const upcoming = appointments.filter((a) => a.status === "booked" && a.startsAt > now);
  const others = appointments.filter((a) => !upcoming.includes(a));

  return (
    <>
      <h1 className="text-2xl font-bold">مواعيدي</h1>

      <h2 className="mt-6 text-lg font-bold">المواعيد القادمة</h2>
      {upcoming.length === 0 ? (
        <p className="mt-3 rounded-xl bg-white p-5 text-slate-600">
          ليس لديك مواعيد قادمة.{" "}
          <Link href="/" className="font-medium text-teal-700 hover:underline">
            احجز موعدًا
          </Link>
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {upcoming.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
              <div>
                <p className="font-bold">{a.serviceName}</p>
                <p className="text-sm text-slate-600">
                  {formatDay(a.startsAt)} · {formatTime(a.startsAt)}
                </p>
              </div>
              <CancelButton appointmentId={a.id} />
            </li>
          ))}
        </ul>
      )}

      {others.length > 0 && (
        <>
          <h2 className="mt-8 text-lg font-bold">مواعيد سابقة وملغاة</h2>
          <ul className="mt-3 space-y-2">
            {others.map((a) => (
              <li key={a.id} className="flex justify-between rounded-xl bg-white p-4 text-sm text-slate-500">
                <span>
                  {a.serviceName} · {formatDay(a.startsAt)} · {formatTime(a.startsAt)}
                </span>
                <span>{a.status === "cancelled" ? "ملغى" : "انتهى"}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
