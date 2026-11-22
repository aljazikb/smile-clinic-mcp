-- جداول العيادة. جداول تسجيل الدخول (user, session, account...) ينشئها Better Auth بالأمر: npx auth migrate

create table if not exists services (
  id text primary key,              -- مثل: cleaning
  name text not null,
  description text not null,
  duration_minutes integer not null,
  price_sar integer not null
);

create table if not exists slots (
  id serial primary key,
  service_id text not null references services(id),
  starts_at timestamptz not null,
  unique (service_id, starts_at)    -- حتى لا يتكرر نفس الوقت للخدمة نفسها
);

create table if not exists appointments (
  id serial primary key,
  user_id text not null references "user"(id) on delete cascade,
  slot_id integer not null references slots(id),
  status text not null default 'booked' check (status in ('booked', 'cancelled')),
  created_at timestamptz not null default now(),
  cancelled_at timestamptz
);

-- قاعدة البيانات نفسها تمنع حجز نفس الوقت مرتين.
-- الموعد الملغى لا يُحسب، فيرجع الوقت فاضيًا بعد الإلغاء.
create unique index if not exists one_booking_per_slot
  on appointments (slot_id)
  where status = 'booked';
