-- 013_add_content_publication_lifecycle.sql
-- Adds review and scheduling states while keeping public access restricted to published content.

begin;

alter table public.stories
  add column if not exists scheduled_at timestamptz;

alter table public.episodes
  add column if not exists scheduled_at timestamptz;

alter table public.stories
  drop constraint if exists stories_content_status_check;

alter table public.stories
  add constraint stories_content_status_check
  check (content_status in ('draft', 'review', 'scheduled', 'published', 'archived'));

alter table public.episodes
  drop constraint if exists episodes_episode_status_check;

alter table public.episodes
  add constraint episodes_episode_status_check
  check (episode_status in ('draft', 'review', 'scheduled', 'published', 'archived'));

alter table public.stories
  drop constraint if exists stories_scheduled_at_required;

alter table public.stories
  add constraint stories_scheduled_at_required
  check (content_status <> 'scheduled' or scheduled_at is not null);

alter table public.episodes
  drop constraint if exists episodes_scheduled_at_required;

alter table public.episodes
  add constraint episodes_scheduled_at_required
  check (episode_status <> 'scheduled' or scheduled_at is not null);

create or replace function public.set_publication_timestamps()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.content_status = 'published' and old.content_status is distinct from 'published' then
    new.published_at = coalesce(new.published_at, now());
  end if;

  if new.content_status <> 'scheduled' then
    new.scheduled_at = null;
  end if;

  return new;
end;
$$;

create or replace function public.set_episode_publication_timestamps()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.episode_status = 'published' and old.episode_status is distinct from 'published' then
    new.published_at = coalesce(new.published_at, now());
  end if;

  if new.episode_status <> 'scheduled' then
    new.scheduled_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists set_story_publication_timestamps on public.stories;
create trigger set_story_publication_timestamps
before update of content_status, scheduled_at on public.stories
for each row execute function public.set_publication_timestamps();

drop trigger if exists set_episode_publication_timestamps on public.episodes;
create trigger set_episode_publication_timestamps
before update of episode_status, scheduled_at on public.episodes
for each row execute function public.set_episode_publication_timestamps();

create index if not exists idx_stories_status_scheduled_at
  on public.stories (content_status, scheduled_at)
  where content_status = 'scheduled';

create index if not exists idx_episodes_status_scheduled_at
  on public.episodes (episode_status, scheduled_at)
  where episode_status = 'scheduled';

commit;
