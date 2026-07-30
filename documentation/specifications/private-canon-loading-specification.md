# Private Canon Creation and Data Loading Specification

**Version:** 1.1  
**Date:** 30 Jul 2026  
**Status:** Current project standard  
**Scope:** Private Canon development, review, visual knowledge and Supabase Draft sync

> **Core production rule:** Private Canon is the Studio's creative knowledge base for a story. It may be developed before, during or after story creation. It guides creative development, preserves continuity, supports production processes and later provides the source material from which a curated Public Canon may be released.

## 1. Purpose

Private Canon exists because the public or Studio Wiki is not sufficient for creative development.

The Wiki is primarily a structured reference and publication object. Private Canon is a working creative object that may contain:

- rules of engagement for the story world;
- character descriptions, traits, motives, boundaries and relationships;
- world-building rules, history, geography, factions and systems;
- mysteries, hidden truths and reveal intentions;
- writing, tone and thematic guidance;
- visual descriptions and continuity rules;
- approved or exploratory reference images;
- image-generation guidance and approved prompt components;
- production knowledge needed by Story, Artwork, Audio and Review processes;
- proposed ideas that are still being developed.

Private Canon is independent from Story, Episodes, Roadmap, Wiki and Artwork. A Canon operation may read those objects and identify impacts, but it changes only Canon unless another operation is explicitly approved.

## 2. Production model

Private Canon and Story are peer creative objects.

```text
Story Brief
     │
     ├──────────────┐
     ▼              ▼
Private Canon  ↔  Story Development
     │              │
     └──────┬───────┘
            ▼
      Review Pipeline
            │
     ┌──────┴───────┐
     ▼              ▼
Public Wiki     Public Canon
```

This is not a strictly linear process.

- Canon may come before Story and provide a framework for development.
- Story may reveal better ideas and cause Canon to be revised.
- Canon may be expanded after episodes are drafted to preserve discoveries made during writing.
- Story, Canon and Wiki may be worked on independently during development.
- Wiki should normally be developed after relevant Story and Canon material exists.
- Review is the point at which Story, Canon, Wiki and Artwork are deliberately brought into alignment.

Temporary divergence during drafting is expected. Unresolved divergence at approval or publication is not.

## 3. Relationship to other Studio objects

| Object | Relationship to Private Canon |
|---|---|
| Story brief | Defines the promised experience and initial creative boundaries. Canon may expand the world without contradicting the approved brief. |
| Story and episodes | Dramatise the audience experience. They may follow existing Canon or generate discoveries that should be added to Canon. |
| Roadmap | Proposes future development, rules and reveals. Roadmap material may remain provisional until confirmed. |
| Wiki | Curates structured knowledge for Studio or public reference. It normally follows Story and Canon and must preserve spoiler boundaries. |
| Artwork | Reads visual Canon, reference images and episode context. Artwork may suggest improvements but must not silently establish new Canon. |
| Audio | May read pronunciation, voice, atmosphere and performance guidance stored in Canon. |
| Review Pipeline | Compares the independently developed objects and records contradictions, omissions and required alignment work. |
| Public Pipeline | Selects approved, spoiler-safe Canon material for release as Public Canon. |

### 3.1 Independence rule

Use:

> **Audio Platform Private Canon Development — [STORY] — [SCOPE] — do not change Story, Episodes, Roadmap, Wiki or Artwork.**

For database loading use:

> **Audio Platform Private Canon Sync — [STORY] — [CANON SCOPE] — Supabase Draft — do not update Story, Episodes, Roadmap, Wiki or Artwork.**

A combined operation is allowed only when each object and write action is explicitly named.

## 4. Canon knowledge model

Private Canon should support multiple forms of Studio knowledge rather than only immutable rules.

| Knowledge domain | Examples |
|---|---|
| Story rules | Magic limits, technology, geography, politics, timelines, costs and exceptions |
| Characters | Appearance, age range, personality, traits, motivations, relationships, voice and behavioural boundaries |
| World building | History, factions, cultures, locations, objects, institutions and terminology |
| Narrative guidance | Themes, tone, pacing principles, recurring motifs and things to avoid |
| Mysteries and reveals | Objective truth, false assumptions, secrets, intended reveal timing and character knowledge |
| Visual Canon | Approved appearance, clothing, palettes, lighting, environments, symbols and composition guidance |
| Reference images | Approved portraits, expression studies, clothing references, location references and visual variants |
| Production guidance | Image prompts, pronunciation, audio direction and reusable task instructions |
| Development ideas | Proposed concepts that may guide exploration without yet becoming settled truth |

A Canon record should be as focused and independently reviewable as practical. Related records may be grouped through categories and entity links rather than merged into one oversized rule.

## 5. Canon states

Private Canon uses only two creative states:

| State | Meaning | Production effect |
|---|---|---|
| `proposed` | An idea, rule, description or reference still under development. | May guide exploration but must not be treated as settled truth. |
| `confirmed` | Approved Studio knowledge for the current working version. | Story, Wiki, Artwork and other production work should respect it unless a new review deliberately changes it. |

