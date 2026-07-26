# Production Knowledge Model

**Status:** Current architecture

## 1. Objective

The production knowledge model lets artwork, audio and website processes reuse story facts without repeatedly reading every episode or the complete wiki.

The model extends the existing wiki rather than creating duplicate character, location and object systems.

## 2. Knowledge layers

### Canonical narrative

- `stories`
- `episodes`

These records answer what the story and episode actually say.

### Reusable story knowledge

- `wiki_entries`
- `wiki_entry_sections`
- `wiki_entry_internal`
- `wiki_character_profiles`
- `wiki_entry_relationships`
- `story_canon_rules`
- `character_knowledge`

A wiki entry is the stable identity for a character, location, object, faction, event or concept.

### Production metadata

- `story_production_profiles`
- `wiki_entry_visual_profiles`
- `episode_art_direction`
- `episode_art_direction_entries`

Production metadata describes how canonical knowledge should be represented. It must not silently redefine story facts.

### Cached task context

- `production_bundles`

Bundles contain a task-ready snapshot assembled from canonical and production records. They are disposable and rebuildable.

### Assets and run history

- `media_assets`
- `audio_generation_runs`

These tables preserve outputs, experiments, approvals and versions.

## 3. Reuse pattern

An episode links to relevant entities through `episode_wiki_entries`. Production processes use those links as the default retrieval boundary.

Example artwork context:

1. Read Episode 7.
2. Resolve its linked wiki entries.
3. Retrieve visual profiles for only those entries.
4. Retrieve relevant story-level production direction and canon.
5. Create or reuse an artwork production bundle.
6. Create the episode art-direction record.

The pipeline must not load unrelated factions, future locations or every character merely because they belong to the same story.

## 4. Visual profiles

`wiki_entry_visual_profiles` applies to any wiki entry type.

A character may use:

- visual summary,
- distinguishing features,
- clothing,
- fixed continuity,
- permitted evolution,
- approved portrait reference.

A location may use:

- visual summary,
- materials,
- palette,
- atmosphere,
- scale and architecture,
- approved environment reference.

An object or motif may use the same structure without requiring another table.

## 5. Source precedence

When records disagree, use this order:

1. Current approved episode script and story bible facts.
2. Active canon rules and character knowledge state.
3. Private wiki context and character profile.
4. Production visual profile.
5. Cached production bundle.
6. Previous generated asset or prompt.

A bundle or old image can never override current canon.

## 6. Change and invalidation

A bundle becomes stale when any of these changes:

- episode script,
- episode-linked wiki entries,
- relevant internal wiki context,
- relevant visual profile,
- story production profile,
- relevant canon rule,
- current art direction.

A source hash should be calculated from the normalized source values. The cache is reusable only while its stored hash matches.

## 7. Public/private boundary

The website may expose approved public wiki content and approved media assets. It must not expose:

- `wiki_entry_internal`,
- private character generation notes,
- production bundles,
- art-direction evidence and internal review notes,
- provider cost experiments,
- future canon and unrevealed knowledge.

RLS protects the production layer even when the public story and wiki are readable.

## 8. Minimal metadata rule

Do not create a visual profile merely because a wiki entry exists. Add one when:

- the entry recurs visually,
- continuity matters,
- it has an approved reference image,
- or repeated prompting would otherwise require substantial re-analysis.

This keeps the system small and economical while allowing detail where it provides real production value.
