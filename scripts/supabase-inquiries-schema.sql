-- PRINTSHUBH customer leads — Supabase schema
--
-- RUN THIS YOURSELF in the Supabase dashboard -> SQL editor (new project).
-- The original script for this table was never saved in the repository; this one is
-- rebuilt from the code that reads and writes it (src/lib/inquiries.ts and
-- src/app/api/inquiries/route.ts), so the column names, limits and status values match.
--
-- Same security model as the wallpaper tables: row-level security is ON with NO policies,
-- so the public / anon keys can read and write nothing. Only the server (service-role key)
-- touches it. Safe to run more than once.

create table if not exists public.printshubh_inquiries (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  customer_name text not null check (char_length(customer_name) between 1 and 120),
  mobile        text not null check (char_length(mobile) between 10 and 15),
  service       text check (char_length(service) <= 80),
  district      text check (char_length(district) <= 80),
  taluka        text check (char_length(taluka) <= 80),
  village       text check (char_length(village) <= 80),
  gat           text check (char_length(gat) <= 80),
  note          text check (char_length(note) <= 1000),
  -- Matches INQUIRY_STATUSES in src/lib/inquiry-status.ts
  status        text not null default 'new' check (status in ('new', 'pending', 'process', 'complete'))
);

create index if not exists printshubh_inquiries_created_idx
  on public.printshubh_inquiries (created_at desc);

alter table public.printshubh_inquiries enable row level security;
