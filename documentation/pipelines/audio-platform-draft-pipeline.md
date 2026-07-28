# Audio Platform Draft Pipeline

**Status:** Current working standard  
**Scope:** Draft creation and technical website testing  
**Current focus:** Draft only  
**Workflow statuses:** Draft → Review → Published  
**Owner:** Audio Platform  
**Last updated:** 27 Jul 2026

This is the authoritative runbook for creating a complete ten-episode Audio Platform draft. The detailed story, wiki, SQL and artwork specifications remain supporting references. If a supporting document appears to conflict with this runbook, stop and report the conflict before loading data.

## 1. What the Draft Pipeline is for

The Draft Pipeline creates a complete, testable vertical slice of a story:

- one story concept and longer-term season direction;
- Episodes 1–10;
- a private wiki/story bible derived from the story and episodes;
- character and visual-continuity guidance;
- one cover, one banner and ten low-resolution episode images;
- database records, category assignment and artwork links;
- website verification.

Draft data is experimental and may be replaced, revised or removed during testing. A record marked `published` may exist for current website/sample-data testing; that does not mean the wider platform or the creative work has received final public approval. Do not add `is_test_content` or `pipeline_environment` unless a separate schema decision is approved.

This runbook does not define the Review, Published or Audio pipelines. Those remain future workflows.

## 2. The mandatory execution order

Do not start image generation, image upload or database loading until the earlier creative stages are complete.

1. **Brief and concept**
   - Confirm title, slug, category and audience.
   - Define the hook, premise, central character, story promise and major question.
   - Define the intended 100-episode direction as ten broad arcs. Only the first ten episodes need complete prose.

2. **Episodes 1–10**
   - Write the complete first ten episodes.
   - Each episode needs a number, title, summary and narrative prose.
   - Use character-led pacing, distinct emotional movement and a meaningful consequence or changed objective across the opening batch.
   - Word count is calculated and reported for information. It is subjective guidance and must never block the draft or fail a SQL transaction.

3. **Wiki and story bible**
   - Build the private wiki from the concept and Episodes 1–10.
   - Record only facts supported by the story or clearly labelled planned canon.
   - Include the protagonist, recurring characters, relationships, setting, important objects, timeline, rules and unresolved questions.
   - A wiki is optional for a minimal exploratory draft, but it is required for this complete Draft Pipeline test because it supports continuity and artwork.

4. **Character and visual continuity**
   - Define recurring characters' identity, age range, face/hair, build, clothing, accessories, emotional baseline and non-changing visual constraints.
   - Identify changes that are intentionally allowed across Episodes 1–10.
   - Do not invent artwork details that contradict the story or wiki.

5. **Episode visual briefs**
   - Create one brief for the cover, banner and each episode image.
   - For every episode specify: visual event, setting, subject/action, emotion, focal object, composition, lighting/palette and continuity notes.
   - Dream, memory, supernatural or altered-state imagery must be identified explicitly when it is part of the episode's meaning.
   - Select one clear event per image. Do not combine unrelated scenes.

6. **Draft artwork**
   - Generate one cover, one banner and ten low-resolution episode placeholders.
   - Use the character continuity record and episode visual briefs.
   - The images are deliberately replaceable and are for testing the complete website pipeline.
   - Do not embed titles, episode numbers, logos, watermarks, borders, UI or generated text.
   - The image set must show character consistency, emotional variety and the important visual states of the opening batch.

7. **Prepare the load**
   - Confirm the slug, category, story status, episode range, image filenames and relative storage paths.
   - Prepare idempotent story, episode, wiki and category data.
   - Use current database column names and the season-aware episode key:
     `(story_id, season_number, episode_number)`.
   - Preserve existing audio, duration, audit fields and approved assets unless the request explicitly authorises replacement.

8. **Load and link**
   - Load the story and Episodes 1–10 using the approved SQL/draft loader.
   - Load wiki content where included.
   - Assign the story through the database-driven `genres → story_genres → stories` relationship.
   - Upload/link cover, banner and episode artwork only after the corresponding creative records exist.
   - Use relative Supabase Storage paths, never signed URLs, in database fields.

