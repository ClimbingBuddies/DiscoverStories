# Reliable Image Upload Guides

## Purpose

These guides define the smallest repeatable process for transferring and linking an existing image. They distinguish the GitHub queue/OIDC production route from controlled Storage maintenance performed in a Chat session with connected Supabase tools.

They do not define image-generation or creative specifications.

The instructions are deliberately explicit so that a lower-capacity model can follow them without inventing filenames, paths, database fields or alternative upload methods.

## Route 1 — GitHub production upload

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

This is the canonical production-upload route for the supported destination profiles. Its derived filenames and destination rules must not be replaced with invented paths.

## Route 2 — Connected-Supabase Chat

A Chat session with connected Supabase tools may perform controlled `storage_upload`, `storage_copy` and, with temporary authority, `storage_move` operations. This route is used for private uploads and authorised Storage maintenance; it does not inherit the GitHub manifest or derived-filename rules.

- `storage_upload` may create an object at an approved path and may use a lowercase UUID filename.
- `storage_copy` preserves the source and is preferred for linked relocation.
- `storage_move` removes the source and is suitable only for unlinked objects; it is not available to the private custom GPT Action.
- Storage operations do not automatically register `media_assets` or relink database/content references.
- `storage_file_rename` and a general atomic `media_relink` operation do not exist.

Random naming reduces guessability but does not make a public object private. Restricted assets belong in private Storage with appropriate access control.

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
6. On the GitHub production route, never invent or override a replacement filename. On the connected-Supabase route, UUID names are permitted only for an approved new private destination.
7. Never use a blocked destination profile.
8. Stop after the first failed gate and report the exact failure.
9. Preserve the existing content status. The GitHub bridge accepts only `draft` or `review`. Published linked relocation through connected-Supabase Chat requires copy-first verification, exact authorised relinking, rendering verification and rollback; it is not an atomic replacement operation.
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
