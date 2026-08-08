# ToBeFiled Staging Image Process

## Purpose

Use this route when the source image can be uploaded manually to the Supabase `ToBeFiled` bucket and ChatGPT should perform the filing, registration, linking and verification work afterwards.

This is the preferred low-friction route for small Canon image batches when preserving the original PNG is more important than eliminating the manual upload step.

## Prompt trigger

Use either of these phrases in the request:

> Use **ToBeFiled upload process** for these images.

or

> Use **ToBeFiled upload process** for this batch and file/link them to the correct Canon records.

When this route is explicitly requested, do not substitute the GitHub image queue unless the ToBeFiled route fails and the user approves a fallback.

## High-level flow

```text
ChatGPT creates images
→ user uploads the original files unchanged to Supabase ToBeFiled
→ ChatGPT identifies the uploaded files
→ ChatGPT resolves the intended story/Canon/episode targets
→ batch copy to story-images
→ create or update media_assets
→ create or update destination links
→ verify Storage, database and Studio rendering
```

## Why this route exists

The user handles only the binary transport step. ChatGPT handles the database-aware work that is easier to automate safely:

- identifying the new files;
- matching the files to the intended Canon or episode targets;
- choosing the final storage paths;
- copying the original image bytes without JPEG conversion;
- registering `media_assets`;
- linking Canon/episode/story relationships;
- verifying the result.

The original file should remain in `ToBeFiled` during the first filing pass. Use copy rather than move so the staging source is preserved until verification succeeds.

## Supported staging bucket

Source bucket:

```text
ToBeFiled
```

Public destination bucket:

```text
story-images
```

The deployed Supabase helper for this route is:

```text
discoverstories-staging-copy
```

Its job is to copy staged files into approved `story-images/<story-slug>/...` destinations. It preserves the original PNG/JPEG bytes; it does not convert image format.

## Batch identification

Do not visually guess when a batch contains multiple files.

Use the strongest available match in this order:

1. exact meaningful filename;
2. explicit numbered mapping supplied by the user;
3. exact byte-size/hash match to a file generated in the same Chat session;
4. visual inspection only as a confirmation aid, not as the sole identifier for an ambiguous batch.

Example mapping prompt:

```text
Use ToBeFiled upload process for the 5 Dyson habitat images.
01 = Aurora Glass
02 = Helios Gate
03 = Cinder Loop
04 = The Iron Continent
05 = The Stacks of Kharon
```

Random ChatGPT filenames are acceptable if the files can be matched reliably by metadata or the user provides a mapping.

## Canon destination pattern

For a Canon image, use the established public path shape:

```text
<story-slug>/canon/<canon-object-slug>/<stage>/<uuid>.<ext>
```

Example:

```text
life-inside-the-dyson/canon/aurora-glass/concept/<uuid>.png
```

Do not invent the story slug or Canon object slug. Resolve them from the database before filing.

## Execution gates

### Gate 1 — Find the staged files

List recent image objects in `ToBeFiled` and record:

- object name;
- created timestamp;
- MIME type;
- byte size;
- object ID when available.

Pass: every intended source image is uniquely identified.

### Gate 2 — Resolve destinations

For each image, resolve the exact target record before copying.

For Canon, confirm:

- story slug;
- Canon project;
- Canon rule/object ID;
- Canon key/slug;
- existing primary/reference images.

Pass: one exact intended destination exists for every source image.

### Gate 3 — Prepare a batch manifest

Prepare an internal mapping of:

```text
source ToBeFiled path
→ destination story-images path
→ target database record
```

Use UUID filenames for new destination objects unless a destination profile explicitly requires another convention.

### Gate 4 — Copy original bytes

Copy from `ToBeFiled` to `story-images`.

Rules:

- prefer copy, not move;
- preserve the original file format;
- do not convert PNG to JPEG unless explicitly requested;
- do not overwrite an existing destination path;
- verify destination byte size and MIME type after copy.

### Gate 5 — Register media

Create or update the `media_assets` row using the actual copied object metadata.

For Canon concept images, the normal values are:

- `asset_type = canon_reference`;
- `lifecycle_status = concept` for concept-stage work;
- `mime_type` from Storage;
- `file_size_bytes` from Storage;
- `storage_path` equal to the final public path;
- `public_url` built from the public bucket path;
- title/alt metadata appropriate to the Canon object.

Do not update the database before the Storage copy succeeds.

### Gate 6 — Link the destination

For Canon, create or update `private_canon_assets` so that the media asset points to the exact Canon rule/object.

When replacing an older test/reference image:

- do not delete the older asset unless requested;
- set the intended new asset as primary only when appropriate;
- demote the previous primary rather than creating multiple primary references.

### Gate 7 — Verify

Verify all applicable checks:

1. staged source still exists;
2. final public Storage object exists;
3. source and destination byte sizes agree when copy is meant to preserve bytes;
4. MIME type and extension agree;
5. `media_assets` resolves to the final Storage path;
6. the Canon/episode/story link points to the intended media asset;
7. only one primary Canon reference exists when one is expected;
8. unrelated records are unchanged;
9. Studio/Reader renders the image when applicable.

## Successful acceptance test — 08 Aug 2026

The route was proven with five full-size PNG habitat images for `life-inside-the-dyson`.

The five staged files were copied from `ToBeFiled` into the public Canon paths for:

- Aurora Glass;
- Helios Gate;
- Cinder Loop;
- The Iron Continent;
- The Stacks of Kharon.

All five images remained PNGs at their original multi-megabyte sizes. Matching `media_assets` and `private_canon_assets` records were created, and each intended Canon object ended with a primary draft reference image.

## Definition of complete

A ToBeFiled job is complete only when:

- every source file is uniquely identified;
- every destination target is resolved;
- the original image bytes are copied successfully;
- final Storage metadata is verified;
- `media_assets` is registered;
- destination-specific links are correct;
- primary/reference rules are correct;
- the intended Studio/Reader surface is verified when available.

If any required check is unavailable, report **not verified**, not **successful**.
