# Core Image Upload Process

## Scope

Use this procedure for a small, authorised image upload through the existing GitHub queue/OIDC route. It covers transport, conversion, upload, registration, linking and verification. It does not govern connected-Supabase Chat Storage maintenance.

Supported roles are listed in [README](./README.md). At present, cover, banner, episode and Canon are supported; Reader/Tiptap remains blocked.

## Inputs required before starting

Obtain and verify:

- repository: `ClimbingBuddies/DiscoverStories`;
- exact story slug;
- intended asset role;
- source image bytes;
- production stage: `concept`, `refined` or `production`;
- version number;
- role-specific identifiers from [Destination Profiles](./destination-profiles.md);
- whether this is a new asset, a controlled test or an intended replacement.

Do not infer identifiers from display titles when exact slugs/keys are required.

## Gate 1 — Confirm the target exists

Before preparing an upload:

1. confirm the story slug resolves exactly once;
2. for episode artwork, confirm the story, season and episode resolve exactly once;
3. for Canon, confirm the Canon workspace and exact Canon object resolve exactly once and belong to the same linked story;
4. record any existing linked asset(s) relevant to the request;
5. record current content/review status where applicable.

Pass: exactly one intended target is identified.

Fail: no record, multiple records, mismatched Canon/story ownership, or another unsupported state.

On failure, stop without creating queue files.

## Gate 2 — Prepare the queue item

Use a unique folder beneath `production-queue/` containing:

```text
manifest.json
image.b64
```

The folder name is an operational queue identifier. It is not the final Storage filename.

Use the exact manifest shape from the matching destination profile. Canon requires its Canon-specific identifiers and title.

`image.b64` must contain only the Base64 representation of the source image bytes. Line breaks are permitted because the workflow removes them.

Do not:

- place a URL in `image.b64`;
- place Markdown in `image.b64`;
- use a text description instead of bytes;
- omit `image.b64`;
- inject an unsupported final filename or Storage path.

Pass: manifest and Base64 payload are complete and decode to a non-empty image.

## Gate 3 — Conversion

The GitHub workflow:

1. decodes `image.b64`;
2. uses ImageMagick;
3. auto-orients the source;
4. strips metadata;
5. resizes only when larger than 1280×1280;
6. writes JPEG quality 82;
7. verifies the output is genuine JPEG.

Pass: converted output identifies as `JPEG`.

## Gate 4 — Run only the intended queue

The workflow is `.github/workflows/upload-story-artwork.yml`, displayed as **Upload queued story media**.

Preferred controlled execution is manual `workflow_dispatch` with `queue_path` set to the exact queue folder or manifest beneath `production-queue`.

For pull-request triggers, the current workflow is scoped to queue files changed by that PR rather than scanning unrelated historical queue items. Even so, confirm the resulting queue count and targets before treating the run as controlled.

For a first test of a new or materially changed profile, process exactly one image.

## Gate 5 — Upload through OIDC

The workflow requests a short-lived GitHub identity token and calls the Supabase artwork bridge, which passes the converted JPEG to the production artwork function.

A successful response must include:

- `uploaded: true`;
- a non-empty `storagePath`;
- a media asset ID;
- the public URL when applicable.

For Canon, the response must also identify the intended Canon project/object metadata.

Do not replace this with an improvised direct upload pathway when the GitHub route was requested.

## Gate 6 — Verify in this order

1. Workflow result reports the intended item as uploaded or explicitly reused.
2. Returned `storagePath` matches the intended destination profile.
3. Storage contains the exact returned object.
4. Stored bytes are genuine JPEG.
5. MIME type is `image/jpeg`.
6. `media_assets.storage_path` matches the returned path.
7. Ownership/linkage is correct:
   - story for cover/banner;
   - episode for episode artwork;
   - `private_canon_assets` and exact Canon object for Canon.
8. Intended destination fields/relationships match the returned asset.
9. Unrelated story/episode/Canon links are unchanged.
10. Content/review status is preserved unless the request explicitly authorises a change.
11. Public URL returns HTTP 200 when public access is expected.
12. Intended Studio or Reader surface renders the image when applicable.

For Canon, a retry may return the existing asset as `reused: true` when title/role and source hash match. That is a valid idempotent success only after the existing Storage and database relationships are verified.

## Final report format

```text
UPLOAD RESULT: SUCCESS | FAILED | NOT VERIFIED

Target:
- Story:
- Asset role:
- Role-specific target:
- Stage/version:

Checks:
1. Target resolved: PASS/FAIL
2. Queue package complete: PASS/FAIL
3. JPEG conversion: PASS/FAIL
4. GitHub workflow: PASS/FAIL
5. Storage object: PASS/FAIL
6. media_assets row: PASS/FAIL
7. Intended link: PASS/FAIL
8. Unrelated links unchanged: PASS/FAIL
9. Status preserved: PASS/FAIL
10. Public HTTP check: PASS/FAIL/NOT APPLICABLE
11. Render check: PASS/FAIL/NOT VERIFIED

Changes made:
- Storage path:
- Media asset ID:
- Database relationship/field changed:

Failures:
- Exact failed gate:
- Exact error:
- Changes made before failure:
- Rollback result:
```

Do not use the word “successful” unless every applicable check passes.
