# Audio Platform Draft Pipeline

**Status:** Current working standard  
**Scope:** Draft creation and technical website testing  
**Current focus:** Draft only  
**Workflow statuses:** Draft → Review → Published  
**Owner:** Audio Platform  
**Last updated:** 28 Jul 2026

This is the authoritative runbook for creating a variable-range Audio Platform draft. The requested episode range and mode determine whether the pipeline prepares roadmap material, full scripts, artwork, or a combination of these. The detailed story, wiki, SQL and artwork specifications remain supporting references. If a supporting document appears to conflict with this runbook, stop and report the conflict before loading data.

## 1. What the Draft Pipeline is for

The Draft Pipeline creates a complete, reviewable Draft Workspace before any external commit:

- one story concept and longer-term season direction;
- the initial production batch;
- a private wiki/story bible derived from the story and episodes;
- character and visual-continuity guidance;
- one cover, one banner and initial artwork for the default first production batch; later episode artwork is generated on demand unless explicitly requested for a selected range;
- database records, category assignment and artwork links prepared for a later commit;
- a review package that can be discussed and revised before loading;
- website verification after explicit approval and commit.

The trigger phrase **Audio Platform Draft Pipeline** starts a review-only draft. It must not write to Supabase, Storage, GitHub repository content or the public website. The separate commit step is performed only after the user explicitly approves the draft and requests the approved pipeline/load operation.

Draft data is experimental and may be replaced, revised or removed during testing. A record marked `published` may exist for current website/sample-data testing; that does not mean the wider platform or the creative work has received final public approval. Do not add `is_test_content` or `pipeline_environment` unless a separate schema decision is approved.

This runbook does not define the Review, Published or Audio pipelines. Those remain future workflows. Draft Workspace review is part of Draft creation; it is not the same as publishing approval.

## 2. The mandatory execution order

Do not start image generation, image upload or database loading until the earlier creative stages are complete.

### Default command behaviour

- **No range supplied:** prepare the complete initial Draft Workspace: Episodes 1–10 as the first production batch, the full 100-episode roadmap in ten-episode blocks, the Wiki/story bible, cover, banner and initial artwork for Episodes 1–10.
- **A range supplied:** process only that range unless the command explicitly requests the roadmap, Wiki, artwork or another additional deliverable.
- **Episodes 1–20:** default to full-script production when requested as a production range; they may remain roadmap maps when the selected mode is `roadmap`.
- **Episodes 21–49:** default to roadmap/block material unless the user explicitly requests full scripts.
- **Episodes 50–100:** default to full-script production when the user requests that range, because a range this far into development normally represents an established production batch. Use roadmap material only when `mode: roadmap` is explicitly selected.
- **Mode:** `full scripts`, `roadmap`, `artwork`, `wiki`, or `publish`. If omitted, infer the least surprising mode from the requested range and existing material, and state the inference before proceeding.
- **Profile/audience:** word-count profiles and audience settings are advisory inputs for pacing and review, not automatic failure conditions. A kids episode may be substantially shorter than a general-audience episode.

1. **Brief and concept**
   - Confirm title, slug, category and audience.
   - Define the hook, premise, central character, story promise and major question.
   - Define or confirm the intended season architecture as ten broad arcs or episode blocks.
   - If no range was supplied, prepare the complete planned 100-episode roadmap. If a range was supplied, preserve the wider roadmap only when it is already available or explicitly requested.
   - Each block must have a spoiler-light title and description suitable for display above its planned episodes.
   - The architecture describes what is planned without revealing major deaths, betrayals, discoveries, philosophical conclusions or later outcomes.
   - Complete prose is required only for the requested range when the selected mode is `full scripts`; roadmap material does not require full prose.

2. **Episode architecture and blocks**
   - Show the complete planned season structure before the full prose begins.
   - For each requested ten-episode block, record the episode range, thematic section title, spoiler-light description and the planned episode titles or short descriptions where available.
   - Roadmap mode requires structured summaries/maps. Full-script mode requires complete episode prose for the requested range.
   - A block is a planning/presentation layer. It must not be inserted into the ordinary numeric episode field as `21–30` or another non-numeric value.
   - Preserve the existing episode identity contract: `(story_id, season_number, episode_number)`.
   - If a block is later condensed into one listening episode, retain the block plan separately and use a normal numeric episode record for the condensed listening unit. Do not silently create ten published identities from one condensed script.

3. **Requested episode range**
   - In `full scripts` mode, write complete episodes for every requested episode number.
   - In `roadmap` mode, prepare structured episode maps or ten-episode block summaries; do not represent them as completed scripts.
   - Each full-script episode needs a number, title, summary and narrative prose, with character-led pacing, distinct emotional movement and a meaningful consequence or changed objective.
   - Calculate and report word count for review only. Word count is advisory and must never block the Draft Pipeline, review preparation or a SQL transaction. The Review and Published pipelines assess whether the episode is appropriate for its audience, format and dramatic purpose.

