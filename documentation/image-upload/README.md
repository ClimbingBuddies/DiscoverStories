# Reliable Image Upload Guides

## Purpose

These guides define the smallest repeatable process for transferring and linking an existing image. They distinguish the GitHub queue/OIDC production route from controlled Storage maintenance performed in a Chat session with connected Supabase tools.

They do not define image-generation or creative specifications.

The instructions are deliberately explicit so that a lower-capacity model can follow them without inventing filenames, paths, database fields or alternative upload methods.

## Operating rule — start here

This README is the entry point for image-upload work.

### Normal task

When the request is to upload, replace or link an image:

1. read this README;
2. confirm the destination is marked **Supported** below;
3. for Chat-originated images, read [Native Git Binary Image Pathway](./native-git-binary-pathway.md);
4. follow the matching [Destination Profile](./destination-profiles.md);
5. follow the [Core Upload Process](./core-upload-process.md);
6. verify every required gate.

Do not search historical documents, old commits or unrelated pull requests during a normal task unless a documented gate fails or the current documentation directly contradicts the current implementation.

### Review or audit

When the request is explicitly a review, audit, reconciliation or capability assessment, reconcile evidence in this order:

1. current documentation;
2. current merged code on `main`;
3. relevant recent/open pull requests;
4. live Supabase schema, Storage and Edge Functions;
5. verified successful test evidence.

If those sources disagree, report the disagreement and correct the stale repository guidance before declaring the capability current. A verified live test is stronger evidence of what is presently deployed than stale documentation, but the repository should be brought back into alignment so future normal tasks do not require an audit.

## Current capability status

Last reconciled: **08 Aug 2026**.

| Destination | Queue recognises role | Upload function routing | Database link | Current status |
|---|---:|---:|---|---|
| Story cover | Yes | Yes | `stories.cover_image_path` and URL | Supported |
| Story banner | Yes | Yes | `stories.banner_image_path` | Supported |
| Episode artwork | Yes | Yes | `episodes.artwork_path` and URL | Supported |
| Canon image | Yes | Yes | `media_assets` + `private_canon_assets` | **Supported and verified** |
| Reader/Tiptap image | Yes | Partial | `media_assets`; Tiptap must retain `mediaAssetId` | Blocked |

### Native Git binary transport acceptance evidence

Chat-originated image ingestion through GitHub's native blob API was verified end-to-end on 08 Aug 2026 using `life-inside-the-dyson` → `helios-gate`.

Verified result:

- image transferred from Chat using `create_blob(encoding="base64")`;
- GitHub stored a genuine binary JPEG blob;
- the blob was committed as `image.jpg` in the production queue;
- GitHub Actions run 69 succeeded;
- GitHub OIDC authentication succeeded;
- Supabase Storage object was created;
- matching `media_assets` and `private_canon_assets` rows were created;
- Studio rendered the image in both list thumbnail and primary artwork views.

For Chat-originated uploads, this native binary route supersedes writing the image as a large `image.b64` UTF-8 text file. See [Native Git Binary Image Pathway](./native-git-binary-pathway.md).

### Canon acceptance evidence

The Canon GitHub route has been implemented and acceptance-tested.

Verified fixtures include:

- `life-inside-the-dyson` → `white-dwarf-energy-limits`: three distinct approved images, one primary reference, matching `media_assets` and `private_canon_assets`, successful workflow runs 60 and 62;
- `life-inside-the-dyson` → `helios-gate`: native Git binary upload, successful workflow run 69, Storage/media/Canon linkage and Studio render verified.

Canon queue items require `canonProjectSlug`, `canonObjectSlug` and `canonAssetTitle`. The workflow forwards the Canon metadata to the artwork bridge. See [Destination Profiles](./destination-profiles.md) for the complete manifest.

### Reader remains blocked

Reader media is recognised by the queue and the production function contains Reader routing, but the current upload sequence does not yet safely complete the episode-scoped Reader linkage and Tiptap `mediaAssetId` update. Do not substitute episode artwork or an unregistered permanent URL.

## Route 1 — GitHub production upload

For Chat-originated images, the preferred transport is:

```text
Source image
→ Base64 used only as API transport
→ GitHub create_blob(encoding="base64")
→ genuine binary Git blob
→ image.jpg + manifest.json in production queue
→ GitHub Actions validation/conversion as required
→ short-lived GitHub OIDC token
→ Supabase upload bridge
→ story-images Storage object
→ media_assets registration
→ destination-specific link
→ Storage, database and rendering verification
```

The older `manifest.json + image.b64` queue method is not the preferred Chat-to-GitHub transport because a large Base64 text payload was observed to corrupt during a connector text write. It may remain only where a specific integration requires it and the complete Base64 file can be independently validated.

This is the canonical production-upload route for supported destination profiles. Its destination rules must not be replaced with invented paths.

## Route 2 — Connected-Supabase Chat

A Chat session with connected Supabase tools may perform controlled `storage_upload`, `storage_copy` and, with temporary authority, `storage_move` operations. This route is used for private uploads and authorised Storage maintenance; it does not inherit the GitHub manifest or derived-filename rules.

- `storage_upload` may create an object at an approved path and may use a lowercase UUID filename.
- `storage_copy` preserves the source and is preferred for linked relocation.
- `storage_move` removes the source and is suitable only for unlinked objects; it is not available to the private custom GPT Action.
- Storage operations do not automatically register `media_assets` or relink database/content references.
- `storage_file_rename` and a general atomic `media_relink` operation do not exist.

Random naming reduces guessability but does not make a public object private. Restricted assets belong in private Storage with appropriate access control.

## Read order

1. This README — capability and route selection.
2. [Native Git Binary Image Pathway](./native-git-binary-pathway.md) — preferred Chat-to-GitHub binary transport.
3. [Destination Profiles](./destination-profiles.md) — required identifiers and role-specific behaviour.
4. [Core Upload Process](./core-upload-process.md) — execution and verification gates.
5. [Low-Capacity Model Runbook](./low-capacity-model-runbook.md) — literal, constrained execution.
6. [Troubleshooting and Evidence](./troubleshooting.md) — only after a gate fails.

## Non-negotiable rules

1. Never rename `.png` to `.jpg` and call it conversion.
2. Always supply the actual image bytes. For Chat-originated images, prefer a native Git blob rather than persisting Base64 as a text file.
3. Never invent a story slug, episode number, Canon key, filename or database target.
4. Never update a database link before the Storage upload succeeds.
5. Never report success from a green workflow alone.
6. On the GitHub route, let the production function derive the final destination path. Do not inject an unsupported `storagePath` or filename override.
7. Never use a blocked destination profile.
8. Stop after the first failed gate and report the exact failure.
9. Preserve existing content status. Canon upload must not alter story or episode status.
10. For a new or materially changed profile, process one image first. Expand only after all verification gates pass.

## Definition of complete

An upload is complete only when all applicable checks pass:

- the workflow processed the intended queue item;
- the checked-out image is genuine binary image data;
- conversion produced genuine JPEG bytes when conversion is required;
- the Storage object exists at the returned path;
- MIME type, extension and bytes agree;
- a `media_assets` row exists for that path;
- the intended story, episode or Canon relationship is correct;
- no unrelated record or workflow status changed;
- the public URL returns HTTP 200 when the asset is meant to be public;
- the image renders in its intended Studio or Reader surface.

If any required check is unavailable, report **not verified**, not **successful**.
