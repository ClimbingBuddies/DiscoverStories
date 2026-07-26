# Story Production Pipeline

**Status:** Current architecture  
**Project:** Discover Stories

## 1. Purpose

This document defines the single current architecture for creating, reviewing and producing Discover Stories content. It replaces prototype-era architectural descriptions. Git history preserves retired approaches; the repository should not maintain parallel live versions.

The story is the primary creative asset. Artwork, audio, wiki pages and website presentation are outputs produced from approved story knowledge.

## 2. Source-of-truth model

| Information | Authoritative home |
|---|---|
| Story identity and public metadata | `public.stories` |
| Episode prose and summaries | `public.episodes` |
| Characters, locations, objects, factions, events and concepts | `public.wiki_entries` |
| Public lore | `public.wiki_entry_sections` |
| Private creative and AI context | `public.wiki_entry_internal` |
| Character continuity and appearance | `public.wiki_character_profiles` plus `public.wiki_entry_visual_profiles` |
| Relationships | `public.wiki_entry_relationships` |
| Canon and reveal rules | `public.story_canon_rules` and `public.character_knowledge` |
| Story-level production direction | `public.story_production_profiles` |
| Episode artwork decisions | `public.episode_art_direction` |
| Cached task-ready context | `public.production_bundles` |
| Produced and intermediate files | `public.media_assets` |
| Production standards and operating procedures | GitHub documentation |

## 3. Design principles

1. **One authoritative home.** Do not copy the same fact into several live documents or tables.
2. **Reuse before regeneration.** Characters, locations, objects and visual motifs are modelled once and referenced by episodes.
3. **The wiki is also the production knowledge base.** Public wiki presentation and private production context use the same stable entities but remain separated by fields, tables and RLS.
4. **The full wiki is not loaded for every task.** Episode links and production bundles retrieve only relevant knowledge.
5. **Writing precedes production.** Artwork may be explored during development; final audio is generated only after the narrative is approved.
6. **Recommendations are not database constraints.** Creative guidance such as word-count ranges is reported, not enforced by SQL.
7. **Published stories may have no episodes.** This is a supported state used for catalogue, layout and empty-state testing.
8. **One narrator is the default, not a permanent limitation.** The platform retains provider and multi-voice experimentation while keeping the normal workflow economical.

## 4. Pipeline stages

### Stage A — Story development

- Approve the story brief.
- Build the private story bible.
- Plan the 100-episode roadmap.
- Draft and review episodes in ten-episode batches.
- Store final prose in `episodes.script_text`.

### Stage B — Story knowledge

- Upsert reusable wiki entries for characters, locations, objects and concepts.
- Store public wording separately from private AI and continuity context.
- Link each episode to the entries it actually uses through `episode_wiki_entries`.
- Store canon and character knowledge with reveal-aware episode references.

### Stage C — Production preparation

- Create one `story_production_profiles` row per active story.
- Add `wiki_entry_visual_profiles` only for entries requiring stable visual direction.
- Build task-specific `production_bundles` from source records.
- Mark a bundle stale when any referenced source changes.

### Stage D — Artwork

- Read the full current episode script.
- Retrieve only linked characters, locations, objects, motifs and relevant canon.
- Record the chosen scene, textual evidence and creative direction in `episode_art_direction`.
- Produce concept artwork first.
- Refine only approved concepts.
- Register concepts, references and final images in `media_assets`.
- Point `episodes.artwork_path` only to the currently approved final image.

### Stage E — Audio

- Audio remains optional while a story is being revised.
- The default production mode is one narrator per story.
- Alternative providers and voices may be tested through `audio_generation_runs`.
- Every run records the source script hash so outdated audio is visible.
- Accepted audio is registered in `media_assets`; `episodes.audio_url` remains the website's current pointer.

### Stage F — Release

- `content_status` controls public visibility.
- Production readiness and release lifecycle are separate from visibility.
- A story may be publicly visible with no episodes.
- The website consumes approved pointers and public wiki APIs, not internal production tables.

## 5. Efficient retrieval and bundles

A production bundle is a cache, not a second source of truth.

An episode artwork bundle typically contains:

- the story production profile,
- the episode title, summary and script,
- linked visual profiles,
- relevant canon,
- the approved or current art-direction record.

Each bundle stores a `source_hash`. When the source hash still matches, the bundle is reused. When an episode, profile or linked wiki entry changes, the old bundle becomes stale and a new one is generated.

This reduces repeated analysis while preserving traceability.

## 6. Asset lifecycle

`media_assets` stores the history of production files. Direct columns on `stories` and `episodes` remain convenient pointers to the current approved public asset.

Typical artwork lifecycle:

`draft → concept → refined → approved → superseded/archived`

Typical audio lifecycle:

`generation run → completed → accepted/rejected → approved media asset`

Never overwrite an approved historical asset merely to reuse its filename. Create a new version, approve it, and then update the current pointer.

## 7. Change rules

- Schema changes use reviewed migrations.
- Story and wiki content loaders remain idempotent.
- No loader deletes absent content automatically.
- Audio fields are preserved when story prose is reloaded.
- Word counts are calculated and displayed, not used as SQL acceptance thresholds.
- Old architecture documents are removed or rewritten rather than retained as competing live standards.

## 8. Reference implementation

*The Cartographer's Dream* is the reference story for the initial production pipeline. Its first ten episodes will be used to test:

- linked knowledge retrieval,
- visual-profile consistency,
- evidence-based scene selection,
- concept/refine/production artwork stages,
- production bundle reuse,
- single-narrator provider experiments.
