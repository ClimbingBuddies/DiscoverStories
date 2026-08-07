# Storage Move Runbook

> **Implementation status — connected Supabase Chat only.** `storage_move` is **not implemented or validated as a private custom GPT Action**. It is deliberately absent from the custom GPT OpenAPI schema and the long-lived private GPT key does not permit it. A model must not attempt this operation unless the current chat has the connected Supabase tools required by this runbook.

## Purpose

Use this runbook to move or rename one existing DiscoverStories image from a Chat session with connected Supabase tools. A successful move creates the destination and removes the source.

Supported directions:

- private → private;
- private → public;
- public → private;
- public → public.

`storage_move` does not convert the image, overwrite an existing destination or update database records.

## Required inputs

- exact `storySlug`;
- `sourceVisibility` and exact story-relative `sourcePath`;
- `destinationVisibility` and new story-relative `destinationPath`;
- confirmation that any database reference to the source is understood.

Private physical paths are rooted by story UUID in `stories`. Public physical paths are rooted by story slug in `story-images`. Supply only the path relative to that root.

## Gate 1 — Read-only preflight

Before moving:

1. resolve the story exactly once;
2. confirm the source exists;
3. confirm the destination does not exist;
4. record source eTag, byte size and MIME type;
5. confirm the destination extension matches the source format;
6. check whether an episode, `media_assets`, story, Canon or Reader record uses the source path.

Stop if any value is ambiguous. Existing destinations are never overwritten.

## Gate 2 — Chat authority

Only a Chat session with the connected Supabase SQL capability may use this controlled fallback:

1. generate a random token inside Postgres;
2. store only its SHA-256 hash in `public.storage_action_keys`;
3. allow only `storage_move`;
4. expire the key after approximately ten minutes;
5. invoke the Edge Function with `pg_net`;
6. remove the temporary key after verification.

Never expose the plaintext token in Chat or GitHub. If the connected Supabase SQL capability is unavailable, stop and report `storage_move: not implemented in this chat`.

## Gate 3 — Invoke

POST to:

```text
https://qsyapcprhhmlsgdzclwq.supabase.co/functions/v1/
discoverstories-storage-action/storage-move
```

Example body:

```json
{
  "storySlug": "life-inside-the-dyson",
  "sourceVisibility": "private",
  "sourcePath": "episodes/storage-copy-test/source.png",
  "destinationVisibility": "private",
  "destinationPath": "episodes/storage-move-test/destination.png"
}
```

Required response:

- HTTP `200`;
- `operation: storage_move`;
- `result: moved`;
- returned source and destination match the request.

Creating a `pg_net` request is not proof of success. Read the corresponding `net._http_response` row.

## Gate 4 — Verify Storage

Confirm independently:

- destination exists;
- source no longer exists;
- destination eTag matches the recorded source eTag;
- byte size and MIME type match;
- no unintended object was created.

If the function reports an error, inspect both paths before retrying.

## Gate 5 — Database handling

Storage move does not relink database records. If the source was linked:

1. verify the destination;
2. update the authorised database record to the new relative path;
3. verify rendering or signed access;
4. report the exact record changed.

For an isolated test object, no database change is required.

## Gate 6 — Remove temporary authority

Delete or deactivate the exact temporary Action key and confirm it no longer exists or is inactive.

## Result report

```text
STORAGE MOVE: SUCCESS | FAILED | NOT VERIFIED

Story:
Source visibility/path:
Destination visibility/path:
HTTP result:
Destination exists:
Source removed:
eTag matches:
Size matches:
MIME matches:
Temporary key removed:
Database records changed: No | details
```

## Verified example — 06 Aug 2026

The private Life Inside the Dyson Episode 4 copy-test PNG was moved to a new private test directory and renamed.

- HTTP 200 and `result: moved`;
- destination existed after execution;
- source no longer existed;
- eTag `2f29aaf209991409f5d0b9101c8dc146`;
- size 2,238,863 bytes;
- MIME type `image/png`;
- temporary move-only key removed;
- no database record changed.
