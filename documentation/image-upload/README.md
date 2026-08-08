# Reliable Image Upload Guides

## Purpose

These guides define the smallest repeatable process for transferring and linking an existing image. They distinguish the GitHub queue/OIDC production route from the simpler Supabase `ToBeFiled` staging route.

They do not define image-generation or creative specifications.

The instructions are deliberately explicit so that a lower-capacity model can follow them without inventing filenames, paths, database fields or alternative upload methods.

## Operating rule — start here

This README is the entry point for image-upload work.

### Choose the route from the prompt

The user may explicitly select either supported route:

**GitHub route prompt**

> Use **GitHub image upload** for these images.

**ToBeFiled route prompt**

> Use **ToBeFiled upload process** for these images.

When a route is explicitly requested, follow that route. Do not silently substitute the other route unless the selected route fails and the user approves a fallback.

If no route is specified:

- prefer **ToBeFiled** for small Canon batches where the user is happy to upload the original files manually to Supabase;
- prefer **GitHub** for production automation, repeatable queue processing, or when the user explicitly wants the automated GitHub path.

### Normal task

When the request is to upload, replace or link an image:

1. read this README;
2. choose the route from the prompt or the default rule above;
3. confirm the destination is marked **Supported** below;
4. follow the matching route documentation;
5. follow the [Destination Profile](./destination-profiles.md) for role-specific target rules;
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

| Destination | GitHub route | ToBeFiled route | Database link | Current status |
|---|---:|---:|---|---|
| Story cover | Yes | Possible with destination rules | `stories.cover_image_path` and URL | Supported |
| Story banner | Yes | Possible with destination rules | `stories.banner_image_path` | Supported |
| Episode artwork | Yes | Possible with destination rules | `episodes.artwork_path` and URL | Supported |
| Canon image | Yes | **Yes — verified** | `media_assets` + `private_canon_assets` | **Supported and verified** |
| Reader/Tiptap image | Partial | Not yet standardised | `media_assets`; Tiptap must retain `mediaAssetId` | Blocked |

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

### ToBeFiled Canon acceptance evidence

The ToBeFiled staging route was acceptance-tested on 08 Aug 2026 with five full-size PNG Canon habitat images for `life-inside-the-dyson`:

- Aurora Glass;
- Helios Gate;
- Cinder Loop;
- The Iron Continent;
- The Stacks of Kharon.

The files were uploaded manually to the public `ToBeFiled` bucket, identified from the Chat-generated batch, copied natively into `story-images`, registered in `media_assets`, linked through `private_canon_assets`, and verified as the intended primary draft references. The PNG bytes were preserved; no JPEG conversion, Base64 transport or GitHub queue was used for this filing step.

The deployed helper for this route is `discoverstories-staging-copy`.

### Reader remains blocked

Reader media is recognised by the queue and the production function contains Reader routing, but the current upload sequence does not yet safely complete the episode-scoped Reader linkage and Tiptap `mediaAssetId` update. Do not substitute episode artwork or an unregistered permanent URL.

## Route 1 — GitHub production upload

Use when the prompt says:

> Use **GitHub image upload**.

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

This is the canonical automated production-upload route for supported destination profiles. Its destination rules must not be replaced with invented paths.

Follow [Core Upload Process](./core-upload-process.md).

## Route 2 — ToBeFiled staging upload

Use when the prompt says:

> Use **ToBeFiled upload process**.

```text
ChatGPT creates image(s)
→ user uploads original files unchanged to Supabase ToBeFiled
→ ChatGPT identifies the new files
→ ChatGPT resolves the intended destination records
→ copy original bytes to story-images
→ register media_assets
→ link Canon/episode/story target
→ verify Storage, database and rendering
```

This route deliberately keeps the manual step small: the user handles only the binary upload into `ToBeFiled`; ChatGPT handles filing, naming, database registration, linking and verification.

For Canon batches this is currently the preferred low-friction route when the user is comfortable with a manual Supabase upload.

Follow [ToBeFiled Staging Image Process](./tobefiled-staging-process.md).

## Route comparison

| Question | GitHub image upload | ToBeFiled upload process |
|---|---|---|
| Binary transport | Automated through GitHub queue | User manually uploads to Supabase staging |
| Original PNG preserved | No — current workflow converts to JPEG | Yes |
| Base64 required | Yes in the current queue | No |
| GitHub required | Yes | No |
| Best for | automation / repeatable production queue | small Canon batches / simple reliable filing |
| ChatGPT handles database linking | Yes | Yes |
| Staging source preserved | Queue remains in GitHub | Yes, when copy is used |

## Read order

1. This README — capability and route selection.
2. [Destination Profiles](./destination-profiles.md) — required identifiers and role-specific behaviour.
3. Route-specific execution:
   - [Core Upload Process](./core-upload-process.md) for GitHub;
   - [ToBeFiled Staging Image Process](./tobefiled-staging-process.md) for ToBeFiled.
4. [Low-Capacity Model Runbook](./low-capacity-model-runbook.md) — literal, constrained execution.
5. [Troubleshooting and Evidence](./troubleshooting.md) — only after a gate fails.

## Non-negotiable rules

1. Never rename `.png` to `.jpg` and call it conversion.
2. Never invent a story slug, episode number, Canon key, filename or database target.
3. Never update a database link before the Storage upload/copy succeeds.
4. Never report success from a green workflow or successful copy alone.
5. When the GitHub route is selected, follow its manifest and derived-path rules.
6. When the ToBeFiled route is selected, preserve the original image format unless the user explicitly requests conversion.
7. Prefer copy rather than move from `ToBeFiled` until verification is complete.
8. Never use a blocked destination profile.
9. Stop after the first failed gate and report the exact failure.
10. Preserve existing content status unless the user explicitly authorises a change.
11. For a new or materially changed profile, process one image first. Expand only after all verification gates pass.

## Definition of complete

An upload is complete only when all applicable checks pass:

- the intended source file is uniquely identified;
- the Storage object exists at the intended final path;
- MIME type, extension and bytes agree;
- a `media_assets` row exists for that path;
- the intended story, episode or Canon relationship is correct;
- no unrelated record or workflow status changed;
- the public URL returns HTTP 200 when the asset is meant to be public;
- the image renders in its intended Studio or Reader surface.

For GitHub jobs, also verify the intended queue/workflow item. For ToBeFiled jobs, verify the staging source remains available until the filing result is accepted.

If any required check is unavailable, report **not verified**, not **successful**.