### 5.1 Revision rule

Do not create a formal state machine for superseding or retiring Canon.

When Canon changes:

- retain the same `canon_key` when the underlying subject remains the same;
- replace the wording, description or reference with the newly approved version;
- change `proposed` to `confirmed` when approved;
- archive or deliberately delete material that is no longer required;
- use GitHub history, database timestamps and approved review records for change history.

A materially different concept may use a new `canon_key`, but the old record does not require a special `superseded` state.

## 6. Canon record requirements

### 6.1 Required text record fields

| Field | Requirement |
|---|---|
| `canon_key` | Stable lowercase hyphenated identity unique within the story. It describes the subject rather than temporary wording. |
| `title` | Short Studio-facing name. |
| `rule_category` | Database-driven category slug. Blank, inactive or unknown values display under **Other**. |
| `rule_text` | Complete private statement, description, guidance or proposal. It may contain spoilers. |
| `importance` | Production significance using the current database contract. |
| `canon_state` | `proposed` or `confirmed`. |
| `content_status` | Normally `draft` during development. Archiving is explicit. |
| `spoiler_level` | Internal sensitivity indicator. It does not make the record public. |
| `is_public` | `false` for Private Canon. |

### 6.2 Recommended authoring information

Where supported directly or through related records, retain:

- source or evidence;
- affected characters, locations, factions, objects or episodes;
- intended reveal range;
- known limits and exceptions;
- rationale;
- contradiction notes;
- downstream objects requiring review;
- associated visual references;
- approved prompt guidance;
- asset approval status.

Do not silently discard useful preparation information merely because the current table does not yet contain a dedicated column.

## 7. Visual Canon and reference images

Images are first-class production knowledge when they establish or clarify continuity.

Private Canon may hold or link to:

- approved character portraits;
- visual variants such as Dream, Working or Exploring versions of a character;
- expressions and emotional range;
- clothing and equipment references;
- age, build, hair, facial and distinguishing-feature guidance;
- approved locations, objects, symbols and maps;
- palette, lighting, atmosphere and material references;
- rejected visual directions that must not be repeated;
- approved prompt fragments or art-direction notes.

### 7.1 Image Review retrieval order

Before generating or reviewing episode artwork, the Image Review process should read:

1. relevant confirmed visual Canon;
2. approved reference images and visual profiles;
3. the exact episode or roadmap context;
4. character knowledge and reveal restrictions;
5. existing approved artwork where continuity matters.

Proposed visual Canon may be used for low-resolution exploration, but it must be identified as proposed and must not automatically replace approved references.

Artwork does not become Canon merely because it was generated. A visual decision becomes confirmed Canon only through an explicit Canon or Artwork approval action.

## 8. Canon creation process

### 8.1 Establish scope

Identify:

1. story slug;
2. Canon domains included;
3. source material being read;
4. whether the task is discussion, preparation, review or Supabase sync;
5. which other objects are read-only context;
6. whether visual references are included.

### 8.2 Read relevant sources

Read only the material required for the approved scope:

- story brief;
- existing proposed and confirmed Canon;
- relevant roadmap blocks;
- completed or approved story prose;
- Wiki entries where they show reader knowledge;
- approved artwork and visual profiles;
- review findings affecting the Canon scope.

Treat each source appropriately:

- the brief controls the promised experience;
- confirmed Canon records the current Studio understanding;
- proposed Canon supports exploration;
- story prose records what the audience experiences;
- roadmap records planned development;
- Wiki records curated knowledge and may be intentionally incomplete;
- artwork is evidence of an approved visual decision only when explicitly approved.

### 8.3 Create or revise Canon

Create Canon for knowledge that future work must remember, apply or test. Examples include:

- character identity and behavioural boundaries;
- world rules and consequences;
- relationships and motivations;
- visual continuity;
- mysteries and reveal plans;
- writing and thematic constraints;
- reusable image or audio guidance.

Avoid storing disposable prose detail unless forgetting it would create a continuity or production problem.

### 8.4 Review the package

Check each record for:

- fit with the story brief;
- consistency with confirmed Canon;
- support or contradiction in Story and Episodes;
- roadmap impact;
- distinction between objective truth and character belief;
- visual continuity;
- spoiler and reveal control;
- usefulness to future production;
- downstream objects requiring separate review.

### 8.5 Approve and sync

An approved Canon package should identify:

- story slug and scope;
- new records;
- revised records;
- proposed-to-confirmed changes;
- records to archive or delete;
- linked or approved visual references;
- conflict findings;
- downstream review list;
- approval to perform Supabase Draft sync where applicable.

## 9. Independent development and alignment

A Canon operation may discover that another object is inconsistent, but it must not automatically rewrite that object.

Possible findings include:

