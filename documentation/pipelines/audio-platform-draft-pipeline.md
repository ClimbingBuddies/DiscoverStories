# Audio Platform Draft Pipeline

**Status:** Current project standard  
**Scope:** Router for Initial Draft, Creative Development, artwork hand-off and Review submission  
**Owner:** Audio Platform  
**Last updated:** 06 Aug 2026  
**Version:** 2.0

This document routes Audio Platform draft work into separate controlled processes:

1. **Audio Platform Initial Draft Process** — creates the first structured story package.
2. **Audio Platform Creative Development Process** — explores, diagnoses, revises and explicitly synchronises the existing draft.
3. **Audio Platform Image Review Pipeline** — reviews or creates artwork from verified Supabase source records.
4. **Audio Platform Review Pipeline** — assesses one exact synced Review Candidate.
5. **Audio Platform Public Pipeline** — separately authorises publication.

This is a router. Detailed image creation, Storage transport, database relinking and publication rules remain in their authoritative runbooks.

## 1. Pipeline architecture

```text
New story idea
      ↓
Audio Platform Initial Draft
      ↓
Audio Platform Begin Creative Development
      ↺ explore, diagnose, revise and sync as required
      ↓
Supabase Draft Sync and read-back verification
      ↓
Image Review Pipeline when artwork is in scope
      ↺ create, review, approve, upload and verify as authorised
      ↓
Audio Platform Submit to Review Pipeline
      ↓
Audio Platform Review Pipeline
      ↺ may return findings to Creative Development or Image Review
      ↓
Audio Platform Public Pipeline
      ↓
controlled public copy/link and website verification
```

Draft, artwork, Review and Publication are repeatable and separate:

- Initial Draft creates the first interpretation.
- Creative Development improves it.
- Supabase Draft Sync records the current agreed revision as `draft`.
- Image Review uses verified Supabase records as its creative source of truth.
- Submit to Review syncs or verifies the exact Review Candidate.
- Review assesses quality, continuity, SQI and progression.
- Public releases approved content and is the only pipeline that may publish.

## 2. Process commands

### Audio Platform Initial Draft

Use:

> **Audio Platform Initial Draft**

This creates the first structured package for a new story, including the working brief, initial private Story Bible, Episodes 1–10 opening map, Episodes 11–100 roadmap, visual direction and optional diagnostic SQI baseline.

It does not automatically create full scripts, update Supabase, generate production artwork, begin formal Review or publish.

Authoritative process:

`documentation/pipelines/audio-platform-initial-draft-process.md`

### Audio Platform Begin Creative Development

Use:

> **Audio Platform Begin Creative Development**

This opens the repeatable development process for the whole draft or a specific scope. It may perform:

- Explore and Discuss;
- SQI Diagnostic;
- Apply Agreed Revisions;
- Supabase Draft Sync;
- hand-off to Image Review after Supabase verification.

Discussion and diagnostic work do not automatically alter source material or Supabase. Revisions change the working package only. Supabase writes require explicit sync authorisation.

Authoritative process:

`documentation/pipelines/audio-platform-creative-development-process.md`

### Audio Platform Supabase Draft Sync

Use:

> **Audio Platform Supabase Draft Sync**

This inserts or updates the currently agreed revision as `draft`, reads the in-scope records back, verifies records and links, and preserves unrelated production and publication fields.

Image generation or review must not rely on temporary conversation text when the required Supabase source records are missing or inconsistent.

After a successful sync, offer only relevant next processes:

- continue Creative Development;
- begin Image Review for an authorised artwork scope;
- submit the exact synced revision to Review.

Do not ask when the user already supplied the next instruction.

### Audio Platform Image Review Pipeline

Use:

> **Audio Platform Image Review Pipeline**

Run this when artwork must be created, reviewed, refined, replaced or verified.

The pipeline must:

1. retrieve and verify the relevant story, episode, roadmap, Story Bible and Wiki records from Supabase;
2. review the actual image in Studio or inspect it directly;
3. prepare a source-backed visual brief;
4. generate or refine only when authorised;
5. stop for approval before production preparation;
6. use a supported upload pathway when upload is authorised;
7. verify Storage, `media_assets`, the target link and rendered output.

