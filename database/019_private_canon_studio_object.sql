-- Private Canon is an independent Studio-only content object.
-- Applied to Supabase as migration: separate_private_canon_studio_object.

alter table public.story_canon_rules
    add column if not exists canon_key text,
    add column if not exists title text,
    add column if not exists canon_state text not null default 'confirmed';

update public.story_canon_rules
set canon_key = 'legacy-' || replace(id::text, '-', '')
where canon_key is null;

update public.story_canon_rules
set title = initcap(replace(rule_category, '_', ' '))
where title is null;

update public.story_canon_rules set is_public = false;

alter table public.story_canon_rules
    alter column canon_key set not null,
    alter column title set not null,
    drop constraint if exists story_canon_rules_canon_state_check,
    add constraint story_canon_rules_canon_state_check
        check (canon_state in ('proposed', 'confirmed', 'superseded', 'retired')),
    drop constraint if exists story_canon_rules_private_only_check,
    add constraint story_canon_rules_private_only_check check (is_public = false);

create unique index if not exists story_canon_rules_story_canon_key_uidx
    on public.story_canon_rules (story_id, canon_key);

drop policy if exists story_canon_rules_spoiler_aware_read on public.story_canon_rules;
revoke select on public.story_canon_rules from anon;

create or replace function public.get_studio_private_canon(
    p_story_slug text,
    p_studio_mode boolean default false
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $function$
    select case when not coalesce(p_studio_mode, false) then null else (
        select jsonb_build_object(
            'story', jsonb_build_object('slug', s.slug, 'title', s.title),
            'records', coalesce(jsonb_agg(jsonb_build_object(
                'id', c.id, 'canon_key', c.canon_key, 'title', c.title,
                'category', c.rule_category, 'rule', c.rule_text,
                'importance', c.importance, 'canon_state', c.canon_state,
                'content_status', c.content_status, 'spoiler_level', c.spoiler_level,
                'updated_at', c.updated_at
            ) order by c.rule_category, c.title, c.canon_key)
            filter (where c.id is not null), '[]'::jsonb)
        )
        from public.stories s
        left join public.story_canon_rules c on c.story_id = s.id
          and c.canon_state in ('proposed', 'confirmed')
          and c.content_status <> 'archived'
        where s.slug = p_story_slug
        group by s.id, s.slug, s.title
    ) end;
$function$;

revoke all on function public.get_studio_private_canon(text, boolean) from public;
grant execute on function public.get_studio_private_canon(text, boolean) to anon, authenticated;

create or replace function public.sync_private_canon(
    p_story_slug text, p_canon_key text, p_title text, p_rule_category text,
    p_rule_text text, p_importance text default 'normal',
    p_canon_state text default 'confirmed', p_content_status text default 'draft',
    p_spoiler_level integer default 0
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $function$
declare
    v_story_id uuid;
    v_id uuid;
begin
    select id into v_story_id from public.stories where slug = p_story_slug;
    if v_story_id is null then raise exception 'Story not found: %', p_story_slug; end if;

    insert into public.story_canon_rules (
        story_id, canon_key, title, rule_category, rule_text, importance,
        canon_state, content_status, spoiler_level, is_public
    ) values (
        v_story_id, p_canon_key, p_title, p_rule_category, p_rule_text,
        p_importance, p_canon_state, p_content_status, p_spoiler_level, false
    )
    on conflict (story_id, canon_key) do update set
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

revoke all on function public.sync_private_canon(text, text, text, text, text, text, text, text, integer)
from public, anon, authenticated;
grant execute on function public.sync_private_canon(text, text, text, text, text, text, text, text, integer)
to service_role;
