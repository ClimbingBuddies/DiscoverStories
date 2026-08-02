begin;

-- Application-side reference migration for the already-deployed Reader media layer.
-- Apply only where these objects do not already exist in the Supabase project.
-- No episode_images table is required.

comment on table public.media_assets is
  'Central media registry for approved artwork, educational visuals and Reader-controlled media.';

comment on view public.episode_reader_media is
  'Reader-safe projection of approved, Reader-visible media_assets records.';

commit;
