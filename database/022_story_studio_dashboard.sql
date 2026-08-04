-- Story Studio dashboard read model
-- Database-controlled story selector and selected-story drill-through.

create or replace function public.list_studio_story_options(p_studio_mode boolean default false)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $function$
  select case
    when not coalesce(p_studio_mode, false) then null
    else coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', s.id,
            'title', s.title,
            'slug', s.slug,
            'content_status', s.content_status
          )
          order by s.title
        )
        from public.stories s
      ),
      '[]'::jsonb
    )
  end;
$function$;

revoke all on function public.list_studio_story_options(boolean) from public;
grant execute on function public.list_studio_story_options(boolean) to authenticated;

create or replace function public.get_studio_story_dashboard(p_story_id uuid, p_studio_mode boolean default false)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $function$
  select jsonb_build_object(
    'story', jsonb_build_object('id', s.id, 'title', s.title, 'slug', s.slug, 'content_status', s.content_status, 'short_description', s.short_description, 'description', s.description, 'cover_image_url', s.cover_image_url),
    'premise', case when p.id is null then null else jsonb_build_object('id', p.id, 'premise_title', p.premise_title, 'premise_text', p.premise_text, 'content_status', p.content_status, 'version_number', p.version_number, 'updated_at', p.updated_at) end,
    'episodes', coalesce((select jsonb_agg(jsonb_build_object('id', e.id, 'episode_number', e.episode_number, 'season_number', e.season_number, 'title', e.title, 'summary', e.summary, 'episode_status', e.episode_status, 'word_count', e.word_count, 'artwork_url', e.artwork_url, 'artwork_path', e.artwork_path, 'script_text', e.script_text, 'updated_at', e.updated_at) order by e.season_number, e.episode_number) from public.episodes e where e.story_id = s.id), '[]'::jsonb),
    'planning_blocks', coalesce((select jsonb_agg(jsonb_build_object('id', b.id, 'season_number', b.season_number, 'block_number', b.block_number, 'episode_start', b.episode_start, 'episode_end', b.episode_end, 'title', b.title, 'arc_summary', b.arc_summary, 'content_status', b.content_status, 'updated_at', b.updated_at) order by b.season_number, b.block_number) from public.story_episode_planning_blocks b where b.story_id = s.id), '[]'::jsonb),
    'characters', coalesce((select jsonb_agg(jsonb_build_object('id', w.id, 'slug', w.slug, 'title', w.title, 'short_description', w.short_description, 'content_status', w.content_status) order by w.sort_order nulls last, w.title) from public.wiki_entries w where w.story_id = s.id and lower(w.entry_type) in ('character','characters')), '[]'::jsonb),
    'counts', jsonb_build_object(
      'episodes', (select count(*) from public.episodes e where e.story_id = s.id),
      'published_episodes', (select count(*) from public.episodes e where e.story_id = s.id and e.episode_status = 'published'),
      'draft_episodes', (select count(*) from public.episodes e where e.story_id = s.id and e.episode_status = 'draft'),
      'review_episodes', (select count(*) from public.episodes e where e.story_id = s.id and e.episode_status = 'review'),
      'planning_blocks', (select count(*) from public.story_episode_planning_blocks b where b.story_id = s.id),
      'characters', (select count(*) from public.wiki_entries w where w.story_id = s.id and lower(w.entry_type) in ('character','characters'))
    )
  )
  from public.stories s
  left join public.story_premises p on p.story_id = s.id
  where s.id = p_story_id;
$function$;

revoke all on function public.get_studio_story_dashboard(uuid, boolean) from public;
grant execute on function public.get_studio_story_dashboard(uuid, boolean) to authenticated;
