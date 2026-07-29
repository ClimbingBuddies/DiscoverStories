# Audio Platform Draft Pipeline

**Status:** Current project standard  
**Scope:** Router for Initial Draft and Creative Development  
**Owner:** Audio Platform  
**Last updated:** 29 Jul 2026

This document routes Audio Platform draft work into two separate processes:

1. **Audio Platform Initial Draft Process** — creates the first structured story package.
2. **Audio Platform Creative Development Process** — repeatedly explores, diagnoses, revises and optionally synchronises the existing draft.

The Review Pipeline remains separate and assesses one exact synced Review Candidate. The Public Pipeline remains the only process that may publish.

## 1. Pipeline architecture

```text
New story idea
      ↓
Audio Platform Initial Draft
      ↓
Audio Platform Begin Creative Development
      ↺ explore, diagnose, revise and sync as required
      ↓
Audio Platform Submit to Review Pipeline
      ↓
Audio Platform Review Pipeline
      ↺ may return findings to Creative Development
      ↓
Audio Platform Public Pipeline
```

Draft and Review are repeatable and separate:

- Initial Draft creates the first interpretation.
- Creative Development improves it.
- Supabase Draft Sync records the current agreed revision as `draft`.
- Submit to Review syncs or verifies the exact candidate before formal assessment.
- Review assesses quality, continuity, SQI and progression.
- Public releases approved content.

## 2. Process commands

### Audio Platform Initial Draft

Use:

> **Audio Platform Initial Draft**

This creates the first structured package for a new story, including the working brief, initial private Story Bible, Episodes 1–10 opening map, Episodes 11–100 roadmap, visual direction and optional diagnostic SQI baseline.

It does not automatically create full scripts, update Supabase, begin formal Review or publish.

Authoritative process:

`documentation/pipelines/audio-platform-initial-draft-process.md`

### Audio Platform Begin Creative Development

Use:

> **Audio Platform Begin Creative Development**

This opens the repeatable development process for the whole draft or a specific scope. It may perform:

- Explore and Discuss;
- SQI Diagnostic;
- Apply Agreed Revisions;
- Supabase Draft Sync.

Discussion and diagnostic work do not automatically alter source material or Supabase. Revisions change the working package only. Supabase writes require explicit sync authorisation.

Authoritative process:

`documentation/pipelines/audio-platform-creative-development-process.md`

### Audio Platform Supabase Draft Sync

Use:

> **Audio Platform Supabase Draft Sync**

This inserts or updates the currently agreed revision as `draft`, verifies the in-scope records and links, and preserves unrelated production and publication fields.

After a successful sync, ask:

> The current draft has been synced and verified. Would you like to continue **Audio Platform Creative Development** or **Audio Platform Submit to Review Pipeline**?

Do not ask when the user already supplied the next instruction.

### Audio Platform Submit to Review Pipeline

Use:

> **Audio Platform Submit to Review Pipeline**

This command must:

1. identify the currently agreed working revision;
2. sync any agreed unsynced changes to Supabase as `draft`, or verify the existing synced revision;
3. verify the story, episode range, roadmap blocks, Wiki/continuity data and in-scope artwork links;
4. nominate that exact synced revision as the Review Candidate;
5. begin the Audio Platform Review Pipeline.

If sync or verification fails, do not begin Review. This command never publishes.

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
| sync, upload, insert, update Supabase | Supabase Draft Sync |
| submit to Review | Sync/verify candidate and begin Review |

The user does not need to memorise rigid syntax. The project prefix **Audio Platform** distinguishes these commands from creative-development work in other projects.

## 5. Draft data rules

- New and updated records remain `draft` unless the Public Pipeline separately authorises publication.
- Supabase loads must be safe to rerun.
- Use the season-aware episode identity `(story_id, season_number, episode_number)`.
- Roadmap blocks are planning records and must not pretend that future individual episodes already exist.
- Preserve existing `audio_url`, `duration_seconds`, publication metadata and audit fields during ordinary draft syncs.
- Use relative Storage paths rather than signed URLs.
- Discussion and SQI diagnostics never silently write to Supabase.
- A successful sync records progress; it does not end Creative Development.

## 6. Supporting specifications

- Initial Draft Process: `documentation/pipelines/audio-platform-initial-draft-process.md`
- Creative Development Process: `documentation/pipelines/audio-platform-creative-development-process.md`
- Review Pipeline: `documentation/pipelines/audio-platform-review-pipeline.md`
- Story creation: `documentation/specifications/story-creation-specification.md`
- Story Quality Index: `documentation/specifications/story-quality-index.md`
- Story SQL insert: `documentation/specifications/story-sql-insert-specification.md`
- Wiki SQL insert: `documentation/specifications/wiki-sql-insert-specification.md`
- Episode artwork: `documentation/specifications/episode-artwork-production-specification.md`
- Image upload automation: `database/IMAGE-UPLOAD-AUTOMATION.md`

## 7. Definition of done

This router is correctly followed when:

- a new story begins with Audio Platform Initial Draft;
- all later draft work uses Audio Platform Creative Development;
- the user may target the whole draft or one specific scope;
- Supabase writes occur only through explicit Draft Sync or Submit to Review authority;
- Submit to Review always syncs or verifies one exact Review Candidate;
- Review and Publication remain separate processes.
