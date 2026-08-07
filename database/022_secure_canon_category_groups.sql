-- Match the private canon category metadata tables by preventing direct
-- PostgREST access; Studio reads this metadata through SECURITY DEFINER RPCs.
alter table public.private_canon_category_groups enable row level security;
