-- Private Canon media registration and safe storage-path idempotency.
begin;

create unique index if not exists uq_media_assets_storage_path
  on public.media_assets (storage_path) where storage_path is not null;

create table if not exists public.private_canon_assets (
  id uuid primary key default gen_random_uuid(),
  canon_project_id uuid not null references public.private_canon_projects(id) on delete cascade,
  canon_rule_id uuid references public.story_canon_rules(id) on delete cascade,
  media_asset_id uuid not null unique references public.media_assets(id) on delete cascade,
  asset_role text not null default 'reference',
  review_status text not null default 'draft'
    check (review_status in ('draft', 'review', 'approved', 'rejected', 'superseded')),
  consistency_notes text,
  refinement_direction text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The table may already exist in deployed projects with the richer Canon
-- review columns. Keep this migration additive and provide the conflict
-- target required by the upload endpoint.
alter table public.private_canon_assets
  add column if not exists asset_role text not null default 'reference',
  add column if not exists review_status text not null default 'draft',
  add column if not exists consistency_notes text,
  add column if not exists refinement_direction text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists uq_private_canon_assets_media_asset_id
  on public.private_canon_assets (media_asset_id);

create index if not exists private_canon_assets_project_idx
  on public.private_canon_assets (canon_project_id, canon_rule_id, review_status);

alter table public.private_canon_assets enable row level security;
revoke all on public.private_canon_assets from public, anon, authenticated;
grant all on public.private_canon_assets to service_role;

commit;
