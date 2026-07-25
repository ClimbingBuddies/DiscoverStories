-- 009_link_ash_and_silver_images.sql
-- Links Ash and Silver story + episode images using the storage path convention.
-- Safe to rerun.
--
-- Expected storage paths in bucket `story-images`:
--   ash-and-silver/cover.png
--   ash-and-silver/banner.png
--   ash-and-silver/episodes/ash-and-silver-s01e01.png ... ash-and-silver-s01e10.png

BEGIN;

WITH target_story AS (
  SELECT id
  FROM public.stories
  WHERE slug = 'ash-and-silver'
  LIMIT 1
)
UPDATE public.stories s
SET
  cover_image_path = COALESCE(s.cover_image_path, 'ash-and-silver/cover.png'),
  banner_image_path = COALESCE(s.banner_image_path, 'ash-and-silver/banner.png'),
  updated_at = now()
FROM target_story t
WHERE s.id = t.id;

WITH target_story AS (
  SELECT id
  FROM public.stories
  WHERE slug = 'ash-and-silver'
  LIMIT 1
)
UPDATE public.episodes e
SET
  artwork_path = COALESCE(
    e.artwork_path,
    format('ash-and-silver/episodes/ash-and-silver-s01e%s.png', lpad(e.episode_number::text, 2, '0'))
  ),
  updated_at = now()
FROM target_story t
WHERE e.story_id = t.id
  AND e.season_number = 1
  AND e.episode_number BETWEEN 1 AND 10;

COMMIT;

-- Verification
SELECT slug, title, cover_image_path, banner_image_path
FROM public.stories
WHERE slug = 'ash-and-silver';

SELECT season_number, episode_number, title, artwork_path
FROM public.episodes e
JOIN public.stories s ON s.id = e.story_id
WHERE s.slug = 'ash-and-silver'
ORDER BY season_number, episode_number;
