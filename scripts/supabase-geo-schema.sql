-- ────────────────────────────────────────────────────────────────────────────
-- Maharashtra geo reference schema (districts → talukas → villages)
--
-- Text-slug primary keys that MATCH the app's dropdown JSON exactly, so the
-- IDs stored here are the same ones the frontend already uses:
--   district_id  = "kolh-pur"      (slug)
--   taluka_id    = "shirol"        (slug — only unique WITHIN a district)
--   village_id   = "v-567322"      (globally unique, LGD-derived)
--
-- Why composite PK on talukas: 10 taluka slugs (e.g. "karjat") repeat across
-- more than one district, so (district_id, taluka_id) is the real identity.
--
-- ⚠️  This DROPS the existing integer-id districts/talukas/villages tables and
--     recreates them. Run it in the Supabase SQL Editor once, then run
--     `node scripts/migrate-supabase-geo.mjs` to load the data.
-- ────────────────────────────────────────────────────────────────────────────

drop table if exists public.villages  cascade;
drop table if exists public.talukas   cascade;
drop table if exists public.districts cascade;

create table public.districts (
  district_id text primary key,
  name_en     text not null default '',
  name_mr     text not null default '',
  lgd         text
);

create table public.talukas (
  district_id text not null references public.districts(district_id) on delete cascade,
  taluka_id   text not null,
  name_en     text not null default '',
  name_mr     text not null default '',
  lgd         text,
  primary key (district_id, taluka_id)
);
create index talukas_district_idx on public.talukas (district_id);

create table public.villages (
  village_id    text primary key,
  district_id   text not null,
  taluka_id     text not null,
  name_en       text not null default '',
  name_mr       text not null default '',
  name_mr_source text not null default '',   -- 'lgd' | 'maha' | 'translit' | ''
  code          text,
  boundary_file text,
  foreign key (district_id, taluka_id)
    references public.talukas (district_id, taluka_id) on delete cascade
);
create index villages_taluka_idx   on public.villages (district_id, taluka_id);
create index villages_district_idx on public.villages (district_id);

-- ── RLS: public read-only. Writes only via the service-role key (which
--    bypasses RLS), i.e. the migration script and admin server actions. ──
alter table public.districts enable row level security;
alter table public.talukas   enable row level security;
alter table public.villages  enable row level security;

create policy "geo read districts" on public.districts for select using (true);
create policy "geo read talukas"   on public.talukas   for select using (true);
create policy "geo read villages"  on public.villages  for select using (true);
