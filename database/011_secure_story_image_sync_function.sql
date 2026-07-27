-- Restrict the legacy administrative image backfill.
-- Normal uploads must use the authenticated story-artwork-production Edge Function.

revoke all on function public.sync_existing_story_images(text, text) from public;
revoke all on function public.sync_existing_story_images(text, text) from anon;
revoke all on function public.sync_existing_story_images(text, text) from authenticated;
grant execute on function public.sync_existing_story_images(text, text) to service_role;

comment on function public.sync_existing_story_images(text, text) is
'Administrative backfill only. Normal artwork uploads must use the story-artwork-production Edge Function.';
