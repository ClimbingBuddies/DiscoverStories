# Story Storage Foundation

Release 2 establishes the storage model without moving existing assets.

## Physical hierarchy

The canonical private bucket is `stories`. Every object path begins with the
immutable story ID and may continue through immutable season and episode IDs:

```text
{story_id}/
  story/{cover|banner|references}/
  canon/{characters|locations|objects|visual-tests}/
  wiki/{characters|locations|concepts}/
  seasons/{season_id}/episodes/{episode_id}/{artwork|reader|audio|attachments}/
```

The human-facing `season_number` and `episode_number` remain database fields.
They do not identify storage objects and may therefore change without renaming
files.

## Access foundation

`story_memberships` supports `owner`, `admin`, `editor`, `contributor`,
`reviewer`, and `reader` roles. The private bucket policies use the first path
segment as the story ownership boundary.

- Owners, administrators, editors, contributors, and reviewers can read draft
  storage objects.
- Owners, administrators, editors, and contributors can upload and replace
  objects.
- Owners, administrators, and editors can delete objects.
- Reader access is deliberately withheld from direct bucket reads until the
  approved/published asset resolver is connected to lifecycle records.

There are currently no Auth users and existing stories have no `created_by`
value. Release 2 therefore creates no memberships and grants no end-user access.
Server-side administrative functions continue to use the service role.

## Compatibility

All existing `story-images`, `story-audio`, `audio`, `Wiki`, and `ToBeFiled`
objects and database paths remain unchanged. Application code can prefer an
authorised canonical URL and fall back to the current legacy public path.
Release 3 will exercise this resolver with one pilot story before any broader
migration.
