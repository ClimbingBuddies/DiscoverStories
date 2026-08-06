create or replace function public.get_studio_story_dashboard(
  p_story_id uuid,
  p_studio_mode boolean default false
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $function$
with base_payload as (
  select coalesce(
    public.get_studio_story_dashboard_core(p_story_id, p_studio_mode),
    '{}'::jsonb
  ) as payload
),
story_row as (
  select s.id, s.slug
  from public.stories s
  where s.id = p_story_id
),
private_payload as (
  select public.get_studio_private_canon(s.slug, p_studio_mode) as payload
  from story_row s
),
private_records as (
  select r
  from private_payload p
  cross join lateral jsonb_array_elements(coalesce(p.payload->'records', '[]'::jsonb)) r
),
private_categories as (
  select c
  from private_payload p
  cross join lateral jsonb_array_elements(coalesce(p.payload->'categories', '[]'::jsonb)) c
),
dashboard_categories as (
  select coalesce(jsonb_agg(
    c || jsonb_build_object(
      'description', null,
      'record_count', (
        select count(*)
        from private_records r
        where r.r->>'category' = c->>'slug'
      )
    ) order by (c->>'sort_order')::integer, c->>'name'
  ), '[]'::jsonb) as payload
  from private_categories
),
dashboard_records as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', r->>'id',
    'slug', r->>'canon_key',
    'category', r->>'category',
    'category_label', r->>'category_label',
    'title', r->>'title',
    'summary', case
      when length(r->>'rule') > 240 then left(r->>'rule', 237) || '...'
      else r->>'rule'
    end,
    'description', r->>'rule',
    'rule', r->>'rule',
    'content_status', r->>'content_status',
    'canon_state', r->>'canon_state',
    'is_public', false,
    'spoiler_level', coalesce((r->>'spoiler_level')::integer, 0),
    'updated_at', r->>'updated_at',
    'reveal_episode', null,
    'sections', '[]'::jsonb,
    'fields', coalesce(r->'fields', '[]'::jsonb),
    'references', coalesce(r->'references', '[]'::jsonb),
    'relationships', coalesce(r->'relationships', '[]'::jsonb),
    'images', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', i->>'id',
        'public_url', i->>'public_url',
        'alt_text', coalesce(i->>'description', i->>'title'),
        'caption', i->>'description',
        'title', i->>'title',
        'asset_role', i->>'asset_role',
        'review_status', i->>'review_status',
        'is_primary_reference', coalesce((i->>'is_primary_reference')::boolean, false),
        'sort_order', coalesce((i->>'sort_order')::integer, 0)
      ) order by
        coalesce((i->>'is_primary_reference')::boolean, false) desc,
        coalesce((i->>'sort_order')::integer, 0),
        i->>'title')
      from jsonb_array_elements(coalesce(r->'images', '[]'::jsonb)) i
    ), '[]'::jsonb),
    'character_profile', null,
    'related_records', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', rel->>'target_id',
        'title', rel->>'target_title',
        'slug', rel->>'target_canon_key',
        'category', rel->>'target_category',
        'relationship_type', rel->>'relationship_type',
        'description', rel->>'description'
      ) order by coalesce((rel->>'sort_order')::integer, 0), rel->>'target_title')
      from jsonb_array_elements(coalesce(r->'relationships', '[]'::jsonb)) rel
    ), '[]'::jsonb),
    'linked_episodes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', e.id,
        'season_number', e.season_number,
        'episode_number', e.episode_number,
        'title', e.title,
        'appearance_type', link.link_type,
        'notes', link.notes
      ) order by link.sort_order, e.season_number, e.episode_number)
      from public.private_canon_rule_episodes link
      join public.episodes e on e.id = link.episode_id
      where link.canon_rule_id = (r->>'id')::uuid
    ), '[]'::jsonb)
  ) order by
    r->>'category_label',
    r->>'title',
    r->>'canon_key'), '[]'::jsonb) as payload
  from private_records
)
select (select payload from base_payload) || jsonb_build_object(
  'planning', (
    select jsonb_build_object(
      'id', sp.id,
      'story_id', sp.story_id,
      'season_number', sp.season_number,
      'title', sp.title,
      'planning', sp.planning,
      'content_status', sp.content_status,
      'updated_at', sp.updated_at
    )
    from public.story_plans sp
    where sp.story_id = p_story_id
    order by sp.season_number nulls first
    limit 1
  ),
  'canon_categories', (select payload from dashboard_categories),
  'canon_records', (select payload from dashboard_records),
  'counts', coalesce((select payload->'counts' from base_payload), '{}'::jsonb)
    || jsonb_build_object(
      'canon_records', (select count(*) from private_records)
    )
)
$function$;

comment on function public.get_studio_story_dashboard(uuid, boolean) is
  'Returns the Story Studio dashboard with Private Canon categories, records, category fields, relationships, images, references and episode links.';
