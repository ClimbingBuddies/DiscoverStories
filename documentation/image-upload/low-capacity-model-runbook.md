# Low-Capacity Model Image Upload Runbook

## Instruction to the model

Follow this document literally. Do not optimise it, replace tools, infer missing values or continue after a failed gate.

Your task is upload-only through the GitHub queue/OIDC route. Do not generate or redesign an image, and do not substitute connected-Supabase Storage operations for this runbook.

## Allowed roles

Proceed only when the current [image upload README](./README.md) marks the requested profile **Supported**.

Currently supported:

- `cover`;
- `banner`;
- `episode`;
- `canon`.

Stop for:

- `reader`;
- any unknown role;
- any state the current destination profile explicitly marks unsupported.

A character image is not a separate role. It uses `assetRole: "canon"` and the exact Character Canon object identifiers.

## Phase A — Read-only preflight

1. State the requested story and asset.
2. Read the current image-upload README capability table.
3. Open the matching destination profile.
4. Find the exact story slug.
5. Confirm the story exists exactly once.
6. Resolve role-specific target identifiers exactly once:
   - episode: season and episode;
   - Canon: Canon project and Canon object.
7. Read and record any current linked asset relevant to the request.
8. Confirm the intended stage and version.
9. Confirm upload and database linking are authorised.
10. Report the preflight result before writing queue files.

If a required exact identifier is missing, stop and ask one precise question. Do not infer slugs or Canon keys from display text.

## Phase B — Prepare exactly one queue item

1. Create one unique folder beneath `production-queue/`.
2. Create `manifest.json` using the exact matching destination profile.
3. Create `image.b64` containing the source image bytes.
4. Confirm both files are in the same queue folder.
5. Confirm Base64 decoding produces a non-empty image.
6. For the first test of a new/materially changed profile, do not create a batch.
7. Do not change database records manually.

Minimum episode manifest:

```json
{
  "storySlug": "EXACT_SLUG",
  "assetRole": "episode",
  "stage": "concept",
  "workflowStatus": "CURRENT_DRAFT_OR_REVIEW_STATUS",
  "versionNumber": 1,
  "seasonNumber": 1,
  "episodeNumber": 1,
  "generationNotes": "Controlled one-image upload test."
}
```

Minimum Canon production manifest:

```json
{
  "storySlug": "EXACT_STORY_SLUG",
  "assetRole": "canon",
  "stage": "production",
  "workflowStatus": "draft",
  "versionNumber": 1,
  "canonProjectSlug": "EXACT_CANON_PROJECT_SLUG",
  "canonObjectSlug": "EXACT_CANON_OBJECT_SLUG",
  "canonAssetTitle": "UNIQUE DESCRIPTIVE TITLE",
  "canonAssetRole": "reference",
  "canonAssetDescription": "DESCRIPTION",
  "canonSortOrder": 0,
  "canonIsPrimaryReference": false,
  "generationNotes": "Controlled Canon image upload."
}
```

Replace every placeholder with a verified value. No placeholder may remain.

## Phase C — Execute

1. Use **Upload queued story media**.
2. Prefer manual dispatch when available.
3. Set `queue_path` to the exact queue folder or manifest.
4. Confirm the workflow queue contains only the intended test item(s).
5. For a first test, queue count must be 1.
6. Inspect the completed `story-artwork-upload-result`.
7. Confirm:
   - no failed item;
   - returned `storySlug` and `assetRole` match the request;
   - returned `storagePath` is non-empty;
   - returned media asset ID is non-empty;
   - for Canon, returned project/object metadata matches the request.

A green workflow with the wrong item is a failure.

## Phase D — Verify

Perform every applicable check in order:

| # | Check | Required result |
|---:|---|---|
| 1 | Converted file | Genuine JPEG |
| 2 | Returned Storage path | Non-empty and correct profile |
| 3 | Storage object | Exists |
| 4 | MIME | `image/jpeg` |
| 5 | `media_assets` | Matching row exists |
| 6 | Ownership | Correct story, episode or Canon object |
| 7 | Destination link | Correct field/relationship |
| 8 | Unrelated links | Unchanged |
| 9 | Content/review status | Preserved unless explicitly authorised |
| 10 | Public URL | HTTP 200 when applicable |
| 11 | Intended UI | Image renders when applicable |

For Canon, verify the `private_canon_assets` relationship and confirm story/episode artwork columns were not changed. If the response says `reused: true`, verify that the existing asset has the same logical title/role and source hash.

Do not skip a check because another check passed.

## Phase E — Report

Use exactly these outcome labels:

- **SUCCESS** — all applicable checks passed.
- **FAILED** — a check failed.
- **NOT VERIFIED** — a required check could not be performed.
- **BLOCKED** — the destination or current state is unsupported.

Report:

```text
OUTCOME:

REQUESTED TARGET:

QUEUE FOLDER:

WORKFLOW RESULT:

STORAGE PATH:

MEDIA ASSET ID:

DATABASE LINK:

HTTP RESULT:

RENDER RESULT:

STATUS PRESERVED:

FAILED OR UNVERIFIED GATE:

REASON:

ROLLBACK OR REMAINING CHANGE:
```

## Forbidden shortcuts

Do not:

- rename a PNG extension to JPG;
- commit only `manifest.json`;
- treat an image URL as image bytes;
- call Supabase directly when the GitHub queue was requested;
- insert a guessed filename or Storage path;
- use `episode` as a substitute for Reader or Canon;
- invent a `character` transport role;
- update the database before Storage verification;
- call a green workflow complete without checking its result;
- upload a batch before one item passes when the profile is unverified or materially changed;
- say “probably”, “appears successful” or “should work” in the final result.

## Expansion rule

Only after one image reports **SUCCESS** may a new or materially changed profile expand to a small batch. Once a profile has documented acceptance evidence, routine uploads may use a small controlled batch when all targets and manifests are exact.
