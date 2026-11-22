// كل منطق العيادة هنا: الخدمات والأوقات والمواعيد.
// الصفحات تستدعي هذه الدوال، وفي المرحلة ٢ تستدعيها أدوات MCP أيضًا.
import { pool } from "./db";

export type Service = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceSar: number;
};

export type Slot = {
  id: number;
  startsAt: Date;
};

export type Appointment = {
  id: number;
  status: "booked" | "cancelled";
  serviceName: string;
  startsAt: Date;
};

// كل عملية تغيّر البيانات ترجع نجاحًا أو رسالة خطأ واضحة
export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export async function getServices(): Promise<Service[]> {
  const { rows } = await pool.query(
    `select id, name, description,
            duration_minutes as "durationMinutes", price_sar as "priceSar"
     from services
     order by price_sar`,
  );
  return rows;
}

export async function getService(serviceId: string): Promise<Service | null> {
  const { rows } = await pool.query(
    `select id, name, description,
            duration_minutes as "durationMinutes", price_sar as "priceSar"
     from services
     where id = $1`,
    [serviceId],
  );
  return rows[0] ?? null;
}

// الأوقات الفاضية: في المستقبل، خلال الأيام القادمة، وليس عليها موعد محجوز
export async function getAvailableSlots(serviceId: string, days = 7): Promise<Slot[]> {
  const { rows } = await pool.query(
    `select s.id, s.starts_at as "startsAt"
     from slots s
     where s.service_id = $1
       and s.starts_at > now()
       and s.starts_at < now() + make_interval(days => $2)
       and not exists (
         select 1 from appointments a
         where a.slot_id = s.id and a.status = 'booked'
       )
     order by s.starts_at`,
    [serviceId, days],
  );
  return rows;
}

// مواعيد المريض نفسه فقط
export async function getMyAppointments(userId: string): Promise<Appointment[]> {
  const { rows } = await pool.query(
    `select a.id, a.status, sv.name as "serviceName", s.starts_at as "startsAt"
     from appointments a
     join slots s on s.id = a.slot_id
     join services sv on sv.id = s.service_id
     where a.user_id = $1
     order by s.starts_at`,
    [userId],
  );
  return rows;
}

export async function bookSlot(userId: string, slotId: number): Promise<Result<Appointment>> {
  const { rows } = await pool.query(
    `select s.starts_at as "startsAt", sv.name as "serviceName"
     from slots s join services sv on sv.id = s.service_id
     where s.id = $1`,
    [slotId],
  );
  const slot = rows[0];
  if (!slot) return { ok: false, error: "هذا الوقت غير موجود." };
  if (slot.startsAt <= new Date()) return { ok: false, error: "هذا الوقت مضى، اختر وقتًا قادمًا." };

  try {
    const inserted = await pool.query(
      `insert into appointments (user_id, slot_id) values ($1, $2) returning id`,
      [userId, slotId],
    );
    return {
      ok: true,
      data: { id: inserted.rows[0].id, status: "booked", ...slot },
    };
  } catch (error) {
    // 23505 = خطأ تكرار من Postgres: يوجد موعد محجوز على هذا الوقت (راجع db/schema.sql)
    if ((error as { code?: string }).code === "23505") {
      return { ok: false, error: "هذا الوقت محجوز، جرّب وقتًا آخر." };
    }
    throw error;
  }
}

export async function cancelAppointment(userId: string, appointmentId: number): Promise<Result<null>> {
  // الشرط user_id = $1 يضمن أن المريض لا يلغي إلا مواعيده هو
  const { rowCount } = await pool.query(
    `update appointments
     set status = 'cancelled', cancelled_at = now()
     where id = $2 and user_id = $1 and status = 'booked'
       and slot_id in (select id from slots where starts_at > now())`,
    [userId, appointmentId],
  );
  if (rowCount === 0) {
    return { ok: false, error: "لم نجد موعدًا قادمًا بهذا الرقم في مواعيدك." };
  }
  return { ok: true, data: null };
}
