# Low-Capacity Model Image Upload Runbook

## Instruction to the model

Follow this document literally. Do not optimise it, replace tools, infer missing values or continue after a failed gate.

Your task is upload-only. Do not generate or redesign an image.

## Allowed roles

Proceed only when `assetRole` is:

- `cover`;
- `banner`;
- `episode`.

Stop for:

- `reader`;
- `canon`;
- character images;
- any unknown role;
- any published record whose status cannot be preserved by the current bridge.

## Phase A — Read-only preflight

1. State the requested story and asset.
2. Find the exact story slug.
3. Confirm the story exists exactly once.
4. For episode artwork, confirm season and episode numbers exist exactly once.
5. Read and record:
   - current image path;
   - current content status;
   - intended asset role;
   - stage;
   - version number.
6. Confirm that upload and database linking are authorised.
7. Report the preflight result before writing queue files.

If a value is missing, stop and ask one precise question.

## Phase B — Prepare exactly one queue item

1. Create one unique folder beneath `production-queue/`.
2. Create `manifest.json`.
3. Create `image.b64` containing the source image bytes.
4. Confirm both files are in the same folder.
5. Confirm Base64 decoding produces a non-empty image.
6. Do not create `batch.json` for the first test.
7. Do not change any database record manually.

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

Replace every uppercase placeholder with a verified value. No uppercase placeholder may remain.

## Phase C — Execute

1. Use **Upload queued story media**.
2. Prefer manual dispatch.
3. Set `queue_path` to the exact queue folder.
4. Confirm the workflow queue count is 1.
5. If count is not 1, stop.
6. Wait for completion.
7. Download or inspect `story-artwork-upload-result`.
8. Confirm:
   - `status` is `complete`;
   - `uploaded` is 1;
   - `failed` is 0;
   - returned `storySlug` and `assetRole` match the request.

A green workflow with the wrong item is a failure.

## Phase D — Verify

Perform every check in order:

| # | Check | Required result |
|---:|---|---|
| 1 | Converted file | Genuine JPEG |
| 2 | Returned Storage path | Non-empty and correct profile |
| 3 | Storage object | Exists |
| 4 | MIME | `image/jpeg` |
| 5 | `media_assets` | Matching row exists |
| 6 | Ownership | Correct story or episode |
| 7 | Destination field | Correct path |
| 8 | Unrelated links | Unchanged |
| 9 | Content status | Preserved |
| 10 | Public URL | HTTP 200 when applicable |
| 11 | Intended UI | Image renders |

Do not skip a check because another check passed.

## Phase E — Report

Use exactly these outcome labels:

- **SUCCESS** — all applicable checks passed.
- **FAILED** — a check failed.
- **NOT VERIFIED** — a required check could not be performed.
- **BLOCKED** — the destination or current status is unsupported.

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
- insert a guessed filename;
- use `episode` as a substitute for Reader or Canon;
- update the database before Storage verification;
- call a green workflow complete without checking its result;
- upload a batch before one item passes;
- say “probably”, “appears successful” or “should work” in the final result.

## Expansion rule

Only after one image reports **SUCCESS** may the same verified profile be expanded to a small batch.

A successful episode test does not prove Canon or Reader support. Each profile requires its own acceptance test after its implementation is complete.
