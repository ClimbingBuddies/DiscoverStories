-- 010_link_story_images.sql
-- Links all published stories and episodes to their artwork images in Supabase Storage.
-- Expected storage paths in bucket `story-images`:
--   {story-slug}/cover.png
--   {story-slug}/banner.png
--   {story-slug}/episodes/episode-{episode_number}.png

BEGIN;

-- Update story cover and banner images
UPDATE public.stories s
SET
  cover_image_path = COALESCE(s.cover_image_path, format('%s/cover.png', s.slug)),
  banner_image_path = COALESCE(s.banner_image_path, format('%s/banner.png', s.slug)),
  updated_at = now()
WHERE s.content_status = 'published'
  AND (s.cover_image_path IS NULL OR s.banner_image_path IS NULL);

-- Update episode artwork paths
UPDATE public.episodes e
SET
  artwork_path = COALESCE(
    e.artwork_path,
    format(
      '%s/episodes/%s-s%se%s.png',
      s.slug,
      s.slug,
      lpad(e.season_number::text, 2, '0'),
      lpad(e.episode_number::text, 2, '0')
    )
  ),
  updated_at = now()
FROM public.stories s
WHERE e.story_id = s.id
  AND e.episode_status = 'published'
  AND e.artwork_path IS NULL;

COMMIT;

-- Verification
SELECT s.slug, s.title, s.cover_image_path, s.banner_image_path,
       e.episode_number, e.title, e.artwork_path
FROM public.stories s
LEFT JOIN public.episodes e ON e.story_id = s.id
WHERE s.content_status = 'published'
ORDER BY s.slug, e.episode_number;