Review-only authority does not permit upload, relinking, replacement or publication.

Authoritative process:

`documentation/pipelines/audio-platform-image-review-pipeline.md`

### Audio Platform Submit to Review Pipeline

Use:

> **Audio Platform Submit to Review Pipeline**

This command must:

1. identify the currently agreed working revision;
2. sync agreed unsynced changes to Supabase as `draft`, or verify the existing synced revision;
3. verify the story, episode range, roadmap blocks, Wiki/continuity data and in-scope artwork links;
4. verify that every in-scope image points to an existing Storage object with consistent format and metadata;
5. nominate that exact synced revision as the Review Candidate;
6. begin the Audio Platform Review Pipeline.

If sync, Storage, database-link or rendering verification fails, do not begin Review. This command never publishes.

## 3. Initial Draft handoff

After completing the Initial Draft, ask:

> The Initial Draft is complete. Would you like to **Audio Platform Begin Creative Development** for the whole draft or revise something specific?

The user may nominate the whole package or one precise element, including a character, relationship, episode range, roadmap block, mystery, artwork direction or SQI finding.

## 4. Creative Development operating rule

> **Explore freely. Revise deliberately. Sync explicitly.**

Interpret ordinary language as follows:

| User wording | Default action |
|---|---|
| discuss, explore, consider, compare | Explore and Discuss |
| assess, run SQI, score, diagnose | SQI Diagnostic |
| apply, revise, update the story | Apply Agreed Revisions |
| sync, insert, update Supabase | Supabase Draft Sync |
| review/create/replace images | Image Review Pipeline |
| upload approved images | Image Review upload hand-off using a supported route |
| submit to Review | Sync/verify candidate and begin Review |
| publish | Public Pipeline; never implied by draft or upload authority |

The user does not need to memorise rigid syntax. The project prefix **Audio Platform** distinguishes these commands from work in other projects.

## 5. Draft data rules

- New and updated content records remain `draft` unless the Public Pipeline separately authorises publication.
- Supabase loads must be safe to rerun.
- Use the season-aware episode identity `(story_id, season_number, episode_number)`.
- Roadmap blocks are planning records and must not pretend that future individual episodes already exist.
- Preserve existing `audio_url`, `duration_seconds`, publication metadata and audit fields during ordinary draft syncs.
- Supabase is the source of truth for image identity, Storage paths and database relationships.
- Store relative Storage paths in database fields. Never persist signed URLs.
- Register managed images in `media_assets` and use `mediaAssetId` for Reader/Tiptap content where supported.
- Never update a database link until the destination Storage object has been verified.
- Discussion, SQI diagnostics and image review-only work never silently write to Supabase.
- A successful sync records progress; it does not end Creative Development or authorise publication.

## 6. Artwork and Storage hand-off

### 6.1 Required sequence

When artwork is in scope:

```text
Supabase content sync
→ read-back verification
→ Image Review
→ image approval
→ production preparation
→ supported Storage upload
→ Storage verification
→ media_assets registration
→ exact database link
→ Studio verification
→ public publishing and website verification only when separately authorised
```

Approval of an image authorises only the action expressed by the user. Review approval does not automatically authorise upload, database relinking or publication.

### 6.2 Supported transport routes

There are two distinct Storage routes. Do not combine their assumptions.

| Route | Intended use | Naming and destination |
|---|---|---|
| GitHub production queue and OIDC bridge | Canonical production upload for supported destination profiles | The deployed function derives the approved canonical path; models must not invent or override it |
| Chat with connected Supabase tools | Controlled private upload, inspection, copy and explicitly authorised maintenance | `storage_upload` accepts an approved private story-relative path; a lowercase UUID filename may be used when requested |

A filename decision must preserve the true file extension. Renaming `.png` to `.jpg` does not convert the bytes.

A random UUID filename makes a public object difficult to guess but does not make it private. Restricted artwork must remain in private Storage and use authorised or time-limited access.

### 6.3 Operation boundaries

