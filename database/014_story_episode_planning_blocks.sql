-- Versioned schema for ten-episode story planning blocks.

create table if not exists public.story_episode_planning_blocks (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  season_number integer not null default 1,
  block_number integer not null,
  episode_start integer not null,
  episode_end integer not null,
  title text not null,
  arc_summary text,
  episode_summaries jsonb not null default '[]'::jsonb,
  draft_assessment text,
  content_status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint story_episode_planning_blocks_episode_range_check
    check (episode_start > 0 and episode_end >= episode_start),
  constraint story_episode_planning_blocks_status_check
    check (content_status in ('draft', 'review', 'scheduled', 'published', 'archived')),
  constraint story_episode_planning_blocks_story_block_unique
    unique (story_id, season_number, block_number)
);

create index if not exists story_episode_planning_blocks_story_id_idx
  on public.story_episode_planning_blocks (story_id, season_number, block_number);

alter table public.story_episode_planning_blocks enable row level security;

drop policy if exists "Open Studio read planning blocks" on public.story_episode_planning_blocks;
create policy "Open Studio read planning blocks"
  on public.story_episode_planning_blocks
  for select
  to anon, authenticated
  using (true);

grant select on public.story_episode_planning_blocks to anon, authenticated;
