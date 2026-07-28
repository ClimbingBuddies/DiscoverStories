# Story Knowledge Loading Specification

**Status:** Current project standard

## 1. Purpose

This specification governs idempotent loading of reusable story knowledge. The same stable entities support public wiki pages, private continuity work and production retrieval.

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
8. `story_canon_rules`
9. `story_canon_rule_internal`
10. `character_knowledge`
11. `wiki_entry_visual_profiles`

## 3. Stable identities

- wiki entry: `(story_id, slug)`
- section: `(wiki_entry_id, section_key)`
- relationship: `(source_entry_id, target_entry_id, relationship_type)`
- full-episode appearance: `(episode_id, wiki_entry_id)`
- roadmap-block appearance: `(roadmap_block_episode_id, wiki_entry_id, planned_episode_number)`
- character and visual profile: parent `wiki_entry_id`

Titles and descriptions may change without creating a new entity.

## 4. Public and private separation

Public fields contain only reader-safe wording. Internal tables contain:

- AI context,
- continuity rules,
- future-arc notes,
- private motivations and fears,
- generation instructions,
- unrevealed causes and outcomes.

A reveal gate does not make private author material public. Private plans remain in internal tables.

## 5. Production use

The knowledge loader identifies reusable entities once. Artwork and audio processes then retrieve only entries linked to the current episode.

A visual profile is added only when recurring visual consistency, an approved reference or substantial repeated prompting makes it useful.

## 6. Episode links

Every `episode_wiki_entries` row must resolve an episode and wiki entry from the same story. Links identify the default retrieval boundary for production bundles.

## 7. Idempotency

- Use upserts against stable keys.
- Do not delete all wiki records before reloading.
- Absence from a new seed is not retirement.
- Archive or unpublish obsolete content explicitly.
- Never seed listener progress.
- Keep schema migrations separate from content seeds.

## 8. Spoiler control

Published Wiki episode references must resolve to published, reader-safe individual episode IDs. Studio Wiki and private Story Bible references may resolve to a roadmap-block ID plus a planned episode number inside its structured data. Public APIs and RLS enforce visibility; browser hiding alone is insufficient.

## 9. Verification

Verify:

- one story scope,
- no duplicate slugs or section keys,
- valid parent and relationship links,
- same-story episode references,
- correct public/private classification,
- stable rerun counts,
- no listener-progress mutation.

## 10. Definition of done

A story knowledge load is complete when it can be safely rerun, preserves spoiler boundaries, resolves all stable entities and episode links, and provides compact reusable context for future writing and production.