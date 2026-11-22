"use client";

import { useActionState } from "react";
import { cancelAppointment } from "@/app/actions";

export function CancelButton({ appointmentId }: { appointmentId: number }) {
  const [state, formAction, pending] = useActionState(cancelAppointment, {});

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("هل تريد إلغاء هذا الموعد؟")) e.preventDefault();
      }}
      className="text-end"
    >
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <button
        disabled={pending}
        className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {pending ? "جارٍ الإلغاء…" : "إلغاء الموعد"}
      </button>
      {state.error && <p role="alert" className="mt-1 text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
