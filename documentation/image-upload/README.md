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
3. follow the matching [Destination Profile](./destination-profiles.md);
4. follow the [Core Upload Process](./core-upload-process.md);
5. verify every required gate.

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

Last reconciled: **07 Aug 2026**.

| Destination | Queue recognises role | Upload function routing | Database link | Current status |
|---|---:|---:|---|---|
| Story cover | Yes | Yes | `stories.cover_image_path` and URL | Supported |
| Story banner | Yes | Yes | `stories.banner_image_path` | Supported |
| Episode artwork | Yes | Yes | `episodes.artwork_path` and URL | Supported |
| Canon image | Yes | Yes | `media_assets` + `private_canon_assets` | **Supported and verified** |
| Reader/Tiptap image | Yes | Partial | `media_assets`; Tiptap must retain `mediaAssetId` | Blocked |

### Canon acceptance evidence

The Canon GitHub route has been implemented and acceptance-tested.

Verified fixture:

- Canon workspace: `life-inside-the-dyson`;
- Canon object: `white-dwarf-energy-limits`;
- three distinct approved images;
- one primary reference image;
- matching `media_assets` and `private_canon_assets` records;
- successful Canon workflow runs 60 and 62, including a clean rerun without duplicate assets;
- live Supabase reconciliation on 07 Aug 2026 confirmed the object still has three Canon images.

Canon queue items require `canonProjectSlug`, `canonObjectSlug` and `canonAssetTitle`. The workflow forwards the Canon metadata to the artwork bridge. See [Destination Profiles](./destination-profiles.md) for the complete manifest.

### Reader remains blocked

Reader media is recognised by the queue and the production function contains Reader routing, but the current upload sequence does not yet safely complete the episode-scoped Reader linkage and Tiptap `mediaAssetId` update. Do not substitute episode artwork or an unregistered permanent URL.

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
2. [Destination Profiles](./destination-profiles.md) — required identifiers and role-specific behaviour.
3. [Core Upload Process](./core-upload-process.md) — execution and verification gates.
4. [Low-Capacity Model Runbook](./low-capacity-model-runbook.md) — literal, constrained execution.
5. [Troubleshooting and Evidence](./troubleshooting.md) — only after a gate fails.

## Non-negotiable rules

1. Never rename `.png` to `.jpg` and call it conversion.
2. Always supply the actual image data. A manifest without `image.b64` cannot upload an image.
3. Never invent a story slug, episode number, Canon key, filename or database target.
4. Never update a database link before the Storage upload succeeds.
5. Never report success from a green workflow alone.
6. On the GitHub route, let the production function derive the destination path. Do not inject an unsupported `storagePath` or filename override.
7. Never use a blocked destination profile.
8. Stop after the first failed gate and report the exact failure.
9. Preserve existing content status. Canon upload must not alter story or episode status.
10. For a new or materially changed profile, process one image first. Expand only after all verification gates pass.

## Definition of complete

An upload is complete only when all applicable checks pass:

- the workflow processed the intended queue item;
- conversion produced genuine JPEG bytes;
- the Storage object exists at the returned path;
- MIME type, extension and bytes agree;
- a `media_assets` row exists for that path;
- the intended story, episode or Canon relationship is correct;
- no unrelated record or workflow status changed;
- the public URL returns HTTP 200 when the asset is meant to be public;
- the image renders in its intended Studio or Reader surface.

If any required check is unavailable, report **not verified**, not **successful**.
