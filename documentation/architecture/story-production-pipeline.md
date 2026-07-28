# Draft Story Pipeline

**Status:** Current architecture  
**Project:** Discover Stories

## 1. Purpose

This document defines the single current architecture for taking a story from concept to a technically complete Draft.

The pipeline finishes at Draft. Human review and publication are separate editorial workflow stages.

## 2. Current pipeline definition

```text
Story
  ↓
Episodes 1–10
  ↓
Wiki
  ↓
Cover + Banner + Episode Artwork
  ↓
Artwork Upload
  ↓
Artwork Linking
  ↓
Verification
  ↓
Draft
```

A Draft Story Pipeline is complete only when the story, ten episodes, wiki, cover, banner and ten episode images are present, uploaded, linked and verified.

## 3. Source-of-truth model

| Information | Authoritative home |
|---|---|
| Story identity and public metadata | `public.stories` |
| Episode prose and summaries | `public.episodes` |
| Characters, locations, objects, factions, events and concepts | `public.wiki_entries` |
| Public lore | `public.wiki_entry_sections` |
| Private creative and AI context | `public.wiki_entry_internal` |
| Character continuity and appearance | `public.wiki_character_profiles` and `public.wiki_entry_visual_profiles` |
| Relationships | `public.wiki_entry_relationships` |
| Canon and reveal rules | `public.story_canon_rules` and `public.character_knowledge` |
| Story-level visual and generation direction | `public.story_production_profiles` |
| Episode artwork decisions | `public.episode_art_direction` |
| Cached task-ready context | `public.production_bundles` |
| Produced and intermediate files | `public.media_assets` |
| Story Quality assessments | `public.story_quality_assessments` |
| Standards and operating procedures | GitHub documentation |

## 4. Design principles

1. **One authoritative home.** Do not copy the same fact into several live tables or documents.
2. **Pipeline completion and quality are separate.** First prove that a complete Draft can be created. Then test it against the specifications.
3. **The full product model is not loaded for every task.** Each task receives one compact bundle and one primary specification.
4. **Reuse before regeneration.** Stable characters, locations, objects and motifs are modelled once and referenced.
5. **Quality without document sprawl.** The project maintains six live specification areas and one compact assessment table.
6. **JSON before table proliferation.** Detailed quality categories remain in `assessment_json` until relational analysis is demonstrably necessary.
7. **Recommendations are not database constraints.** Creative ranges and scores guide review; SQL enforces identity, safety and completeness.
8. **Draft artwork may be linked.** During pipeline testing, story and episode pointers may reference the current draft or concept asset. Approval is a later workflow decision.

## 5. Six live specification areas

| Area | Responsibility |
|---|---|
| Draft Story Pipeline | End-to-end creation and technical completion. |
| Story Creation | Brief, bible, roadmap and episode prose. |
| Story Quality | SQI assessment after a ten-episode draft completes. |
| Wiki Creation and Loading | Continuity knowledge, spoiler handling and safe loading. |
| Artwork Creation | Cover, banner and episode imagery. |
| Database Loading and Verification | Safe insertion, upload, linking and completion proof. |

Implementation references may sit beneath these areas, but an AI task should not read every document.

## 6. Pipeline stages

### Stage A — Story and episodes

- Approve or accept the source brief for the current test.
- Build the private story bible and 100-episode roadmap.
- Draft Episodes 1–10 as one coherent opening batch.
- Store story and episode records as `draft`.

### Stage B — Wiki

- Create reusable entries for the characters, locations, objects and concepts needed by Episodes 1–10.
- Separate public wording from private continuity context.
- Link episodes to the entries they actually use.

### Stage C — Artwork

- Create one story cover, one story banner and ten episode images.
- Use concept resolution for pipeline and scene-selection testing.
- Refine only selected concepts when quality review begins.
- Register all generated and uploaded assets in `media_assets`.

### Stage D — Upload and linking

- Upload all twelve expected artwork assets to Storage.
- Link story cover and banner paths.
- Link one current artwork path to each of Episodes 1–10.
- Preserve the story and episode statuses as `draft`.

### Stage E — Verification

- Verify one draft story.
- Verify exactly ten draft episodes numbered 1–10.
- Verify wiki content exists.
- Verify twelve Storage objects.
- Verify twelve linked paths.
- Verify twelve `media_assets` records.

Only then report `Pipeline Complete = Yes`.

### Stage F — Quality review

Quality review begins after technical completion.

- Run one Story Quality assessment for Episodes 1–10.
- Review artwork against scene, continuity and technical standards.
- Revise only the items that fail or offer material improvement.
- Store the compact SQI result in `story_quality_assessments`.

Quality review does not create a new story status. The story remains `draft` until an explicit editorial decision changes it.

## 7. Task bundles

`production_bundles` is a cache, not another source of truth.

Each task receives one bundle type such as:

- `story-writing-batch`,
- `wiki-batch`,
- `episode-artwork`,
- `story-artwork`,
- `story-quality-batch`,
- `pipeline-verification`.

The bundle includes only direct dependencies. A matching `source_hash` allows reuse; changed source data makes the prior bundle stale.

See `documentation/architecture/task-bundle-contract.md`.

## 8. Quality architecture

The Story Quality Index is assessed once per ten-episode batch using a weighted rubric out of 100.

The score is an internal editorial signal, not proof that a story equals a great author. Credible calibration requires human editorial judgement and reader behaviour.

One record stores:

- batch identity,
- rubric version,
- overall score,
- detailed JSON category evidence,
- strengths,
- no more than five priority improvements.

No criterion-specific tables are required at this stage.

## 9. Change rules

- Schema changes use reviewed migrations.
- Story and wiki loaders remain idempotent.
- No loader deletes absent content automatically.
- Audio fields are preserved when story prose is reloaded.
- Old architecture documents are removed or rewritten rather than retained as competing live standards.
- A new specification or relational table requires evidence that the current compact structure is inadequate.

## 10. Definition of done

The architecture is implemented when:

- the Draft Story Pipeline can complete from start to finish,
- completion is verified independently of quality,
- each AI stage can operate from one compact task bundle,
- Story Quality is assessed once per ten-episode batch,
- detailed scores are stored in one private assessment table,
- no task needs to load the entire database or every specification document.