4. **Wiki and story bible**
   - Build the private wiki from the concept and the requested episode range, plus any explicitly requested wider roadmap.
   - Record only facts supported by the story or clearly labelled planned canon.
   - Include the protagonist, recurring characters, relationships, setting, important objects, timeline, rules and unresolved questions.
   - A wiki is optional for a minimal exploratory draft, but it is required for this complete Draft Pipeline test because it supports continuity and artwork.

5. **Character and visual continuity**
   - Define recurring characters' identity, age range, face/hair, build, clothing, accessories, emotional baseline and non-changing visual constraints.
   - Identify changes that are intentionally allowed across the requested full-script range.
   - Do not invent artwork details that contradict the story or wiki.

6. **Episode visual briefs**
   - Create one brief for the cover, banner and each requested episode image when artwork is in scope.
   - For every episode specify: visual event, setting, subject/action, emotion, focal object, composition, lighting/palette and continuity notes.
   - Dream, memory, supernatural or altered-state imagery must be identified explicitly when it is part of the episode's meaning.
   - Select one clear event per image. Do not combine unrelated scenes.

7. **Draft artwork**
   - Generate the cover, banner and episode artwork included in the request.
   - For the no-range default, this is one cover, one banner and initial low-resolution artwork for Episodes 1–10.
   - Artwork for later episodes is on demand unless the requested range explicitly includes artwork and the relevant scripts/material are ready.
   - Use the character continuity record, Wiki/story bible and episode visual briefs.
   - The images are deliberately replaceable and are for testing the complete website pipeline.
   - Do not embed titles, episode numbers, logos, watermarks, borders, UI or generated text.
   - The image set must show character consistency, emotional variety and the important visual states of the requested artwork range.

8. **Prepare the load**
   - Confirm the slug, category, story status, episode range, image filenames and relative storage paths.
   - Prepare idempotent story, episode, wiki and category data.
   - Use current database column names and the season-aware episode key:
     `(story_id, season_number, episode_number)`.
   - Preserve existing audio, duration, audit fields and approved assets unless the request explicitly authorises replacement.

9. **Explicit approval, load and link**
   - Do not perform this stage during the initial Draft Pipeline trigger.
   - Wait for explicit user approval of the Draft Workspace.
   - Load the approved story and the requested episode range using the approved SQL/draft loader.
   - Load wiki content where included.
   - Assign the story through the database-driven `genres → story_genres → stories` relationship.
   - Upload/link cover, banner and episode artwork only after the corresponding creative records exist.
   - Use relative Supabase Storage paths, never signed URLs, in database fields.

10. **Verify after commit**
   - Verify one story row and exactly the intended episode rows for the requested range.
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

The standard no-range quick-draft set is **one cover + one banner + ten episode images for the first production batch (Episodes 1–10)**. Artwork for later episodes is **on demand** unless the command explicitly requests it for a selected range.

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

## 5. Draft Workspace review boundary

The initial Draft Pipeline response must present the complete draft for discussion in one seamless workspace. It should include the story concept, private story bible, planned season/episode blocks, Episodes 1–10, production cards, continuity checks, artwork concepts and draft SQL/data mapping. The user should not need to restate these components.

At this stage, mark the package **Review pending** and do not claim that the database, Storage, GitHub content or website has been updated.

After discussion, the user may request revisions. The pipeline must regenerate or amend the affected draft components and re-run continuity checks before approval.

## 6. Required completion report

A Draft Pipeline run is complete only when the report includes:

| Area | Result |
|---|---|
| Concept and season direction | Complete / blocked |
| Requested episode range | Complete / blocked |
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

The review-only Draft Pipeline package is complete when the requested creative and validation outputs are prepared. A committed/public pipeline is complete only when the database, Storage and website verification has also been completed.

## 7. Reusable instruction

Use this instruction when starting a new draft:

> **Audio Platform Draft Pipeline**
>
> Create the complete review-only Draft Workspace for “[TITLE]” in the “[CATEGORY]” category. Follow the authoritative runbook in `documentation/pipelines/audio-platform-draft-pipeline.md`.
>
> Work in this order: concept and season architecture; spoiler-light episode blocks; Episodes 1–10; wiki/story bible; character and visual continuity; episode production cards and continuity checks; visual briefs; one cover, one banner and low-resolution draft images for Episodes 1–10; draft SQL/data mapping. Do not create later episode artwork until the relevant block is approved and artwork is requested on demand.
>
> Do not upload files or load the database during this review-only step. Images may be generated as draft concepts/placeholders, but external upload and database commit require explicit approval. Use status `draft`. Word count is informational only. Do not use Review or Published approval rules. Report completion at each stage and stop at the first failed stage.

## 8. Supporting specifications

- Story creation: `documentation/specifications/story-creation-specification.md`
- Wiki and SQL insert: `documentation/specifications/wiki-sql-insert-specification.md`
- Story SQL insert: `documentation/specifications/story-sql-insert-specification.md`
- Episode artwork: `documentation/specifications/episode-artwork-production-specification.md`
- Image upload automation: `database/IMAGE-UPLOAD-AUTOMATION.md`

These documents provide detail. This runbook controls the end-to-end Draft sequence.
