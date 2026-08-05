# Reliable Image Upload Guides

## Purpose

These guides define the smallest repeatable process for transferring an existing image through GitHub, converting it to a genuine JPEG, uploading it to Supabase Storage, registering it in `media_assets`, linking it to the intended record and verifying the result.

They do not define image-generation or creative specifications.

The instructions are deliberately explicit so that a lower-capacity model can follow them without inventing filenames, paths, database fields or alternative upload methods.

## Canonical pipeline

```text
Source image
→ manifest.json + image.b64 in the GitHub production queue
→ GitHub Actions conversion and validation
→ short-lived GitHub OIDC token
→ Supabase upload bridge
→ story-images Storage object
→ media_assets registration
→ destination-specific link
→ Storage, database and rendering verification
```

There is one transport pipeline. Cover, banner, episode, Canon and Reader images use destination profiles; they must not use independently invented upload processes.

## Current capability matrix

| Destination | Queue recognises role | Upload function has routing | Database link | Current status |
|---|---:|---:|---:|---|
| Story cover | Yes | Yes | `stories.cover_image_path` and URL | Supported |
| Story banner | Yes | Yes | `stories.banner_image_path` | Supported |
| Episode artwork | Yes | Yes | `episodes.artwork_path` and URL | Supported |
| Canon image | Yes | Partial | `private_canon_assets` | Blocked through GitHub queue |
| Reader/Tiptap image | Yes | Partial | `media_assets`; Tiptap must retain `mediaAssetId` | Blocked through GitHub queue |

### Why Canon is blocked

The Supabase upload function requires `canonProjectSlug`, `canonObjectSlug` and optional Canon review fields. The current GitHub workflow does not forward those fields to the bridge.

### Why Reader is blocked

The queue validates `seasonNumber` and `episodeNumber` for Reader images, but the current upload function does not load those values for the Reader role before constructing the Storage path. Reader/Tiptap linking also requires the returned `mediaAssetId` to be written into Reader JSON.

Do not test a blocked profile until the implementation is corrected and separately verified.

## Read order

1. [Core Upload Process](./core-upload-process.md)
2. [Destination Profiles](./destination-profiles.md)
3. [Low-Capacity Model Runbook](./low-capacity-model-runbook.md)
4. [Troubleshooting and Evidence](./troubleshooting.md)

## Non-negotiable rules

1. Never rename `.png` to `.jpg` and call it conversion.
2. Always supply the actual image data. A manifest without `image.b64` cannot upload an image.
3. Never invent a story slug, episode number, Canon key, filename or database target.
4. Never update a database link before the Storage upload succeeds.
5. Never report success from a green workflow alone.
6. Never use a random filename for a production replacement.
7. Never use a blocked destination profile.
8. Stop after the first failed gate and report the exact failure.
9. Preserve the existing content status. The present bridge accepts only `draft` or `review`; published replacement work therefore requires separate review before use.
10. For an upload test, process one image first. Expand only after all verification gates pass.

## Definition of complete

An upload is complete only when all applicable checks pass:

- the workflow processed the intended queue item;
- conversion produced genuine JPEG bytes;
- the Storage object exists at the returned path;
- MIME type, extension and bytes agree;
- a `media_assets` row exists for that path;
- the intended record is linked;
- no unrelated record or workflow status changed;
- the public URL returns HTTP 200 when the asset is meant to be public;
- the image renders in its intended Studio or Reader surface.

If any check is unavailable, report **not verified**, not **successful**.