- `storage_upload` creates a new private object at the approved supplied path. It may assign a UUID filename during upload.
- `storage_copy` creates a destination object and preserves the source. It is the safe relocation primitive and the basis for controlled private/public copying.
- `storage_move` moves or renames an existing object and removes the source path. It is available only to a Chat session with connected Supabase tools; it is not implemented in the private custom GPT Action.
- `storage_file_rename` does not exist. A Storage rename is technically a move to a new path.
- Storage operations do not automatically update `media_assets`, episode fields, story fields, Canon, Wiki or Reader/Tiptap content.
- No general atomic `media_relink` operation exists. Database updates are separate, exact and explicitly authorised.

### 6.4 Linked production images

Do not directly move a linked production image.

Use:

```text
discover every reference
→ copy to the destination
→ verify bytes, eTag, size and MIME type
→ relink only approved records
→ verify Studio and website rendering
→ retain the source for rollback
→ submit the old source to separately controlled cleanup
```

A direct `storage_move` is suitable only for an isolated object with no database or embedded-content reference.

Do not delete either object while Storage, database or rendering state is uncertain.

### 6.5 Completion evidence

An artwork upload, relocation or relink is complete only when all applicable evidence exists:

- destination Storage object exists;
- extension, MIME type and bytes agree;
- eTag/checksum and size match the expected source where copied;
- `media_assets` registration is correct;
- the exact story, episode, Canon, Wiki or Reader relationship is correct;
- no unrelated record changed;
- Studio renders the intended image;
- the public URL returns HTTP 200 and the website renders the image when public;
- rollback remains possible for a replacement or relocation;
- temporary operation authority has been removed.

A database update alone is not proof that the image works.

## 7. Supporting specifications

- Initial Draft Process: `documentation/pipelines/audio-platform-initial-draft-process.md`
- Creative Development Process: `documentation/pipelines/audio-platform-creative-development-process.md`
- Image Review Pipeline: `documentation/pipelines/audio-platform-image-review-pipeline.md`
- Review Pipeline: `documentation/pipelines/audio-platform-review-pipeline.md`
- Story creation: `documentation/specifications/story-creation-specification.md`
- Story Quality Index: `documentation/specifications/story-quality-index.md`
- Story SQL insert: `documentation/specifications/story-sql-insert-specification.md`
- Wiki SQL insert: `documentation/specifications/wiki-sql-insert-specification.md`
- Episode artwork: `documentation/specifications/episode-artwork-production-specification.md`
- Image upload process: `documentation/image-upload/README.md`
- Storage Management Action Specification: `docs/specifications/Storage_Management_Action_Specification_v1.0.md`
- Storage Copy Runbook: `docs/actions/storage-copy-runbook.md`
- Storage Move Runbook — connected Supabase Chat only: `docs/actions/storage-move-runbook.md`
- Storage Move and Database Relink Runbook — process specification: `docs/actions/storage-move-and-relink-runbook.md`

Where an older upload guide conflicts with a verified operation boundary in the Storage Management specification, follow the more recent Storage Management specification for connected-Supabase Chat work. Continue following the destination-profile restrictions for the GitHub production route.

## 8. Definition of done

This router is correctly followed when:

- a new story begins with Audio Platform Initial Draft;
- all later draft work uses Audio Platform Creative Development;
- the user may target the whole draft or one specific scope;
- Supabase writes occur only through explicit authority;
- image work begins from verified Supabase records;
- approved images use a supported transport route without invented fields or paths;
- Storage, database relationships and rendering are verified independently;
- Submit to Review identifies and verifies one exact Review Candidate;
- Review and Publication remain separate;
- private custom GPT and connected-Supabase Chat capabilities are not confused.

## 9. Version history

| Version | Date | Change |
|---|---|---|
| 2.0 | 06 Aug 2026 | Added the Image Review hand-off, distinct GitHub and connected-Supabase Storage routes, UUID naming boundary, private/public controls, verified upload/copy/move behaviour, database relinking, rendering verification and rollback requirements. |
| 1.0 | 29 Jul 2026 | Initial router for Initial Draft, Creative Development and Review submission. |