| Finding | Response |
|---|---|
| Canon and Story disagree | Decide during Creative Development or Review whether Story or Canon should change. |
| Canon and Roadmap disagree | Flag the affected planning block for separate revision. |
| Canon and Wiki disagree | Prepare a separate spoiler-safe Wiki update after the underlying truth is resolved. |
| Canon and Artwork disagree | Send the asset or visual rule to Image Review. |
| Proposed Canon conflicts with confirmed Canon | Keep it proposed until the creative decision is resolved. |
| Character belief is recorded as truth | Separate objective Canon from character knowledge. |

During drafting, temporary inconsistency may be recorded as an open development item. Before approval or publication, relevant inconsistencies must be resolved or explicitly accepted.

## 10. Review Pipeline alignment

The Review Pipeline does not assume that Canon, Story and Wiki were created in a fixed order.

It assesses whether the current Review Candidate is aligned enough for its intended decision.

Review should ask:

- Does the Story deliver the brief and respect confirmed Canon?
- Has Story development created new truths that should be captured in Canon?
- Does confirmed Canon accurately describe the current Story rather than an abandoned earlier concept?
- Does the Wiki reflect the approved Story and Canon without exposing restricted knowledge?
- Does Artwork follow confirmed visual Canon and the actual episode context?
- Are proposed ideas clearly separated from confirmed knowledge?

Corrections return to the independent process that owns the affected object.

## 11. Private Canon and Public Canon

Private Canon is private during development, not necessarily private forever.

Public Canon is a curated, approved publication derived from the Studio Knowledge Base. It may be released with or after a public story to deepen the audience experience.

Possible Public Canon material includes:

- character guides;
- approved character and location artwork;
- maps and timelines;
- world history;
- factions, systems and terminology;
- spoiler-safe or post-story explanations of world rules;
- behind-the-story material approved for release.

Public Canon must not automatically expose:

- unresolved proposals;
- rejected ideas;
- private prompts or provider instructions;
- internal review notes;
- SQI diagnostics;
- unreleased spoilers;
- private production or security information.

Publication is always a separate explicit operation. Setting a story to public does not automatically publish its Private Canon.

## 12. Current Supabase data contract

The current text Canon object is stored in `public.story_canon_rules` and is written through:

```sql
public.sync_private_canon(
    p_story_slug text,
    p_canon_key text,
    p_title text,
    p_rule_category text,
    p_rule_text text,
    p_importance text default 'normal',
    p_canon_state text default 'confirmed',
    p_content_status text default 'draft',
    p_spoiler_level integer default 0
)
```

The approved documentation contract uses `proposed` and `confirmed` only. The existing database may temporarily continue accepting legacy values until a separately approved migration simplifies the constraint and existing data. New Canon loads must not create new `superseded` or `retired` records.

Visual references currently use the existing production-knowledge and media-asset structures where applicable. A future schema enhancement may create stronger first-class Canon-to-asset relationships, but that database change is outside this document update.

## 13. Data loading process

### 13.1 Pre-flight validation

Before sync:

1. resolve the story slug;
2. confirm the Canon scope and approval;
3. validate unique `canon_key` values within the package;
4. accept only `proposed` or `confirmed` for new writes;
5. validate required fields;
6. confirm `is_public` remains false;
7. identify visual assets or links requiring separate loading;
8. identify archive or delete actions explicitly.

### 13.2 Idempotent loading

Load each text record through `sync_private_canon` using its stable `canon_key`.

Expected behaviour:

- new key: insert;
- existing key: update the current record;
- repeated identical run: no duplicate;
- revised wording: replace the current value;
- proposed approval: update state to `confirmed`;
- archive or deletion: separate explicit action.

### 13.3 Verification

Verify:

- expected record count;
- no duplicate `(story_id, canon_key)` values;
- only approved states are used for current records;
- Studio categories display correctly, including **Other** fallback;
- visual references resolve where included;
- Private Canon is not exposed through public anonymous access;
- no Story, Episode, Roadmap, Wiki or Artwork records changed outside scope.

## 14. Acceptance checklist

A Canon operation is complete when:

- the scope is explicit;
- Canon is treated as an independent Studio Knowledge Base;
- Story and Canon are allowed to influence each other without automatic cross-writing;
- records are classified as proposed or confirmed;
- changes replace current records rather than creating unnecessary lifecycle states;
- visual continuity and reference images are included when relevant;
- Image Review can retrieve relevant confirmed visual Canon;
- Wiki remains a separate normally downstream curation process;
- Review alignment requirements are recorded;
- Public Canon remains a separate curated publication action;
- Supabase sync is idempotent and verified;
- public/private controls remain intact.

## 15. Definition of Done

Private Canon is done for the approved scope when the Studio has a clear, usable and verified body of creative knowledge that can guide Story, Artwork, Audio, Wiki and Review work without forcing those objects to be edited together.

It remains open to revision throughout development. Review seeks alignment, not premature immutability. Publication may later transform an approved subset into Public Canon.