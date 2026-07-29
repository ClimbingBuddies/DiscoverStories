# Audio Platform Creative Development Process

**Status:** Current project standard  
**Scope:** Repeatable development, diagnosis, revision and draft synchronisation  
**Owner:** Audio Platform  
**Last updated:** 29 Jul 2026

This process improves an existing Audio Platform story after its Initial Draft. It is deliberately repeatable and may be applied to the whole story or to one specific element.

## 1. Entry command

Use the project-specific command:

> **Audio Platform Begin Creative Development**

The command may nominate:

- the whole current draft;
- one character, relationship, mystery or theme;
- one episode or episode range;
- one roadmap block;
- the Story Bible, Wiki, continuity or reveal plan;
- artwork or visual direction;
- one or more SQI findings.

If the current story and scope are already clear from context, do not ask the user to repeat them. If only the process command is supplied, ask whether to develop the whole draft, a specific section or the current SQI findings.

## 2. Purpose

Creative Development answers:

> What should be explored, assessed or changed before this story is submitted to formal Review?

The process does not require a fixed linear sequence. Operations may be repeated in any useful order.

## 3. Creative Development operations

### 3.1 Explore and Discuss

Use this operation to consider alternatives without committing them.

Examples include:

- alternative character motivations or relationships;
- different episode structures or roadmap directions;
- mystery, reveal, tone, pacing or ending options;
- alternate artwork concepts;
- whether an existing idea should be retained, reworked, deferred or removed.

**Default effect:** no source material change and no Supabase update.

### 3.2 SQI Diagnostic

Apply the Story Quality Index to the nominated scope or the whole current draft.

A Creative Development SQI is diagnostic. It may:

- score all applicable SQI categories;
- identify strengths, weaknesses and critical risks;
- compare movement against an earlier diagnostic;
- recommend development actions.

It does not approve progression and is not the formal Review Pipeline SQI.

**Default effect:** no creative change and no Supabase update unless the user explicitly asks to store the assessment.

### 3.3 Apply Agreed Revisions

Use this operation only after the user has accepted a direction or explicitly instructed that changes be applied.

Update every affected source of truth, which may include:

- story brief;
- private Story Bible;
- episode maps or full scripts;
- roadmap blocks;
- continuity, canon, reveal and character-knowledge records;
- artwork briefs and character visual records;
- Studio Wiki content;
- draft SQL/data mapping.

Do not change unrelated material merely because it was discussed. Identify downstream consequences before applying them.

**Default effect:** working draft changes; no Supabase update.

### 3.4 Supabase Draft Sync

Use the explicit command:

> **Audio Platform Supabase Draft Sync**

This operation inserts or updates the currently agreed working revision as `draft` and then verifies it.

The sync must:

- use idempotent story, episode, roadmap and Wiki loaders;
- preserve audio URLs, durations, publication metadata and audit fields unless separately authorised;
- use current story and episode identities;
- update only agreed creative fields and supplied asset paths;
- verify counts, ranges, links, statuses, artwork paths and rerun safety;
- report the first failed step and not claim completion when verification fails.

A Draft Sync records progress. It does not end Creative Development and does not submit the story to Review.

## 4. Operating rule

> **Explore freely. Revise deliberately. Sync explicitly.**

Interpret ordinary language as follows:

| User wording | Default operation |
|---|---|
| discuss, explore, consider, compare | Explore and Discuss |
| assess, run SQI, score, diagnose | SQI Diagnostic |
| apply, revise, update the story | Apply Agreed Revisions |
| sync, upload, insert, update Supabase | Supabase Draft Sync |
| submit to Review | Sync/verify candidate and hand off to Review |

Discussion, assessment and revision must never silently write to Supabase.

## 5. Scope rules

Creative Development may cover the whole draft or a targeted scope.

For a targeted change:

1. assess only the nominated area first;
2. identify consequences for other material;
3. apply only agreed consequential changes;
4. rerun continuity or SQI checks proportionate to the impact.

For a whole-draft development run, assess the premise, Story Bible, Episodes 1–10, Episodes 11–100 roadmap, continuity, reveal structure, visual direction and applicable SQI categories.

## 6. Post-sync routing

After a successful Supabase Draft Sync, ask:

> The current draft has been synced and verified. Would you like to continue **Audio Platform Creative Development** or **Audio Platform Submit to Review Pipeline**?

Do not ask this when the user's instruction already specifies the next step.

## 7. Submit to Review command

Use:

> **Audio Platform Submit to Review Pipeline**

This command authorises the following sequence:

1. identify the currently agreed working revision;
2. perform a Supabase Draft Sync when changes are unsynced;
3. otherwise verify that Supabase matches the current revision;
4. verify the story, episodes, roadmap blocks, Wiki/continuity data and in-scope artwork links;
5. identify that exact synced revision as the Review Candidate;
6. begin the Audio Platform Review Pipeline.

If sync or verification fails, do not begin Review.

Exploratory ideas that were discussed but never accepted must not enter the Review Candidate.

## 8. Completion report

Every Creative Development run should report:

| Area | Required result |
|---|---|
| Story and scope | Identified |
| Operation performed | Explore / SQI / Revision / Sync / Submit |
| Accepted changes | Listed or none |
| Consequential updates | Listed or none |
| SQI result | Recorded when run |
| Working draft changed | Yes / No |
| Supabase changed | Yes / No |
| Verification | Passed / failed / not applicable |
| Next route | Continue development / Submit to Review / Pause |

## 9. Reusable instructions

### Whole or targeted development

> **Audio Platform Begin Creative Development**
>
> Develop “[TITLE]” using the current working draft. Work on [WHOLE DRAFT OR SPECIFIC SCOPE]. Explore ideas without committing them, run a diagnostic SQI when useful, apply only agreed revisions and do not update Supabase unless explicitly instructed.

### Draft sync

> **Audio Platform Supabase Draft Sync**
>
> Sync the currently agreed revision for “[TITLE]” to Supabase as `draft`. Use the approved idempotent loaders, preserve unrelated production fields, verify all in-scope records and links, and report the first failed stage. Do not publish.

### Submit to Review

> **Audio Platform Submit to Review Pipeline**
>
> Sync any agreed unsynced changes for “[TITLE]” to Supabase as `draft`, verify that Supabase represents the exact current revision, nominate that synced revision as the Review Candidate and begin the Audio Platform Review Pipeline. Do not begin Review if sync or verification fails. Do not publish.

## 10. Supporting specifications

- Draft router: `documentation/pipelines/audio-platform-draft-pipeline.md`
- Initial Draft: `documentation/pipelines/audio-platform-initial-draft-process.md`
- Review Pipeline: `documentation/pipelines/audio-platform-review-pipeline.md`
- Story creation: `documentation/specifications/story-creation-specification.md`
- Story SQL insert: `documentation/specifications/story-sql-insert-specification.md`
- Wiki SQL insert: `documentation/specifications/wiki-sql-insert-specification.md`
- Story Quality Index: `documentation/specifications/story-quality-index.md`
