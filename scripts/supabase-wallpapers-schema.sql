-- PRINTSHUBH wallpaper design catalogue — Supabase schema (Phase D)
--
-- RUN THIS YOURSELF in the Supabase dashboard -> SQL editor, on the project
-- that holds your printshubh_* tables. Nothing in the app runs it for you.
--
-- Design notes
--   * Tables use the printshubh_ prefix (the project may be shared with other apps).
--   * Row-level security is ENABLED and there are NO policies: the anon / public
--     keys can read and write NOTHING. Only the server (service-role key, which
--     never reaches the browser) touches these tables.
--   * Only small WebP previews are stored. Production masters never go here.
--   * Safe to run more than once.

-- ── Categories ────────────────────────────────────────────────────────────
create table if not exists public.printshubh_wallpaper_categories (
  slug           text primary key
                   check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 60),
  name           text not null check (char_length(name) between 1 and 80),
  description    text not null default '' check (char_length(description) <= 400),
  sort_order     integer not null default 100,
  cover_design_id text,
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── Designs ───────────────────────────────────────────────────────────────
create table if not exists public.printshubh_wallpaper_designs (
  id             text primary key
                   check (id ~ '^WP-[0-9]{3,6}$'),
  title          text not null check (char_length(title) between 1 and 120),
  category_slug  text not null references public.printshubh_wallpaper_categories(slug)
                   on update cascade on delete restrict,
  tags           text[] not null default '{}',
  description    text not null default '' check (char_length(description) <= 600),
  featured       boolean not null default false,
  status         text not null default 'draft' check (status in ('draft', 'published')),
  -- Where the previews live. Two forms:
  --   '/catalogue/wallpapers/wp-001'   -> static files shipped with the site
  --   'storage:wp-021-1a2b3c'          -> object keys in the wallpaper-previews bucket
  -- The sizes are appended: <base>-400.webp, -900.webp, -1600.webp.
  preview_base   text not null,
  width          integer not null check (width between 100 and 6000),
  height         integer not null check (height between 100 and 6000),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists printshubh_wallpaper_designs_status_created_idx
  on public.printshubh_wallpaper_designs (status, created_at desc);
create index if not exists printshubh_wallpaper_designs_category_idx
  on public.printshubh_wallpaper_designs (category_slug);

-- Keep updated_at honest.
create or replace function public.printshubh_wallpaper_touch() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists printshubh_wallpaper_categories_touch on public.printshubh_wallpaper_categories;
create trigger printshubh_wallpaper_categories_touch
  before update on public.printshubh_wallpaper_categories
  for each row execute function public.printshubh_wallpaper_touch();

drop trigger if exists printshubh_wallpaper_designs_touch on public.printshubh_wallpaper_designs;
create trigger printshubh_wallpaper_designs_touch
  before update on public.printshubh_wallpaper_designs
  for each row execute function public.printshubh_wallpaper_touch();

-- ── Row-level security: on, with no policies (service role only) ──────────
alter table public.printshubh_wallpaper_categories enable row level security;
alter table public.printshubh_wallpaper_designs    enable row level security;

-- ── Preview bucket ────────────────────────────────────────────────────────
-- Public READ is needed so browsers can load the previews directly from the CDN.
-- Writes are service-role only (no storage policies are created), the bucket
-- accepts WebP only and caps each file at 1 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wallpaper-previews', 'wallpaper-previews', true, 1048576, array['image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ── Starter categories (edit freely later in /admin/wallpapers) ───────────
insert into public.printshubh_wallpaper_categories (slug, name, description, sort_order, cover_design_id) values
  ('luxury-premium',         'Luxury & Premium',       'Rich, statement wallpapers with gold detailing and refined, high-end finishes.',                      1, 'WP-001'),
  ('floral-botanical',       'Floral & Botanical',     'Soft florals, leafy botanicals and garden-inspired murals for calm, natural rooms.',                   2, 'WP-003'),
  ('indian-traditional-art', 'Indian Traditional Art', 'Pichwai, Mithila and Mughal-inspired artwork, rich with peacocks, lotuses and gardens.',            3, 'WP-006'),
  ('abstract-modern',        'Abstract & Modern',      'Contemporary compositions, geometry and soft abstract forms for modern interiors.',                    4, 'WP-009'),
  ('nature-landscapes',      'Nature & Landscapes',    'Mountains, forests and valleys, printed as wide scenic murals.',                                       5, 'WP-011'),
  ('kids-nursery',           'Kids & Nursery',         'Gentle, playful scenes for children''s rooms and nurseries.',                                          6, 'WP-014'),
  ('marble-texture',         'Marble & Texture',       'Marble, plaster and sculpted-relief looks for quiet, tactile walls.',                                  7, 'WP-016'),
  ('devotional-spiritual',   'Devotional & Spiritual', 'Peaceful devotional artwork for prayer rooms and calm spaces.',                                        8, 'WP-018')
on conflict (slug) do nothing;
