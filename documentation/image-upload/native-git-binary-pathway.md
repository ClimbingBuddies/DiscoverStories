# Native Git Binary Image Pathway

## Purpose

This document defines the preferred Chat-to-GitHub ingestion method for images used by DiscoverStories.

It exists because the earlier `image.b64` text-file pathway was proven vulnerable to corruption when a large Base64 payload was written through a text-oriented GitHub connector operation. The replacement pathway uses GitHub's native Git blob API with `encoding: "base64"`, allowing Base64 to be used only as transport across the API boundary while GitHub stores the resulting object as genuine binary image bytes.

## Status

Verified end-to-end on **08 Aug 2026**.

Verified fixture:

- Story: `life-inside-the-dyson`
- Canon project: `life-inside-the-dyson`
- Canon object: `helios-gate`
- Asset role: `canon`
- Result: successful GitHub Actions run 69
- Supabase Storage object created
- `media_assets` row created
- `private_canon_assets` link created
- Studio rendered both thumbnail and primary image successfully

The test used a deliberately reduced-resolution JPEG. Image softness in Studio was expected and did not indicate transport corruption.

## Canonical pathway

```text
Source image in Chat
→ obtain source image bytes
→ Base64-encode only for API transport
→ GitHub create_blob(encoding="base64")
→ GitHub stores a genuine binary blob
→ add blob to a Git tree as `image.jpg`
→ create commit / branch / pull request
→ GitHub Actions checks out the real JPEG
→ request short-lived GitHub OIDC token
→ send JPEG file to github-story-artwork-bridge
→ story-artwork-production
→ Supabase `story-images` Storage
→ `media_assets`
→ destination-specific relationship
→ Studio / Reader rendering verification
```

## Important distinction

Base64 is still used, but it is no longer persisted as the image file.

Old approach:

```text
image bytes
→ Base64
→ write Base64 as UTF-8 text to `image.b64`
→ GitHub Action reads text
→ Base64 decode
→ image bytes
```

Preferred approach:

```text
image bytes
→ Base64 transport argument
→ GitHub create_blob(encoding="base64")
→ binary Git blob
→ repository `.jpg`
```

The second approach removes the fragile large-text-file transport step.

## Proven failure of text-file transport

During the Helios Gate test on 08 Aug 2026, the image source was valid, but the large Base64 text written to `image.b64` was corrupted before GitHub Actions could decode it.

Observed workflow error:

```text
base64: invalid input
```

The stored Base64 text no longer began with the normal JPEG Base64 signature `/9j/`, proving the payload had been altered or truncated before workflow decoding.

No Supabase Storage or database records were created by that failed run.

## Native blob verification test

Before the full Canon test, a standalone Git blob test was completed:

1. a JPEG was Base64-encoded;
2. `create_blob(encoding="base64")` returned Git blob SHA `48abf16b73c6135ed930a93689a9f5e362e8132a`;
3. the blob was inserted into a Git tree as `test-artifacts/git-blob-image-test.jpg`;
4. a real Git commit was created;
5. GitHub's UTF-8 file reader rejected the object as binary data rather than text.

This confirmed that GitHub had stored genuine binary image bytes, not Base64 text under a `.jpg` filename.

## Production queue shape

For Chat-originated native-binary uploads, the queue folder should contain:

```text
production-queue/<story>/<unique-item>/
├── manifest.json
└── image.jpg
```

`image.jpg` must be a genuine Git binary blob created from image bytes.

Do not create an `image.b64` file for the native-binary pathway.

## Manifest rules

The manifest requirements are unchanged. Destination routing and database linking remain controlled by the existing destination profiles.

Example Canon manifest:

```json
{
  "storySlug": "life-inside-the-dyson",
  "assetRole": "canon",
  "stage": "concept",
  "workflowStatus": "draft",
  "versionNumber": 1,
  "canonProjectSlug": "life-inside-the-dyson",
  "canonObjectSlug": "helios-gate",
  "canonAssetTitle": "Helios Gate",
  "canonAssetRole": "reference",
  "canonAssetDescription": "Grand ring-city and administrative capital habitat.",
  "canonSortOrder": 0,
  "canonIsPrimaryReference": true,
  "generationNotes": "Native Git binary Canon upload."
}
```

Do not infer identifiers from display text. Resolve exact slugs and Canon keys before upload.

## Required Git operations

The preferred Chat-to-GitHub sequence is:

1. `create_blob` using the complete Base64 representation of the source image and `encoding: "base64"`;
2. create or update a tree entry using:
   - `path`: intended queue path ending in `.jpg`;
   - `mode`: `100644`;
   - `type`: `blob`;
   - `sha`: returned blob SHA;
3. create a commit using the resulting tree;
4. move or create the intended branch at that commit;
5. add or update the matching `manifest.json` as ordinary UTF-8 text;
6. open a controlled pull request or run the approved workflow manually.

## Workflow requirement

The GitHub workflow must consume the checked-out `image.jpg` directly.

It must not require a second Base64 decode step for native-binary queue items.

The workflow must still:

- verify the source file exists and is non-empty;
- confirm the source is a readable image;
- convert or normalise to genuine JPEG when required;
- strip metadata as defined by production policy;
- preserve the destination manifest metadata;
- request short-lived GitHub OIDC identity;
- call the existing Supabase artwork bridge;
- verify `uploaded: true` and a non-empty returned Storage path.

## Security and ownership

Using a Git binary blob changes only the Chat-to-GitHub transport layer.

It does not change:

- OIDC authentication;
- Supabase bridge validation;
- Storage bucket rules;
- media registration;
- Canon ownership rules;
- destination-specific database relationships;
- public/private access policy;
- rendering rules.

GitHub remains the processing and transport layer. Supabase Storage remains the final image store.

## Verification gates

A native-binary upload is complete only when all applicable checks pass:

1. source image bytes are valid;
2. Git blob creation succeeds;
3. repository path is a binary `.jpg`, not Base64 text;
4. workflow checks out and recognises the image;
5. OIDC token request succeeds;
6. Supabase bridge returns `uploaded: true`;
7. returned Storage path is non-empty;
8. Storage object exists;
9. MIME type is `image/jpeg`;
10. matching `media_assets` row exists;
11. intended destination relationship exists;
12. unrelated links and workflow status remain unchanged;
13. public URL returns HTTP 200 when applicable;
14. intended Studio or Reader surface renders the image.

Do not declare success from a green workflow alone.

## Canon acceptance evidence — Helios Gate

Successful end-to-end result:

```text
Story: life-inside-the-dyson
Canon object: helios-gate
Workflow: Upload queued story media
Run: 69
Conclusion: success
Storage path:
life-inside-the-dyson/canon/helios-gate/concept/7e800a5e-8e72-4a4b-b83b-a83ba3269b97.jpg
Media asset ID:
14db3d2d-1449-4f0a-9b27-507c01b82517
Canon asset ID:
2cbe10fe-c5bb-46ba-8500-d90cf36e344e
MIME: image/jpeg
Primary reference: true
Studio render: verified
```

## Operating rule

For images originating inside a Chat session and destined for GitHub production processing, prefer the native Git binary pathway.

Do not use the `image.b64` text-file route unless a specific integration requires it and the complete Base64 file can be independently verified before workflow execution.

## Migration note

The repository's older image-upload documentation may still describe `manifest.json + image.b64` as the standard queue package. That description is now superseded for Chat-originated uploads by this specification.

Destination manifests, OIDC, Supabase routing, Storage registration and database linking remain valid; only the image-ingestion transport from Chat into GitHub changes.
