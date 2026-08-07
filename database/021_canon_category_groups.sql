-- Canon category grouping layer for Story Studio
-- Applied to Supabase project qsyapcprhhmlsgdzclwq on 07/Aug/2026.

create table if not exists public.private_canon_category_groups (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.private_canon_category_types
  add column if not exists group_id uuid null
  references public.private_canon_category_groups(id) on delete set null;

create index if not exists private_canon_category_types_group_id_idx
  on public.private_canon_category_types(group_id);

insert into public.private_canon_category_groups (slug,name,sort_order,is_active)
values
  ('characters','Characters',10,true),
  ('world-building','World Building',20,true),
  ('history','History',30,true),
  ('narrative','Narrative',40,true)
on conflict (slug) do update
set name=excluded.name,
    sort_order=excluded.sort_order,
    is_active=excluded.is_active,
    updated_at=now();

update public.private_canon_category_types t set group_id=g.id, updated_at=now()
from public.private_canon_category_groups g
where g.slug='characters' and t.slug in ('characters');

update public.private_canon_category_types t set group_id=g.id, updated_at=now()
from public.private_canon_category_groups g
where g.slug='world-building' and t.slug in (
  'locations','factions','world-rules','technology-science','governance','objects',
  'relationships','map','routes','visual-identity','language-pronunciation',
  'culture-customs','setting','ethics'
);

update public.private_canon_category_types t set group_id=g.id, updated_at=now()
from public.private_canon_category_groups g
where g.slug='history' and t.slug in ('timeline-history');

update public.private_canon_category_types t set group_id=g.id, updated_at=now()
from public.private_canon_category_groups g
where g.slug='narrative' and t.slug in (
  'continuity','storytelling','character-knowledge','mysteries-secrets',
  'dreams','season','production-guidance','theme'
);

create or replace function public.get_studio_private_canon(p_story_slug text, p_studio_mode boolean default false)
returns jsonb
language sql
stable
security definer
set search_path to ''
as $function$
with selected_project as (
  select p.id, p.slug, p.title, p.content_status,
         s.slug as story_slug, s.title as story_title
  from public.private_canon_projects p
  left join public.stories s on s.id = p.linked_story_id
  where p.slug = p_story_slug and p.content_status <> 'archived'
),
active_records as (
  select c.id, c.canon_key, c.title, c.rule_category as raw_category,
         case when t.slug is not null then t.slug else 'other' end as category,
         case when t.slug is not null then t.name else 'Other' end as category_label,
         coalesce(t.sort_order, 2147483647) as category_sort_order,
         g.id as group_id,
         coalesce(g.slug,'other') as group_slug,
         coalesce(g.name,'Other') as group_name,
         coalesce(g.sort_order,2147483647) as group_sort_order,
         c.rule_text as rule, c.importance, c.canon_state,
         c.content_status, c.spoiler_level, c.updated_at
  from public.story_canon_rules c
  join selected_project p on p.id = c.canon_project_id
  left join public.private_canon_category_types t
    on t.slug = lower(btrim(c.rule_category)) and t.is_active = true
  left join public.private_canon_category_groups g
    on g.id = t.group_id and g.is_active = true
  where c.canon_state in ('proposed','confirmed')
    and c.content_status <> 'archived'
),
canon_assets as (
  select a.canon_project_id, a.canon_rule_id, a.id, a.asset_role,
         a.review_status, a.title, a.description, a.consistency_notes,
         a.prompt_text, a.negative_prompt_text, a.refinement_direction,
         a.reviewer_notes, a.is_primary_reference, a.sort_order, a.updated_at,
         m.id as media_asset_id, m.public_url, m.storage_path, m.mime_type,
         m.lifecycle_status as media_lifecycle_status, m.version_number,
         m.parent_asset_id, m.is_approved as media_is_approved,
         m.generation_notes, m.metadata_json
  from public.private_canon_assets a
  join selected_project p on p.id = a.canon_project_id
  join public.media_assets m on m.id = a.media_asset_id
),
canon_fields as (
  select v.canon_rule_id, d.field_key, d.label, d.value_type,
         d.help_text, d.sort_order, v.value_json
  from public.story_canon_rule_field_values v
  join active_records r on r.id = v.canon_rule_id
  join public.private_canon_field_definitions d on d.id = v.field_definition_id
  where d.is_active = true
),
canon_references as (
  select ref.canon_rule_id, ref.id, ref.reference_type, ref.title,
         ref.citation, ref.url, ref.description, ref.review_status,
         ref.sort_order, ref.metadata, ref.updated_at
  from public.private_canon_references ref
  join active_records r on r.id = ref.canon_rule_id
),
canon_relationships as (
  select rel.source_canon_rule_id as canon_rule_id, rel.id,
         rel.relationship_type, rel.description, rel.sort_order,
         target.id as target_id, target.canon_key as target_canon_key,
         target.title as target_title, target.rule_category as target_category
  from public.private_canon_rule_relationships rel
  join active_records source on source.id = rel.source_canon_rule_id
  join public.story_canon_rules target on target.id = rel.target_canon_rule_id
),
categories as (
  select distinct category, category_label, category_sort_order,
         group_id, group_slug, group_name, group_sort_order
  from active_records
)
select case
  when not coalesce(p_studio_mode,false) then null
  when not exists (select 1 from selected_project) then null
  else jsonb_build_object(
    'canon', (select jsonb_build_object(
      'slug', p.slug, 'title', p.title, 'content_status', p.content_status,
      'linked_story_slug', p.story_slug
    ) from selected_project p),
    'story', (select case when p.story_slug is null then null else
      jsonb_build_object('slug',p.story_slug,'title',p.story_title) end
      from selected_project p),
    'categories', coalesce((select jsonb_agg(jsonb_build_object(
      'slug',c.category,'name',c.category_label,'sort_order',c.category_sort_order,
      'group_id',c.group_id,'group_slug',c.group_slug,'group_name',c.group_name,
      'group_sort_order',c.group_sort_order
    ) order by c.group_sort_order,c.group_name,c.category_sort_order,c.category_label)
    from categories c),'[]'::jsonb),
    'records', coalesce((select jsonb_agg(jsonb_build_object(
      'id',r.id,'canon_key',r.canon_key,'title',r.title,'category',r.category,
      'category_label',r.category_label,'raw_category',r.raw_category,'rule',r.rule,
      'importance',r.importance,'canon_state',r.canon_state,
      'content_status',r.content_status,'spoiler_level',r.spoiler_level,
      'updated_at',r.updated_at,
      'fields', coalesce((select jsonb_agg(jsonb_build_object(
        'key',f.field_key,'label',f.label,'value_type',f.value_type,
        'help_text',f.help_text,'value',f.value_json,'sort_order',f.sort_order
      ) order by f.sort_order,f.label) from canon_fields f
      where f.canon_rule_id = r.id),'[]'::jsonb),
      'relationships', coalesce((select jsonb_agg(jsonb_build_object(
        'id',rel.id,'relationship_type',rel.relationship_type,
        'description',rel.description,'sort_order',rel.sort_order,
        'target_id',rel.target_id,'target_canon_key',rel.target_canon_key,
        'target_title',rel.target_title,'target_category',rel.target_category
      ) order by rel.sort_order,rel.target_title) from canon_relationships rel
      where rel.canon_rule_id = r.id),'[]'::jsonb),
      'images', coalesce((select jsonb_agg(jsonb_build_object(
        'id',a.id,'media_asset_id',a.media_asset_id,'asset_role',a.asset_role,
        'review_status',a.review_status,'title',a.title,'description',a.description,
        'consistency_notes',a.consistency_notes,'prompt_text',a.prompt_text,
        'negative_prompt_text',a.negative_prompt_text,
        'refinement_direction',a.refinement_direction,
        'reviewer_notes',a.reviewer_notes,'is_primary_reference',a.is_primary_reference,
        'sort_order',a.sort_order,'updated_at',a.updated_at,
        'public_url',a.public_url,'storage_path',a.storage_path,'mime_type',a.mime_type,
        'media_lifecycle_status',a.media_lifecycle_status,'version_number',a.version_number,
        'parent_asset_id',a.parent_asset_id,'media_is_approved',a.media_is_approved,
        'generation_notes',a.generation_notes,'metadata_json',a.metadata_json
      ) order by a.is_primary_reference desc,a.sort_order,a.updated_at desc)
      from canon_assets a where a.canon_rule_id = r.id),'[]'::jsonb),
      'references', coalesce((select jsonb_agg(jsonb_build_object(
        'id',ref.id,'reference_type',ref.reference_type,'title',ref.title,
        'citation',ref.citation,'url',ref.url,'description',ref.description,
        'review_status',ref.review_status,'sort_order',ref.sort_order,
        'metadata',ref.metadata,'updated_at',ref.updated_at
      ) order by ref.sort_order,ref.title) from canon_references ref
      where ref.canon_rule_id = r.id),'[]'::jsonb)
    ) order by r.group_sort_order,r.group_name,r.category_sort_order,r.category_label,r.title,r.canon_key)
    from active_records r),'[]'::jsonb),
    'project_images', coalesce((select jsonb_agg(jsonb_build_object(
      'id',a.id,'media_asset_id',a.media_asset_id,'asset_role',a.asset_role,
      'review_status',a.review_status,'title',a.title,'description',a.description,
      'consistency_notes',a.consistency_notes,'prompt_text',a.prompt_text,
      'negative_prompt_text',a.negative_prompt_text,'refinement_direction',a.refinement_direction,
      'reviewer_notes',a.reviewer_notes,'is_primary_reference',a.is_primary_reference,
      'sort_order',a.sort_order,'updated_at',a.updated_at,'public_url',a.public_url,
      'storage_path',a.storage_path,'mime_type',a.mime_type,
      'media_lifecycle_status',a.media_lifecycle_status,'version_number',a.version_number,
      'parent_asset_id',a.parent_asset_id,'media_is_approved',a.media_is_approved,
      'generation_notes',a.generation_notes,'metadata_json',a.metadata_json
    ) order by a.is_primary_reference desc,a.sort_order,a.updated_at desc)
    from canon_assets a where a.canon_rule_id is null),'[]'::jsonb)
  )
end
$function$;

create or replace function public.get_studio_story_dashboard(p_story_id uuid, p_studio_mode boolean default false)
returns jsonb
language sql
stable
security definer
set search_path to ''
as $function$
with base_payload as (
  select coalesce(public.get_studio_story_dashboard_core(p_story_id,p_studio_mode),'{}'::jsonb) as payload
),
story_row as (
  select s.id,s.slug from public.stories s where s.id=p_story_id
),
private_payload as (
  select public.get_studio_private_canon(s.slug,p_studio_mode) as payload from story_row s
),
private_records as (
  select r from private_payload p
  cross join lateral jsonb_array_elements(coalesce(p.payload->'records','[]'::jsonb)) r
),
private_categories as (
  select c from private_payload p
  cross join lateral jsonb_array_elements(coalesce(p.payload->'categories','[]'::jsonb)) c
),
dashboard_categories as (
  select coalesce(jsonb_agg(
    c || jsonb_build_object(
      'description',null,
      'record_count',(select count(*) from private_records r where r.r->>'category'=c->>'slug')
    ) order by
      coalesce((c->>'group_sort_order')::integer,2147483647),
      c->>'group_name',(c->>'sort_order')::integer,c->>'name'
  ),'[]'::jsonb) as payload
  from private_categories
),
dashboard_records as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',r->>'id','slug',r->>'canon_key','category',r->>'category',
    'category_label',r->>'category_label','title',r->>'title',
    'summary',case when length(r->>'rule')>240 then left(r->>'rule',237)||'...' else r->>'rule' end,
    'description',r->>'rule','rule',r->>'rule','content_status',r->>'content_status',
    'canon_state',r->>'canon_state','is_public',false,
    'spoiler_level',coalesce((r->>'spoiler_level')::integer,0),'updated_at',r->>'updated_at',
    'reveal_episode',null,'sections','[]'::jsonb,'fields',coalesce(r->'fields','[]'::jsonb),
    'references',coalesce(r->'references','[]'::jsonb),'relationships',coalesce(r->'relationships','[]'::jsonb),
    'images',coalesce((select jsonb_agg(jsonb_build_object(
      'id',i->>'id','public_url',i->>'public_url','alt_text',coalesce(i->>'description',i->>'title'),
      'caption',i->>'description','title',i->>'title','asset_role',i->>'asset_role',
      'review_status',i->>'review_status','is_primary_reference',coalesce((i->>'is_primary_reference')::boolean,false),
      'sort_order',coalesce((i->>'sort_order')::integer,0)
    ) order by coalesce((i->>'is_primary_reference')::boolean,false) desc,
      coalesce((i->>'sort_order')::integer,0),i->>'title')
      from jsonb_array_elements(coalesce(r->'images','[]'::jsonb)) i),'[]'::jsonb),
    'character_profile',null,
    'related_records',coalesce((select jsonb_agg(jsonb_build_object(
      'id',rel->>'target_id','title',rel->>'target_title','slug',rel->>'target_canon_key',
      'category',rel->>'target_category','relationship_type',rel->>'relationship_type',
      'description',rel->>'description'
    ) order by coalesce((rel->>'sort_order')::integer,0),rel->>'target_title')
      from jsonb_array_elements(coalesce(r->'relationships','[]'::jsonb)) rel),'[]'::jsonb),
    'linked_episodes',coalesce((select jsonb_agg(jsonb_build_object(
      'id',e.id,'season_number',e.season_number,'episode_number',e.episode_number,
      'title',e.title,'appearance_type',link.link_type,'notes',link.notes
    ) order by link.sort_order,e.season_number,e.episode_number)
      from public.private_canon_rule_episodes link
      join public.episodes e on e.id=link.episode_id
      where link.canon_rule_id=(r->>'id')::uuid),'[]'::jsonb)
  ) order by r->>'category_label',r->>'title',r->>'canon_key'),'[]'::jsonb) as payload
  from private_records
)
select (select payload from base_payload) || jsonb_build_object(
  'planning',(
    select jsonb_build_object(
      'id',sp.id,'story_id',sp.story_id,'season_number',sp.season_number,'title',sp.title,
      'planning',sp.planning,'content_status',sp.content_status,'updated_at',sp.updated_at
    ) from public.story_plans sp where sp.story_id=p_story_id
      order by sp.season_number nulls first limit 1
  ),
  'canon_categories',(select payload from dashboard_categories),
  'canon_records',(select payload from dashboard_records),
  'counts',coalesce((select payload->'counts' from base_payload),'{}'::jsonb)
    || jsonb_build_object('canon_records',(select count(*) from private_records))
)
$function$;
