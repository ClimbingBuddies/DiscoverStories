# Core Image Upload Process

## Scope

Use this procedure for a small, authorised image upload through the existing GitHub queue. It covers transport, conversion, upload, registration, linking and verification.

Do not use it for image generation. Do not use it for Canon or Reader/Tiptap images until those profiles are marked supported in [README](./README.md).

## Inputs required before starting

Obtain and verify:

- repository: `ClimbingBuddies/DiscoverStories`;
- exact story slug;
- asset role: `cover`, `banner` or `episode`;
- source image bytes;
- production stage: `concept`, `refined` or `production`;
- current story status;
- version number;
- season and episode numbers for episode artwork;
- whether this is a disposable upload test or an intended link change.

If any required value is missing, stop and ask. Do not infer it from a title.

## Gate 1 — Confirm the target exists

Before preparing an upload:

1. confirm the story slug resolves to exactly one story;
2. for episode artwork, confirm the story, season and episode resolve to exactly one episode;
3. record the current image path and current content status;
4. record whether the existing record is draft, review or published.

Pass: exactly one intended record is identified.

Fail: no record, multiple records or a published record that the current bridge cannot safely preserve.

On failure, stop without creating queue files.

## Gate 2 — Prepare the queue folder

Use a unique folder beneath `production-queue/`.

Example:

```text
production-queue/
  nature-of-light-episode-03-test/
    manifest.json
    image.b64
```

The folder name is an operational queue identifier. It is not the final Storage filename.

### manifest.json: episode example

```json
{
  "storySlug": "a-distance-to-far-the-measurement-of-light",
  "assetRole": "episode",
  "stage": "concept",
  "workflowStatus": "draft",
  "versionNumber": 1,
  "seasonNumber": 1,
  "episodeNumber": 3,
  "generationNotes": "Upload-path test using an existing source image."
}
```

### manifest.json: cover example

```json
{
  "storySlug": "a-distance-to-far-the-measurement-of-light",
  "assetRole": "cover",
  "stage": "concept",
  "workflowStatus": "draft",
  "versionNumber": 1,
  "generationNotes": "Upload-path test using an existing source image."
}
```

The manifest does not contain the final filename. The upload function derives a canonical Storage path.

### image.b64

`image.b64` must contain only the Base64 representation of the source image bytes. Line breaks are permitted because the workflow removes them.

Do not:

- place a URL in `image.b64`;
- place Markdown in `image.b64`;
- use a text description instead of bytes;
- omit `image.b64`;
- claim that `manifest.json` contains the image.

Pass: both files exist in the same queue folder and the Base64 decodes to a non-empty image.

Fail: either file is absent or decoding fails.

## Gate 3 — Understand conversion

The GitHub workflow:

1. decodes `image.b64`;
2. uses ImageMagick 7 `magick` when available, otherwise ImageMagick 6 `convert`;
3. auto-orients the source;
4. strips metadata;
5. resizes only when larger than 1280×1280;
6. writes JPEG quality 82;
7. verifies that ImageMagick identifies the output as JPEG.

The source may be PNG, JPEG or another ImageMagick-readable image. The stored Draft/review object must be genuine JPEG bytes.

Pass: converted output identifies as `JPEG`.

Fail: Base64 decode, image decode, conversion or JPEG validation fails.

## Gate 4 — Run only the intended queue

The workflow is `.github/workflows/upload-story-artwork.yml`, displayed as **Upload queued story media**.

Preferred controlled execution is a manual workflow dispatch with `queue_path` set to the exact folder beneath `production-queue`.

Example input:

```text
nature-of-light-episode-03-test
```

Important current behaviour:

- a pull request that changes `production-queue/**` triggers the workflow;
- on a pull-request trigger, the workflow scans the whole `production-queue`;
- if any `batch.json` files are found, it processes batch items instead of standalone manifests.

Therefore, before using a pull-request-triggered test, inspect the resulting queue count and intended items. If the workflow proposes to process unrelated historical batches, stop the run and do not describe it as a controlled one-image test.

## Gate 5 — Upload through OIDC

The workflow requests a short-lived GitHub identity token with audience `supabase-story-artwork`, then calls:

```text
https://qsyapcprhhmlsgdzclwq.supabase.co/functions/v1/github-story-artwork-bridge
```

The bridge sends the converted JPEG to the story artwork production function.

Each item is retried up to three times. A successful response must include:

- `uploaded: true`;
- a non-empty `storagePath`;
- a media asset ID;
- the public URL when applicable.

Do not replace this with a direct Supabase call when the required connector, DNS route or credential is unavailable.

## Gate 6 — Verify in this order

1. Workflow result reports the intended item as uploaded.
2. Returned `storagePath` matches the intended destination profile.
3. Storage contains the exact returned object.
4. Stored bytes are a genuine JPEG.
5. MIME type is `image/jpeg`.
6. `media_assets.storage_path` matches the returned path.
7. The media row has the expected story or episode relationship.
8. The intended story or episode field matches the path.
9. The previous content status has not been unintentionally changed.
10. The public URL returns HTTP 200 when public access is expected.
11. The intended page renders the image.

Database linking occurs only after Storage upload and media registration. The upload function removes the new Storage object if later registration or linking fails.

## Final report format

```text
UPLOAD RESULT: SUCCESS | FAILED | NOT VERIFIED

Target:
- Story:
- Asset role:
- Season/Episode:
- Stage/version:

Checks:
1. Target resolved: PASS/FAIL
2. Queue package complete: PASS/FAIL
3. JPEG conversion: PASS/FAIL
4. GitHub workflow: PASS/FAIL
5. Storage object: PASS/FAIL
6. media_assets row: PASS/FAIL
7. Intended link: PASS/FAIL
8. Status preserved: PASS/FAIL
9. Public HTTP check: PASS/FAIL/NOT APPLICABLE
10. Render check: PASS/FAIL/NOT VERIFIED

Changes made:
- Storage path:
- Media asset ID:
- Database field changed:

Failures:
- Exact failed gate:
- Exact error:
- Changes made before failure:
- Rollback result:
```

Do not use the word “successful” unless every applicable check passes.
