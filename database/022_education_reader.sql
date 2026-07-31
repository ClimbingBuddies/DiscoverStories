begin;

alter table public.episodes
  add column if not exists reader_content_json jsonb,
  add column if not exists reader_content_version integer not null default 1,
  add column if not exists has_interactive_content boolean not null default false;

alter table public.episodes
  drop constraint if exists episodes_reader_content_json_object_check,
  add constraint episodes_reader_content_json_object_check
    check (reader_content_json is null or jsonb_typeof(reader_content_json) = 'object'),
  drop constraint if exists episodes_reader_content_version_check,
  add constraint episodes_reader_content_version_check
    check (reader_content_version > 0);

comment on column public.episodes.reader_content_json is
  'Structured Tiptap-compatible Reader document for educational and interactive episodes.';
comment on column public.episodes.reader_content_version is
  'Schema version for reader_content_json.';
comment on column public.episodes.has_interactive_content is
  'True when the Reader document contains interactive components such as calculators.';

insert into public.genres (slug, name)
values ('education', 'Education')
on conflict (slug) do update set name = excluded.name;

commit;
