-- Database-driven Wiki and Private Canon browser support.
-- Applied to Supabase as migration: database_driven_knowledge_browsers.
--
-- Temporary access decision (approved 30 Jul 2026): the anonymous website role
-- may execute get_studio_private_canon while Studio is represented by the
-- existing caller-supplied toggle. This is not an authentication boundary and
-- must be replaced when Studio login is implemented.

create table if not exists public.private_canon_category_types (
    slug text primary key,
    name text not null,
    sort_order integer not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.private_canon_category_types enable row level security;
revoke all on public.private_canon_category_types from public, anon, authenticated;
grant select, insert, update, delete on public.private_canon_category_types to service_role;

insert into public.private_canon_category_types (slug, name, sort_order)
values
    ('character', 'Character', 10),
    ('continuity', 'Continuity', 20),
    ('culture', 'Culture', 30),
    ('dreams', 'Dreams', 40),
    ('ethics', 'Ethics', 50),
    ('governance', 'Governance', 60),
    ('history', 'History', 70),
    ('jonas', 'Jonas', 80),
    ('map', 'Map', 90),
    ('routes', 'Routes', 100),
    ('science', 'Science', 110),
    ('season', 'Season', 120),
    ('setting', 'Setting', 130),
    ('storytelling', 'Storytelling', 140),
    ('technology', 'Technology', 150),
    ('theme', 'Theme', 160)
on conflict (slug) do update set
    name = excluded.name,
    sort_order = excluded.sort_order,
    is_active = true,
    updated_at = now();

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
with selected_story as (
    select s.id, s.slug, s.title
    from public.stories s
    where s.slug = p_story_slug
),
active_records as (
    select
        c.id,
        c.story_id,
        c.canon_key,
        c.title,
        c.rule_category as raw_category,
        case when t.slug is not null then t.slug else 'other' end as category,
        case when t.slug is not null then t.name else 'Other' end as category_label,
        coalesce(t.sort_order, 2147483647) as category_sort_order,
        c.rule_text as rule,
        c.importance,
        c.canon_state,
        c.content_status,
        c.spoiler_level,
        c.updated_at
    from public.story_canon_rules c
    join selected_story s on s.id = c.story_id
    left join public.private_canon_category_types t
      on t.slug = lower(btrim(c.rule_category))
     and t.is_active = true
    where c.canon_state in ('proposed', 'confirmed')
      and c.content_status <> 'archived'
),
categories as (
    select distinct category, category_label, category_sort_order
    from active_records
)
select case
    when not coalesce(p_studio_mode, false) then null
    when not exists (select 1 from selected_story) then null
    else jsonb_build_object(
        'story', (
            select jsonb_build_object('slug', s.slug, 'title', s.title)
            from selected_story s
        ),
        'categories', coalesce((
            select jsonb_agg(
                jsonb_build_object(
                    'slug', c.category,
                    'name', c.category_label,
                    'sort_order', c.category_sort_order
                )
                order by c.category_sort_order, c.category_label
            )
            from categories c
        ), '[]'::jsonb),
        'records', coalesce((
            select jsonb_agg(
                jsonb_build_object(
                    'id', r.id,
                    'canon_key', r.canon_key,
                    'title', r.title,
                    'category', r.category,
                    'category_label', r.category_label,
                    'raw_category', r.raw_category,
                    'rule', r.rule,
                    'importance', r.importance,
                    'canon_state', r.canon_state,
                    'content_status', r.content_status,
                    'spoiler_level', r.spoiler_level,
                    'updated_at', r.updated_at
                )
                order by r.category_sort_order, r.category_label, r.title, r.canon_key
            )
            from active_records r
        ), '[]'::jsonb)
    )
end;
$function$;

revoke all on function public.get_studio_private_canon(text, boolean) from public;
grant execute on function public.get_studio_private_canon(text, boolean)
    to anon, authenticated, service_role;
