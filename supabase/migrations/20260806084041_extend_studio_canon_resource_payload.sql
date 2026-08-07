create or replace function public.get_studio_private_canon(
  p_story_slug text,
  p_studio_mode boolean default false
)
returns jsonb
language sql
stable
security definer
set search_path = ''
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
         c.rule_text as rule, c.importance, c.canon_state,
         c.content_status, c.spoiler_level, c.updated_at
  from public.story_canon_rules c
  join selected_project p on p.id = c.canon_project_id
  left join public.private_canon_category_types t
    on t.slug = lower(btrim(c.rule_category)) and t.is_active = true
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
  select distinct category, category_label, category_sort_order from active_records
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
      'slug',c.category,'name',c.category_label,'sort_order',c.category_sort_order
    ) order by c.category_sort_order,c.category_label) from categories c),'[]'::jsonb),
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
    ) order by r.category_sort_order,r.category_label,r.title,r.canon_key)
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

comment on function public.get_studio_private_canon(text, boolean) is
  'Returns Studio-only Canon records with category fields, relationships, images and references.';
