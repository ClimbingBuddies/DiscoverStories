# Storage Copy Runbook

## Purpose

Use this runbook to copy one existing image between authorised DiscoverStories Storage locations while preserving the source. For a move or rename that removes the source, use [`storage-move-runbook.md`](storage-move-runbook.md).

Supported directions:

- private → private;
- private → public;
- public → private;
- public → public.

`storage_copy` copies bytes exactly. It does not convert PNG to JPEG, update database links, overwrite an existing destination or delete the source.

## Storage roots

| Visibility | Bucket | Physical root | Supplied path |
|---|---|---|---|
| Private | `stories` | Story UUID | Relative to the UUID root |
| Public | `story-images` | Story slug | Relative to the slug root |

The Edge Function resolves the UUID from `storySlug`. Do not place the UUID or story slug inside `sourcePath` or `destinationPath`.

## Required inputs

- exact existing `storySlug`;
- `sourceVisibility`: `private` or `public`;
- source path relative to the story root;
- `destinationVisibility`: `private` or `public`;
- destination path relative to the story root;
- confirmation whether the operation is copy-only or will later require database relinking.

Never infer a missing path. Never use a `.jpg` destination for PNG bytes; copy does not perform conversion.

## Gate 1 — Read-only preflight

Verify:

1. the story slug resolves exactly once;
2. the source object exists;
3. the destination object does not exist;
4. the source MIME type and extension agree;
5. the requested destination extension matches the source format;
6. the operation stays inside the resolved story scope.

Stop when any gate fails. Existing destinations are never overwritten.

## Gate 2 — Create temporary authority

When `storage_copy` is not directly exposed as a chat tool, use the connected Supabase SQL capability:

1. generate a cryptographically random token inside Postgres;
2. store only its SHA-256 hash in `public.storage_action_keys`;
3. allow only `storage_copy`;
4. set a short expiry, normally ten minutes;
5. label the key for the exact test or operation.

Never return the plaintext token to chat or store it in GitHub.

## Gate 3 — Invoke the Edge Function

Submit an asynchronous `pg_net` HTTP POST to:

```text
https://qsyapcprhhmlsgdzclwq.supabase.co/functions/v1/
discoverstories-storage-action/storage-copy
```

Request body:

```json
{
  "storySlug": "exact-story-slug",
  "sourceVisibility": "public",
  "sourcePath": "episodes/existing-image.png",
  "destinationVisibility": "private",
  "destinationPath": "episodes/storage-copy-test/copied-image.png"
}
```

Use `Authorization: Bearer <short-lived token>` and `Content-Type: application/json`.

Record the `pg_net` request ID and temporary Action-key ID. Do not treat request creation as copy success.

## Gate 4 — Verify the function response

Read the matching row from `net._http_response`.

Required response:

- HTTP status `200`;
- no `error_msg`;
- `operation: storage_copy`;
- `result: copied`;
- returned story, source and destination values match the request.

If the HTTP request fails, verify whether a destination object was created before retrying. Do not repeat blindly.

## Gate 5 — Verify Storage

Confirm through `storage.objects` or `storage_inspect`:

- source still exists;
- destination exists in the intended bucket and physical root;
- eTag matches;
- byte size matches;
- MIME type matches;
- no unintended object was created.

For private destinations, the physical path begins with the story UUID. For public destinations, it begins with the story slug.

## Gate 6 — Remove temporary authority

Delete or deactivate the exact temporary Action-key row after verification, whether the copy succeeded or failed. Confirm it is no longer active.

## Database boundary

A successful Storage copy does not update:

- `media_assets.storage_path`;
- `media_assets.public_url`;
- `episodes.artwork_path` or `episodes.artwork_url`;
- story cover or banner fields;
- Canon or Reader relationships.

Database relinking is a separate authorised step performed only after the destination passes all Storage checks. Preserve the source until relinking and rendering verification are complete.

## Result report

```text
STORAGE COPY: SUCCESS | FAILED | NOT VERIFIED

Story:
Source visibility/path:
Destination visibility/path:
HTTP result:
Source preserved:
Destination exists:
eTag matches:
Size matches:
MIME matches:
Temporary key removed:
Database records changed: No | details
Remaining test object:
```

## Proven example

The Life Inside the Dyson Episode 4 PNG was successfully copied:

1. from public Storage to an isolated public test path; and
2. from public Storage to an isolated private test path.

Both operations returned HTTP 200 and `result: copied`. The eTag, 2,238,863-byte size and `image/png` MIME type matched, the public source remained, and the temporary keys were removed. No database links changed.
