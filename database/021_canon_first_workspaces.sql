-- Canon-first workspaces.
-- Private Canon can now exist and be loaded before a story, episode or Wiki.

begin;

create table if not exists public.private_canon_projects (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    title text not null,
    linked_story_id uuid unique references public.stories(id) on delete set null,
    content_status text not null default 'draft'
        check (content_status in ('draft', 'review', 'archived')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint private_canon_projects_slug_lowercase check (slug = lower(slug))
);

alter table public.private_canon_projects enable row level security;
revoke all on public.private_canon_projects from public, anon, authenticated;
grant select, insert, update, delete on public.private_canon_projects to service_role;

drop policy if exists private_canon_projects_admin_all
    on public.private_canon_projects;
create policy private_canon_projects_admin_all
    on public.private_canon_projects
    for all
    to authenticated
    using (
        exists (
            select 1
            from public.profiles p
            where p.user_id = (select auth.uid())
              and p.is_admin = true
        )
    )
    with check (
        exists (
            select 1
            from public.profiles p
            where p.user_id = (select auth.uid())
              and p.is_admin = true
        )
    );

insert into public.private_canon_projects (slug, title, linked_story_id)
select s.slug, s.title, s.id
from public.stories s
on conflict (slug) do update
set title = excluded.title,
    linked_story_id = excluded.linked_story_id,
    updated_at = now();

alter table public.story_canon_rules
    add column if not exists canon_project_id uuid;

update public.story_canon_rules c
set canon_project_id = p.id
from public.private_canon_projects p
where p.linked_story_id = c.story_id
  and c.canon_project_id is null;

alter table public.story_canon_rules
    alter column canon_project_id set not null,
    alter column story_id drop not null,
    drop constraint if exists story_canon_rules_canon_project_id_fkey,
    add constraint story_canon_rules_canon_project_id_fkey
        foreign key (canon_project_id)
        references public.private_canon_projects(id)
        on delete cascade,
    drop constraint if exists story_canon_rules_canon_state_check,
    add constraint story_canon_rules_canon_state_check
        check (canon_state in ('proposed', 'confirmed'));

drop index if exists public.story_canon_rules_story_canon_key_uidx;
create unique index if not exists story_canon_rules_project_canon_key_uidx
    on public.story_canon_rules (canon_project_id, canon_key);

insert into public.private_canon_category_types (slug, name, sort_order)
values
    ('characters', 'Characters', 10),
    ('locations', 'Locations', 20),
    ('factions', 'Factions', 30),
    ('world-rules', 'World Rules', 40),
    ('magic-technology', 'Magic or Technology', 50),
    ('timeline-history', 'Timeline and History', 60),
    ('objects', 'Objects', 70),
    ('relationships', 'Relationships', 80),
    ('mysteries-secrets', 'Mysteries and Secrets', 90),
    ('character-knowledge', 'Character Knowledge', 100),
    ('visual-identity', 'Visual Identity', 110),
    ('language-pronunciation', 'Language and Pronunciation', 120),
    ('culture-customs', 'Culture and Customs', 130),
    ('production-guidance', 'Production Guidance', 140)
on conflict (slug) do update
set name = excluded.name,
    sort_order = excluded.sort_order,
    is_active = true,
    updated_at = now();

create or replace function public.sync_private_canon_project(
    p_canon_slug text,
    p_title text,
    p_linked_story_slug text default null,
    p_content_status text default 'draft'
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $function$
declare
    v_story_id uuid;
    v_project_id uuid;
begin
    if p_linked_story_slug is not null then
        select s.id
        into v_story_id
        from public.stories s
        where s.slug = p_linked_story_slug;

        if v_story_id is null then
            raise exception 'Story not found: %', p_linked_story_slug;
        end if;
    end if;

    insert into public.private_canon_projects (
        slug, title, linked_story_id, content_status
    )
    values (
        lower(btrim(p_canon_slug)),
        btrim(p_title),
        v_story_id,
        p_content_status
    )
    on conflict (slug) do update
    set title = excluded.title,
        linked_story_id = coalesce(
            excluded.linked_story_id,
            public.private_canon_projects.linked_story_id
        ),
        content_status = excluded.content_status,
        updated_at = now()
    returning id into v_project_id;

    update public.story_canon_rules c
    set story_id = p.linked_story_id,
        updated_at = now()
    from public.private_canon_projects p
    where p.id = v_project_id
      and c.canon_project_id = p.id
      and c.story_id is distinct from p.linked_story_id;

    return v_project_id;
end;
$function$;

revoke all on function public.sync_private_canon_project(text, text, text, text)
    from public, anon, authenticated;
grant execute on function public.sync_private_canon_project(text, text, text, text)
    to service_role;

create or replace function public.sync_private_canon(
    p_story_slug text,
    p_canon_key text,
    p_title text,
    p_rule_category text,
    p_rule_text text,
    p_importance text default 'normal',
    p_canon_state text default 'confirmed',
    p_content_status text default 'draft',
    p_spoiler_level integer default 0
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $function$
declare
    v_project_id uuid;
    v_story_id uuid;
    v_id uuid;
begin
    select p.id, p.linked_story_id
    into v_project_id, v_story_id
    from public.private_canon_projects p
    where p.slug = p_story_slug;

    if v_project_id is null then
        raise exception 'Private Canon workspace not found: %', p_story_slug;
    end if;

    insert into public.story_canon_rules (
        canon_project_id,
        story_id,
        canon_key,
        title,
        rule_category,
        rule_text,
        importance,
        canon_state,
        content_status,
        spoiler_level,
        is_public
    )
    values (
        v_project_id,
        v_story_id,
        lower(btrim(p_canon_key)),
        btrim(p_title),
        coalesce(nullif(lower(btrim(p_rule_category)), ''), 'other'),
        p_rule_text,
        p_importance,
        p_canon_state,
        p_content_status,
        p_spoiler_level,
        false
    )
    on conflict (canon_project_id, canon_key) do update
    set story_id = excluded.story_id,
        title = excluded.title,
        rule_category = excluded.rule_category,
        rule_text = excluded.rule_text,
        importance = excluded.importance,
        canon_state = excluded.canon_state,
        content_status = excluded.content_status,
        spoiler_level = excluded.spoiler_level,
        is_public = false,
        updated_at = now()
    returning id into v_id;

    return v_id;
end;
$function$;

revoke all on function public.sync_private_canon(
    text, text, text, text, text, text, text, text, integer
) from public, anon, authenticated;
grant execute on function public.sync_private_canon(
    text, text, text, text, text, text, text, text, integer
) to service_role;

create or replace function public.list_studio_private_canon(
    p_studio_mode boolean default false
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $function$
select case
    when not coalesce(p_studio_mode, false) then null
    else coalesce((
        select jsonb_agg(
            jsonb_build_object(
                'id', x.id,
                'slug', x.slug,
                'title', x.title,
                'content_status', x.content_status,
                'record_count', x.record_count,
                'confirmed_count', x.confirmed_count,
                'proposed_count', x.proposed_count,
                'linked_story', x.linked_story,
                'updated_at', x.latest_updated_at
            )
            order by x.title, x.slug
        )
        from (
            select
                p.id,
                p.slug,
                p.title,
                p.content_status,
                count(c.id) as record_count,
                count(c.id) filter (
                    where c.canon_state = 'confirmed'
                ) as confirmed_count,
                count(c.id) filter (
                    where c.canon_state = 'proposed'
                ) as proposed_count,
                case
                    when s.id is null then null
                    else jsonb_build_object('slug', s.slug, 'title', s.title)
                end as linked_story,
                greatest(
                    p.updated_at,
                    coalesce(max(c.updated_at), p.updated_at)
                ) as latest_updated_at
            from public.private_canon_projects p
            left join public.stories s on s.id = p.linked_story_id
            left join public.story_canon_rules c
              on c.canon_project_id = p.id
             and c.content_status <> 'archived'
            where p.content_status <> 'archived'
            group by p.id, p.slug, p.title, p.content_status, p.updated_at,
                     s.id, s.slug, s.title
        ) x
    ), '[]'::jsonb)
end;
$function$;

revoke all on function public.list_studio_private_canon(boolean) from public;
grant execute on function public.list_studio_private_canon(boolean)
    to anon, authenticated, service_role;

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
    select
        p.id,
        p.slug,
        p.title,
        p.content_status,
        s.slug as story_slug,
        s.title as story_title
    from public.private_canon_projects p
    left join public.stories s on s.id = p.linked_story_id
    where p.slug = p_story_slug
      and p.content_status <> 'archived'
),
active_records as (
    select
        c.id,
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
    join selected_project p on p.id = c.canon_project_id
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
    when not exists (select 1 from selected_project) then null
    else jsonb_build_object(
        'canon', (
            select jsonb_build_object(
                'slug', p.slug,
                'title', p.title,
                'content_status', p.content_status,
                'linked_story_slug', p.story_slug
            )
            from selected_project p
        ),
        'story', (
            select case
                when p.story_slug is null then null
                else jsonb_build_object(
                    'slug', p.story_slug,
                    'title', p.story_title
                )
            end
            from selected_project p
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

commit;
