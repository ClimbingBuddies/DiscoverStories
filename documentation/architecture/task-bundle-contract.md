# AI Task Bundle Contract

**Status:** Current architecture  
**Purpose:** Give each AI task only the information required for that decision.

## 1. Core rule

The AI must not load every specification, table or wiki record for every task. Each stage receives one compact task bundle assembled from authoritative source records.

A bundle is a cache, not a source of truth. `public.production_bundles` stores the assembled JSON and a `source_hash`. When a referenced source changes, the prior bundle becomes stale and a new bundle is generated.

## 2. Specification routing

The project maintains six live specification areas:

| Area | Primary purpose |
|---|---|
| Draft Story Pipeline | Defines the complete path to a technically complete draft. |
| Story Creation | Controls brief, bible, roadmap and episode prose. |
| Story Quality | Evaluates a completed ten-episode batch. |
| Wiki Creation and Loading | Controls continuity knowledge, public/private separation and spoiler links. |
| Artwork Creation | Controls cover, banner and episode artwork. |
| Database Loading and Verification | Controls safe inserts, linking and proof that the draft pipeline is complete. |

Implementation references may exist beneath these areas, but a task should read only its primary specification plus explicitly required dependencies.

## 3. Bundle types

### `story-writing-batch`

Use for drafting or revising Episodes 1–10.

Include:

- story brief,
- relevant private story-bible sections,
- 100-episode roadmap summary,
- ten episode cards,
- current batch prose when revising,
- relevant continuity and knowledge state,
- Story Creation rules.

Exclude:

- artwork upload procedures,
- storage records,
- unrelated wiki presentation text,
- SQL implementation details,
- audio settings.

### `wiki-batch`

Use to create or update wiki content for an available episode batch.

Include:

- story identity,
- episode titles, summaries and prose for the batch,
- private story-bible entities used in the batch,
- reveal and character-knowledge state,
- existing matching wiki entries and stable slugs,
- Wiki Creation and Loading rules.

Exclude:

- artwork pixels,
- unrelated future episode links,
- listener progress,
- website layout.

### `episode-artwork`

Use for one episode image.

Include:

- story identity and visual style,
- episode title and summary,
- selected scene and supporting script excerpt,
- only characters, locations, objects and motifs appearing in that scene,
- character visual profiles,
- current art-direction record,
- canvas, safe-area, filename and stage rules.

Exclude:

- all 100 episodes,
- the full wiki,
- unrelated characters,
- story SQL instructions,
- audio data.

### `story-artwork`

Use for cover or banner artwork.

Include:

- enduring story promise,
- protagonist and central object or setting,
- story-level visual profile,
- cover or banner composition rules,
- filename and stage rules.

Exclude episode-by-episode plot detail unless it affects the enduring identity.

### `story-quality-batch`

Use once after the Draft Story Pipeline is complete.

Include:

- story brief and promise,
- Episodes 1–10 in full,
- ten episode cards or summaries,
- relevant continuity state,
- Story Quality rubric version.

Exclude:

- image bytes,
- storage procedures,
- audio generation details,
- unrelated future-arc prose.

### `pipeline-verification`

Use to prove technical completion.

Include only:

- story status and identity,
- episode count and status,
- wiki entry count,
- cover and banner paths,
- ten episode artwork paths,
- matching Storage-object checks,
- matching media-asset checks,
- pipeline checklist rules.

Do not reread episode prose or rescore story quality.

## 4. Bundle JSON minimum

```json
{
  "bundle_version": "1.0",
  "bundle_type": "episode-artwork",
  "story_id": "uuid",
  "episode_id": "uuid-or-null",
  "source_hash": "sha256-or-equivalent",
  "specification_refs": ["episode-artwork-production-specification-v1"],
  "inputs": {},
  "constraints": {},
  "expected_output": {},
  "generated_at": "timestamp"
}
```

## 5. Retrieval rules

1. Resolve the target story and episode first.
2. Retrieve direct dependencies only.
3. Prefer episode-to-wiki links over broad wiki searches.
4. Include full prose only when the task genuinely requires it.
5. Reuse a current bundle when its `source_hash` still matches.
6. Mark prior current bundles stale before creating a replacement.
7. Do not copy source records into new permanent tables merely to simplify one prompt.
8. Do not create a new bundle type until an existing type has proven inadequate.

## 6. Cost controls

- One bundle per task or coherent batch.
- One Story Quality assessment per ten-episode batch, not per episode.
- Concept artwork first; expensive refinement only for selected failures or approved concepts.
- Return concise actionable findings rather than exhaustive commentary.
- Limit priority improvements to five.

## 7. Definition of done

The bundle architecture is working when an AI task can be executed from one compact bundle and one primary specification, unchanged source data invalidates stale bundles, and no task needs to query the entire product model to understand its immediate objective.
