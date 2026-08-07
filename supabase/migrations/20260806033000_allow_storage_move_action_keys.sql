alter table public.storage_action_keys
drop constraint storage_action_keys_allowed_operations_check;

alter table public.storage_action_keys
add constraint storage_action_keys_allowed_operations_check
check (
  allowed_operations <@ array[
    'storage_list',
    'storage_inspect',
    'storage_upload',
    'storage_copy',
    'storage_move',
    'storage_publish_batch'
  ]::text[]
);