9. **Verify**
   - Verify one story row and exactly ten intended episode rows.
   - Verify episode numbers are contiguous and the episode key is correct.
   - Verify category assignment.
   - Verify wiki records and links where included.
   - Verify each artwork path exists, resolves publicly and displays on the website.
   - For a new or changed bridge, first run the four-asset acceptance batch: cover, banner and Episodes 1–2.
   - Verify rerunning the load does not create duplicates or erase audio/production fields.
   - Report the first failed stage; do not silently continue.

## 3. Draft artwork policy

Artwork has three separate operational stages:

| Stage | Purpose | Linking |
|---|---|---|
| Concept | Explore visual direction and alternatives | Normally unlinked |
| Draft/Review placeholder | Test the complete website and database path | May be uploaded and linked |
| Production | Final approved artwork for publication | Linked after final approval |

The standard quick-draft set is **one cover + one banner + ten episode images**.

JPEG/JPG is the standard format for ordinary low-resolution Draft/Review placeholders. The generator may emit PNG, but the upload workflow must perform a real JPEG conversion and verify the resulting file before upload. PNG is retained only when transparency is genuinely required or a later approved production decision calls for it.

Production dimensions are 1024×1024 for square artwork and 1600×900 for banners. Draft dimensions may be lower and flexible, provided the images are recognisable and suitable for pipeline testing.

Use lowercase slugs and predictable names. Draft filenames may follow the working upload convention, but the database path must match the actual uploaded object. Production paths use:

```text
<slug>/cover.png
<slug>/banner.png
<slug>/episodes/<slug>-s01eNN.png
```

## 4. Database and SQL safety rules

- Default new story and episode records to `draft` unless a separate explicit instruction authorises another status.
- Status is a data value, not a creative approval decision.
- Loads must be safe to rerun.
- Upsert by story slug and season-aware episode identity.
- Calculate `word_count` from the stored `script_text`.
- Treat word-count ranges as informational warnings only.
- Never overwrite `audio_url`, `duration_seconds`, `created_at`, `created_by` or `published_at` during an ordinary draft content load.
- Update artwork paths only when a new path is supplied; preserve an existing approved path otherwise.
- Use relative storage paths, not public URLs, in database columns.
- Do not weaken a missing uniqueness constraint or invent a parallel narrative table. Stop and prepare a reviewed migration if the live schema does not support the required conflict target.
- Do not add test-environment columns for ordinary draft experimentation.
- Run read-only verification after the transaction commits.

## 5. Required completion report

A Draft Pipeline run is complete only when the report includes:

| Area | Result |
|---|---|
| Concept and season direction | Complete / blocked |
| Episodes 1–10 | Complete / blocked |
| Wiki/story bible | Complete / optional / blocked |
| Character continuity | Complete / blocked |
| Visual briefs | Complete / blocked |
| Cover and banner | Created / linked / blocked |
| Ten episode images | Created / linked / blocked |
| Story and episode load | Verified / blocked |
| Category assignment | Verified / blocked |
| Website display | Verified / blocked |
| Rerun/idempotency check | Verified / not yet tested |
| Draft Pipeline complete | Yes / No |

The pipeline is **not** complete merely because the creative text exists or images were generated. It is complete when the database and website test has also been verified.

## 6. Reusable instruction

Use this instruction when starting a new draft:

> **Use the Audio Platform Draft Pipeline only.**
>
> Create a complete ten-episode draft for “[TITLE]” in the “[CATEGORY]” category. Follow the authoritative runbook in `documentation/pipelines/audio-platform-draft-pipeline.md`.
>
> Work in this order: concept and longer-term direction; Episodes 1–10; wiki/story bible; character and visual continuity; episode visual briefs; one cover, one banner and ten low-resolution draft images; database/category/artwork loading; verification.
>
> Do not generate images, upload files or load the database until the story, Episodes 1–10, wiki and visual briefs are complete. Use status `draft`. Word count is informational only. Do not use Review or Published approval rules. Report completion at each stage and stop at the first failed stage.

## 7. Supporting specifications

- Story creation: `documentation/specifications/story-creation-specification.md`
- Wiki and SQL insert: `documentation/specifications/wiki-sql-insert-specification.md`
- Story SQL insert: `documentation/specifications/story-sql-insert-specification.md`
- Episode artwork: `documentation/specifications/episode-artwork-production-specification.md`
- Image upload automation: `database/IMAGE-UPLOAD-AUTOMATION.md`

These documents provide detail. This runbook controls the end-to-end Draft sequence.
