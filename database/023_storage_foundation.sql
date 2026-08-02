-- Release 2: Story storage foundation
--
-- Establishes durable season identity, story membership, and an empty private
-- storage bucket. Existing buckets, objects, and media pointers are unchanged.

create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  season_number integer not null check (season_number > 0),
  title text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint seasons_story_number_unique unique (story_id, season_number),
  constraint seasons_id_story_unique unique (id, story_id)
);

insert into public.seasons (story_id, season_number, title)
select
  stories.id,
  coalesce(episode_seasons.season_number, 1),
  'Season ' || coalesce(episode_seasons.season_number, 1)::text
from public.stories
left join (
  select distinct story_id, season_number
  from public.episodes
) as episode_seasons on episode_seasons.story_id = stories.id
on conflict (story_id, season_number) do nothing;

alter table public.episodes
  add column season_id uuid;

update public.episodes as episodes
set season_id = seasons.id
from public.seasons as seasons
where seasons.story_id = episodes.story_id
  and seasons.season_number = episodes.season_number;

alter table public.episodes
  alter column season_id set not null,
  add constraint episodes_season_story_fkey
    foreign key (season_id, story_id)
    references public.seasons(id, story_id)
    on delete cascade;

create index episodes_season_id_idx on public.episodes(season_id);

create table public.story_memberships (
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (
    role in ('owner', 'admin', 'editor', 'contributor', 'reviewer', 'reader')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (story_id, user_id)
);

create index story_memberships_user_id_idx
  on public.story_memberships(user_id, story_id);

alter table public.seasons enable row level security;
alter table public.story_memberships enable row level security;

revoke all on table public.seasons from anon, authenticated;
revoke all on table public.story_memberships from anon, authenticated;
grant select on table public.seasons to authenticated;
grant select on table public.story_memberships to authenticated;

create policy "Members can read their story memberships"
on public.story_memberships
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Members can read their seasons"
on public.seasons
for select
to authenticated
using (
  exists (
    select 1
    from public.story_memberships
    where story_memberships.story_id = seasons.story_id
      and story_memberships.user_id = (select auth.uid())
  )
);

-- The canonical bucket is private and empty in this release. Legacy buckets remain.
insert into storage.buckets (id, name, public)
values ('stories', 'stories', false)
on conflict (id) do update set public = false;

create policy "Story members can read private assets"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'stories'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and exists (
    select 1
    from public.story_memberships
    where story_memberships.story_id = ((storage.foldername(name))[1])::uuid
      and story_memberships.user_id = (select auth.uid())
      and story_memberships.role in ('owner', 'admin', 'editor', 'contributor', 'reviewer')
  )
);

create policy "Story contributors can create private assets"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'stories'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and exists (
    select 1
    from public.story_memberships
    where story_memberships.story_id = ((storage.foldername(name))[1])::uuid
      and story_memberships.user_id = (select auth.uid())
      and story_memberships.role in ('owner', 'admin', 'editor', 'contributor')
  )
);

create policy "Story contributors can update private assets"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'stories'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and exists (
    select 1
    from public.story_memberships
    where story_memberships.story_id = ((storage.foldername(name))[1])::uuid
      and story_memberships.user_id = (select auth.uid())
      and story_memberships.role in ('owner', 'admin', 'editor', 'contributor')
  )
)
with check (
  bucket_id = 'stories'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and exists (
    select 1
    from public.story_memberships
    where story_memberships.story_id = ((storage.foldername(name))[1])::uuid
      and story_memberships.user_id = (select auth.uid())
      and story_memberships.role in ('owner', 'admin', 'editor', 'contributor')
  )
);

create policy "Story editors can delete private assets"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'stories'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and exists (
    select 1
    from public.story_memberships
    where story_memberships.story_id = ((storage.foldername(name))[1])::uuid
      and story_memberships.user_id = (select auth.uid())
      and story_memberships.role in ('owner', 'admin', 'editor')
  )
);
