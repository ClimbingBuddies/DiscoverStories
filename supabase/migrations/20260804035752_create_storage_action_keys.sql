create table if not exists public.storage_action_keys (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  key_hash text not null unique check (key_hash ~ '^[0-9a-f]{64}$'),
  allowed_operations text[] not null default array[]::text[],
  is_active boolean not null default true,
  expires_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  created_by text not null default current_user,
  constraint storage_action_keys_allowed_operations_check
    check (allowed_operations <@ array[
      'storage_list',
      'storage_inspect',
      'storage_upload',
      'storage_copy',
      'storage_publish_batch'
    ]::text[])
);

alter table public.storage_action_keys enable row level security;
revoke all on table public.storage_action_keys from anon, authenticated;
grant all on table public.storage_action_keys to service_role;

comment on table public.storage_action_keys is
  'Hashed credentials and operation allowlists for the private DiscoverStories GPT Action. Plaintext keys are never stored here.';

-- Action keys are provisioned separately. Never commit a plaintext key or its
-- deployment-specific hash to the repository.
