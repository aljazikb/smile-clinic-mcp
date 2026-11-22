"use server";
// Server Actions: تتأكد من المستخدم أولًا، ثم تستدعي منطق العيادة في lib/clinic.ts

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { bookSlot, cancelAppointment as cancel } from "@/lib/clinic";
import { requireUser } from "@/lib/session";

export type ActionState = { error?: string; message?: string };

export async function bookAppointment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const slotId = Number(formData.get("slotId"));
  if (!Number.isInteger(slotId)) return { error: "اختر وقتًا من القائمة." };

  const result = await bookSlot(user.id, slotId);
  if (!result.ok) return { error: result.error };

  revalidatePath("/appointments");
  redirect("/appointments");
}

export async function cancelAppointment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const appointmentId = Number(formData.get("appointmentId"));
  if (!Number.isInteger(appointmentId)) return { error: "رقم الموعد غير صحيح." };

  const result = await cancel(user.id, appointmentId);
  if (!result.ok) return { error: result.error };

  revalidatePath("/appointments");
  return { message: "تم إلغاء الموعد." };
}
