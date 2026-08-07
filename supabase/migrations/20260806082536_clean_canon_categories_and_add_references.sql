insert into public.private_canon_category_types (slug, name, sort_order, is_active, updated_at)
values ('technology-science', 'Technology and Science', 50, true, now())
on conflict (slug) do update
set name = excluded.name, sort_order = excluded.sort_order, is_active = true, updated_at = now();

update public.story_canon_rules
set rule_category = case
  when rule_category = 'character' then 'characters'
  when rule_category in ('history', 'jonas') then 'timeline-history'
  when rule_category = 'culture' then 'culture-customs'
  when rule_category in ('science', 'technology', 'magic-technology') then 'technology-science'
  else rule_category
end,
updated_at = now()
where rule_category in ('character', 'history', 'jonas', 'culture', 'science', 'technology', 'magic-technology');

update public.private_canon_field_definitions
set category_slug = 'technology-science', updated_at = now()
where category_slug = 'technology';

update public.private_canon_category_types
set is_active = false, updated_at = now()
where slug in ('character', 'history', 'jonas', 'culture', 'science', 'technology', 'magic-technology');

create table if not exists public.private_canon_references (
  id uuid primary key default gen_random_uuid(),
  canon_project_id uuid not null references public.private_canon_projects(id) on delete cascade,
  canon_rule_id uuid not null references public.story_canon_rules(id) on delete cascade,
  reference_type text not null default 'web'
    check (reference_type in ('web', 'document', 'book', 'paper', 'dataset', 'internal', 'other')),
  title text not null check (length(btrim(title)) > 0),
  citation text,
  url text,
  media_asset_id uuid references public.media_assets(id) on delete restrict,
  description text,
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object'),
  review_status text not null default 'draft'
    check (review_status in ('draft', 'review', 'approved', 'rejected', 'superseded')),
  is_public boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint private_canon_references_target_check
    check (url is not null or media_asset_id is not null or citation is not null)
);

create unique index if not exists private_canon_references_rule_identity_uidx
  on public.private_canon_references (canon_rule_id, reference_type, title);
create index if not exists private_canon_references_feed_idx
  on public.private_canon_references (canon_rule_id, review_status, sort_order, created_at, id);

alter table public.private_canon_references enable row level security;

drop policy if exists private_canon_references_admin_all on public.private_canon_references;
create policy private_canon_references_admin_all
on public.private_canon_references
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = (select auth.uid()) and p.is_admin = true
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.user_id = (select auth.uid()) and p.is_admin = true
  )
);

drop policy if exists private_canon_references_powerbi_select on public.private_canon_references;
create policy private_canon_references_powerbi_select
on public.private_canon_references
for select
to powerbi_reader
using (true);

revoke all on table public.private_canon_references from anon;
grant select, insert, update, delete on table public.private_canon_references to authenticated;
grant all on table public.private_canon_references to service_role;
grant select on table public.private_canon_references to powerbi_reader;

create or replace view public.private_canon_resource_feed
with (security_invoker = true)
as
select
  a.id,
  a.canon_project_id,
  a.canon_rule_id,
  'image'::text as resource_kind,
  a.title,
  a.description,
  a.asset_role as resource_role,
  m.public_url as resource_url,
  a.media_asset_id,
  a.review_status,
  a.sort_order,
  a.is_primary_reference,
  a.created_at,
  a.updated_at
from public.private_canon_assets a
join public.media_assets m on m.id = a.media_asset_id
union all
select
  r.id,
  r.canon_project_id,
  r.canon_rule_id,
  'reference'::text as resource_kind,
  r.title,
  coalesce(r.description, r.citation) as description,
  r.reference_type as resource_role,
  r.url as resource_url,
  r.media_asset_id,
  r.review_status,
  r.sort_order,
  false as is_primary_reference,
  r.created_at,
  r.updated_at
from public.private_canon_references r;

revoke all on public.private_canon_resource_feed from anon;
grant select on public.private_canon_resource_feed to authenticated, service_role, powerbi_reader;
