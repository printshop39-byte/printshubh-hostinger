-- OPTIONAL: the 19 sample designs, so the public catalogue is not empty when the
-- database is switched on. They point at preview files that already ship with the
-- site (/catalogue/wallpapers/*). Replace or delete them whenever you like in
-- /admin/wallpapers. Run AFTER supabase-wallpapers-schema.sql. Safe to re-run.

insert into public.printshubh_wallpaper_designs
  (id, title, category_slug, tags, description, featured, status, preview_base, width, height, created_at) values
  ('WP-001', 'Golden Palm Royale', 'luxury-premium', array['premium', 'metallic', 'botanical']::text[], 'Gold palm fronds on deep emerald green.', true, 'published', '/catalogue/wallpapers/wp-001', 1600, 900, '2026-11-18'::timestamptz),
  ('WP-002', 'Ivory Lotus Luxe', 'luxury-premium', array['premium', 'floral', 'minimal']::text[], 'Pale lotus blooms on a soft ivory ground.', false, 'published', '/catalogue/wallpapers/wp-002', 1600, 900, '2026-11-17'::timestamptz),
  ('WP-003', 'Botanical Whispers', 'floral-botanical', array['floral', 'botanical', 'modern']::text[], 'Layered palms and ferns in muted sage.', true, 'published', '/catalogue/wallpapers/wp-003', 1600, 900, '2026-11-16'::timestamptz),
  ('WP-004', 'Enchanted Blossom Garden', 'floral-botanical', array['floral', 'birds', 'soft']::text[], 'Blossoming branches with small songbirds.', false, 'published', '/catalogue/wallpapers/wp-004', 1600, 900, '2026-11-15'::timestamptz),
  ('WP-005', 'Botanical Bird Poetry', 'floral-botanical', array['floral', 'birds', 'traditional']::text[], 'Birds among slender, flowering branches.', false, 'published', '/catalogue/wallpapers/wp-005', 1600, 900, '2026-11-14'::timestamptz),
  ('WP-006', 'Mithila Tree of Life', 'indian-traditional-art', array['traditional', 'mithila', 'premium']::text[], 'A Mithila-style tree of life with peacocks and fish.', true, 'published', '/catalogue/wallpapers/wp-006', 1600, 900, '2026-11-13'::timestamptz),
  ('WP-007', 'Peacock Paradise Pichwai', 'indian-traditional-art', array['traditional', 'pichwai', 'peacock']::text[], 'Pichwai peacocks beside a lotus pond.', true, 'published', '/catalogue/wallpapers/wp-007', 1600, 900, '2026-11-12'::timestamptz),
  ('WP-008', 'Royal Mughal Botanical Garden', 'indian-traditional-art', array['traditional', 'mughal', 'garden']::text[], 'A Mughal garden pavilion with formal flowerbeds.', false, 'published', '/catalogue/wallpapers/wp-008', 1600, 900, '2026-11-11'::timestamptz),
  ('WP-009', 'Abstract Living', 'abstract-modern', array['modern', 'abstract', 'living-room']::text[], 'Earthy abstract shapes for a modern living room.', false, 'published', '/catalogue/wallpapers/wp-009', 1600, 900, '2026-11-10'::timestamptz),
  ('WP-010', 'Abstract Metallic Geometry', 'abstract-modern', array['modern', 'geometric', 'metallic']::text[], 'Arched, layered forms in warm greige.', false, 'published', '/catalogue/wallpapers/wp-010', 1600, 900, '2026-11-09'::timestamptz),
  ('WP-019', 'Zen Cloud Symphony', 'abstract-modern', array['modern', 'abstract', 'soft']::text[], 'Drifting cloud lines in quiet neutrals.', false, 'published', '/catalogue/wallpapers/wp-019', 1600, 900, '2026-11-08'::timestamptz),
  ('WP-011', 'Misty Mountain Paradise', 'nature-landscapes', array['landscape', 'mountains', 'mural']::text[], 'A misty mountain lake at sunrise.', true, 'published', '/catalogue/wallpapers/wp-011', 1600, 900, '2026-11-07'::timestamptz),
  ('WP-012', 'Golden Whispering Forest', 'nature-landscapes', array['landscape', 'forest', 'mural']::text[], 'A sunlit woodland path between old oaks.', false, 'published', '/catalogue/wallpapers/wp-012', 1600, 900, '2026-11-06'::timestamptz),
  ('WP-013', 'The Silent Valley', 'nature-landscapes', array['landscape', 'valley', 'modern']::text[], 'Rolling hills and a winding river.', false, 'published', '/catalogue/wallpapers/wp-013', 1600, 900, '2026-11-05'::timestamptz),
  ('WP-014', 'Whimsical Kids World', 'kids-nursery', array['kids', 'nursery', 'playful']::text[], 'Friendly animals under hot-air balloons.', true, 'published', '/catalogue/wallpapers/wp-014', 1600, 900, '2026-11-04'::timestamptz),
  ('WP-015', 'Safari Dreams', 'kids-nursery', array['kids', 'animals', 'soft']::text[], 'A gentle safari of elephants, giraffes and lions.', false, 'published', '/catalogue/wallpapers/wp-015', 1600, 900, '2026-11-03'::timestamptz),
  ('WP-016', 'Contemporary Fluid Marble', 'marble-texture', array['marble', 'texture', 'modern']::text[], 'Flowing marble veining in soft taupe.', false, 'published', '/catalogue/wallpapers/wp-016', 1600, 900, '2026-11-02'::timestamptz),
  ('WP-017', 'Sculpted Botanical Plaster', 'marble-texture', array['texture', 'plaster', 'botanical']::text[], 'Sculpted leaf relief in pale plaster.', false, 'published', '/catalogue/wallpapers/wp-017', 1600, 900, '2026-11-01'::timestamptz),
  ('WP-018', 'Shrinathji Pichwai', 'devotional-spiritual', array['devotional', 'pichwai', 'traditional']::text[], 'A devotional Pichwai with cows and lotuses.', true, 'published', '/catalogue/wallpapers/wp-018', 1600, 900, '2026-10-31'::timestamptz)
on conflict (id) do nothing;
