# Story Knowledge Loading Specification

**Status:** Current project standard

## 1. Purpose

This specification governs idempotent loading of reusable story knowledge. Wiki and Private Canon use separate loading procedures: the Wiki is reader-facing, while Private Canon is an independent Studio-only source of truth.

## 2. Dependency order

Story knowledge follows story loading. Every referenced story row must exist. Full-episode links must resolve to individual episode rows. Studio/review knowledge may reference an existing roadmap-block row and identify a planned episode inside its structured block data.

Recommended load order:

1. `story_wiki_settings`
2. `wiki_entries`
3. `wiki_entry_sections`
4. `wiki_entry_internal`
5. `wiki_character_profiles`
6. `wiki_entry_relationships`
7. `episode_wiki_entries`
8. `character_knowledge`
9. `wiki_entry_visual_profiles`

Private Canon is not part of this Wiki load order. Load it independently under `private-canon-loading-specification.md` using `story_canon_rules` and the stable `(story_id, canon_key)` identity.

## 3. Stable identities

- wiki entry: `(story_id, slug)`
- section: `(wiki_entry_id, section_key)`
- relationship: `(source_entry_id, target_entry_id, relationship_type)`
- full-episode appearance: `(episode_id, wiki_entry_id)`
- roadmap-block appearance: `(roadmap_block_episode_id, wiki_entry_id, planned_episode_number)`
- character and visual profile: parent `wiki_entry_id`
- Private Canon: `(story_id, canon_key)` under its independent loading procedure

Titles and descriptions may change without creating a new entity.

## 4. Public and private separation

Public fields contain only reader-safe wording. Wiki internal tables may contain:

- AI context,
- continuity rules,
- future-arc notes,
- private motivations and fears,
- generation instructions,
- unrevealed causes and outcomes.

A reveal gate does not make private author material public. Private plans remain in internal tables.

## 5. Database-driven categories

Wiki and Private Canon category selectors are derived from current database records rather than hard-coded page lists. New records display automatically. New recognised categories must be defined in the appropriate category source and then appear without a website code change.

Blank, inactive, misspelled or otherwise unrecognised category values must never cause a record to disappear. They are grouped under **Other** in Studio so the data remains reviewable and can be corrected at source.

The website browser starts with every category closed, opens one category at a time and recalculates category counts and search results from the returned records.

## 6. Production use

The knowledge loader identifies reusable entities once. Artwork and audio processes then retrieve only entries linked to the current episode.

A visual profile is added only when recurring visual consistency, an approved reference or substantial repeated prompting makes it useful.

## 7. Episode links

Every `episode_wiki_entries` row must resolve an episode and wiki entry from the same story. Links identify the default retrieval boundary for production bundles.

## 8. Idempotency

- Use upserts against stable keys.
- Do not delete all wiki records before reloading.
- Absence from a new seed is not retirement.
- Archive or unpublish obsolete content explicitly.
- Never seed listener progress.
- Keep schema migrations separate from content seeds.

## 9. Spoiler control

Published Wiki episode references must resolve to published, reader-safe individual episode IDs. Studio Wiki and private Story Bible references may resolve to a roadmap-block ID plus a planned episode number inside its structured data. Public APIs and RLS enforce visibility; browser hiding alone is insufficient.

## 10. Verification

Verify:

- one story scope,
- no duplicate slugs or section keys,
- valid parent and relationship links,
- same-story episode references,
- correct public/private classification,
- recognised categories display using their database label,
- blank and unrecognised categories display under **Other** in Studio,
- stable rerun counts,
- no listener-progress mutation.

## 11. Definition of done

A story knowledge load is complete when it can be safely rerun, preserves spoiler boundaries, resolves all stable entities and episode links, retains uncategorised records under **Other**, and provides compact reusable context for future writing and production.

## 12. Private Canon boundary

Private Canon may be developed and synced without changing Wiki, episodes or roadmap. A Wiki refresh may later read confirmed Private Canon plus story content and prepare Draft Wiki changes. Neither operation silently writes to the other object.

See: `documentation/specifications/private-canon-loading-specification.md`.
