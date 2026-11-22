"use client";

import { useActionState } from "react";
import { bookAppointment } from "@/app/actions";

type Day = { label: string; slots: { id: number; time: string }[] };

export function BookForm({ days }: { days: Day[] }) {
  const [state, formAction, pending] = useActionState(bookAppointment, {});

  // كل زر يرسل رقم الوقت الخاص به (name="slotId")
  return (
    <form action={formAction} className="mt-4 space-y-5">
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">
          {state.error}
        </p>
      )}
      {days.map((day) => (
        <section key={day.label} className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="font-medium">{day.label}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {day.slots.map((slot) => (
              <button
                key={slot.id}
                name="slotId"
                value={slot.id}
                disabled={pending}
                className="rounded-lg border border-teal-600 px-3 py-1.5 text-sm text-teal-700 hover:bg-teal-600 hover:text-white disabled:opacity-50"
              >
                {slot.time}
              </button>
            ))}
          </div>
        </section>
      ))}
    </form>
  );
}
