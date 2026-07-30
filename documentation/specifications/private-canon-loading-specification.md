# Private Canon Creation and Data Loading Specification

**Version:** 1.0  
**Date:** 30 Jul 2026  
**Status:** Current project standard  
**Scope:** Studio-only Private Canon creation, review, revision and Supabase Draft sync

> **Core production rule:** Private Canon defines what is true, proposed or constrained within the story world. Episodes and roadmap blocks express Canon dramatically. The Wiki presents only what readers are currently allowed to know.

## 1. Purpose and boundaries

This specification governs the creation, review and database loading of Private Canon as an independent Studio object. It replaces the earlier assumption that all private continuity material must be loaded through the Wiki process.

Private Canon may be created or revised without changing story prose, roadmap blocks, episode records, Wiki records or artwork. A Canon task may identify downstream conflicts, but those objects are revised only through their own explicitly approved operations.

| Included | Handled elsewhere |
|---|---|
| Authoritative world and character truths | Episode narrative creation and revision |
| Proposed creative decisions requiring review | Story and episode SQL loading |
| Continuity rules, constraints and exceptions | Public Wiki wording and spoiler filtering |
| Secrets, mysteries and reveal intentions | Artwork generation and asset upload |
| Character knowledge and mistaken beliefs at a planning level | Audio production and voice instructions |
| Canon categories, states and importance | Website authentication implementation |
| Idempotent Supabase Draft sync | Schema migrations unless separately approved |
| Studio verification and conflict reporting | Automatic rewriting of dependent content |

## 2. Relationship to other production objects

Private Canon is independent but connected to the wider production model.

| Object | Relationship to Private Canon |
|---|---|
| Story brief | Establishes the premise, audience, tone, required elements and exclusions that Canon must respect. |
| Story roadmap | May propose future truths and reveal timing. Confirmed Canon constrains later roadmap development. |
| Episodes | Establish Canon through dramatized events. Episode evidence may confirm, challenge or supersede a Canon proposal. |
| Wiki | May derive spoiler-controlled public wording from confirmed Canon. The Wiki never replaces the full private explanation. |
| Artwork | Uses confirmed visual Canon for character, object and location continuity. Artwork must not create new Canon by accident. |
| Review Pipeline | Assesses contradictions, weak rules, continuity failures and downstream impacts before Canon is confirmed. |

### 2.1 Independence rule

A Private Canon operation writes only Private Canon unless the approved scope explicitly names another object.

Use:

> **Audio Platform Private Canon Development — [STORY] — [SCOPE] — do not change episodes, roadmap, Wiki or artwork.**

For database loading use:

> **Audio Platform Private Canon Sync — [STORY] — [CANON SCOPE] — Supabase Draft — do not update Wiki, episodes, roadmap or artwork.**

A combined operation is allowed only when every content type and intended write action is explicitly named.

## 3. Canon content model

A Canon record is one stable, reviewable statement. Do not combine several unrelated truths into a single record merely because they share a category.

### 3.1 Required record fields

| Field | Requirement |
|---|---|
| `canon_key` | Stable lowercase hyphenated identity unique within the story. It must describe the rule rather than its current wording. |
| `title` | Short Studio-facing name that allows reviewers to scan the Canon browser. |
| `rule_category` | Database-driven category slug. Unknown, blank or inactive values remain stored and display under **Other**. |
| `rule_text` | Complete private statement of the truth, proposal, constraint or rule. It may contain spoilers. |
| `importance` | Production significance, normally `normal`, with higher or lower values only where supported by the current database contract. |
| `canon_state` | `proposed`, `confirmed`, `superseded` or `retired`. |
| `content_status` | Normally `draft` during development. Archiving is an explicit action. |
| `spoiler_level` | Internal sensitivity indicator from 0 upward using the current project convention. It does not make the record public. |
| `is_public` | Always `false`; enforced by the database. |

### 3.2 Optional authoring information

The current sync procedure stores the required fields above. A preparation document may additionally record the following for review, even where those details are not yet separate database columns:

- source or evidence;
- affected characters, locations, factions, objects or episodes;
- earliest intended reveal range;
- known exceptions;
- rationale for the rule;
- contradiction notes;
- downstream objects requiring review;
- replacement `canon_key` when a record is superseded.

These authoring details must not be silently discarded. Where the current schema cannot store them, retain them in the approved Canon preparation package or create a separately reviewed schema enhancement.

## 4. Canon states and decision authority

| State | Meaning | Production effect |
|---|---|---|
| `proposed` | A creative possibility under consideration. | May guide discussion but must not be treated as settled truth. |
| `confirmed` | Approved authoritative truth. | Future story, episode, Wiki and artwork work must respect it. |
| `superseded` | Replaced by a newer approved decision. | Retained for history but excluded from the normal Studio browser. |
| `retired` | Deliberately removed from active Canon without a direct replacement. | Retained for audit/history and excluded from the normal Studio browser. |

Only `proposed` and `confirmed` records appear in the normal Studio view.

### 4.1 State transition rules

- New uncertain ideas begin as `proposed`.
- A proposal becomes `confirmed` only after creative review establishes that it fits the story brief, roadmap and existing evidence.
- Do not overwrite a materially different confirmed truth while pretending it is the same decision.
- When a new rule replaces an old one, create or confirm the replacement and mark the old record `superseded`.
- Use `retired` only where the old idea is intentionally removed and no replacement is required.
- State changes must be explicit in the approved sync scope.

## 5. Canon categories

Private Canon categories are controlled by `public.private_canon_category_types`.

The category table contains:

- `slug` — stable lowercase category identity;
- `name` — Studio display name;
- `sort_order` — database-controlled display order;
- `is_active` — whether the category is recognised for normal grouping.

### 5.1 Category behaviour

- Use an existing active category when it accurately describes the record.
- Do not force a rule into an unsuitable category merely to avoid **Other**.
- A blank, misspelled, inactive or unrecognised category is retained and displayed under **Other** rather than disappearing.
- New recognised category rows and new Canon records appear in Studio without a website code change.
- Correcting a category value updates grouping on the next read; it does not require recreating the Canon record.
- Category maintenance is a separate database administration action and must not be hidden inside an ordinary story Canon seed unless explicitly approved.

### 5.2 Recommended category design

Categories should describe reusable knowledge domains rather than a single record. Typical domains include:

- character;
- continuity;
- culture;
- dreams;
- ethics;
- governance;
- history;
- map or geography;
- routes or travel;
- science;
- season;
- setting;
- storytelling constraints;
- technology;
- theme.

Story-specific categories are permitted when they represent a recurring body of Canon, but one-off names should normally remain record titles rather than category types.

## 6. Creation guide

### 6.1 Establish the scope

Before writing Canon, identify:

1. the exact story slug;
2. the source material being reviewed;
3. the Canon domains included;
4. whether records are new, revised, confirmed, superseded or retired;
5. which objects are read-only context;
6. whether the task ends at discussion, produces an approved Canon package, or includes Supabase Draft sync.

A scope such as “review all Canon” is too broad unless the story and source range are also defined.

### 6.2 Read the controlling sources

Use the latest approved versions of:

1. the story brief and Story Creation Specification outputs;
2. existing confirmed and proposed Private Canon;
3. relevant roadmap planning blocks;
4. completed or approved episode prose;
5. existing Wiki entries where they provide evidence of what has already been disclosed;
6. approved visual references where appearance or location continuity is involved.

Treat source types differently:

- the story brief controls the promised experience;
- confirmed Canon controls established truth;
- completed episodes provide dramatic evidence;
- roadmap blocks describe intended future development and may remain provisional;
- public Wiki content describes reader knowledge and may be incomplete by design.

### 6.3 Extract candidate Canon

Create candidate records for facts that future work must remember or respect, including:

- world rules and their costs;
- character identity, motives, boundaries and long-term constraints;
- historical events and causal relationships;
- faction goals, powers and limitations;
- object capabilities and restrictions;
- geography, routes, travel limits and inaccessible places;
- mystery answers, false assumptions and reveal intentions;
- character knowledge, secrets and mistaken beliefs;
- visual continuity requirements;
- thematic or storytelling constraints that must remain consistent;
- explicit exceptions to broader rules.

Do not create Canon for disposable prose details unless losing them would create a continuity problem.

### 6.4 Write atomic rules

Each record should answer one clear question. A useful rule normally contains:

- the subject;
- what is true or proposed;
- the relevant limit, cost or exception;
- the consequence for future writing.

Prefer:

> Mara can perceive dream-routes only while asleep; waking sketches preserve fragments but cannot reproduce the full route.

Avoid:

> Dreams, maps, Mara’s childhood, the old city and several future reveals are all connected.

The second statement is too broad to review, update or supersede safely.

### 6.5 Assign stable keys

A `canon_key` must remain stable when wording changes.

Good examples:

- `mara-dream-route-perception`
- `silver-bloodline-three-forms`
- `old-city-official-map-exclusion`
- `cedric-duty-before-romance`

Avoid:

- sequence numbers with no meaning;
- titles containing temporary episode numbers;
- keys based on the current wording of a reveal;
- duplicate keys with suffixes such as `-new` or `-final`.

When a concept is materially replaced, use a new key and supersede the old record rather than mutating its identity beyond recognition.

### 6.6 Review candidate records

For every proposed or revised record, check:

| Review area | Question |
|---|---|
| Brief alignment | Does it support the approved premise, tone, audience and exclusions? |
| Internal consistency | Does it conflict with another confirmed Canon record? |
| Episode evidence | Has an approved episode already established or contradicted it? |
| Roadmap impact | Does it preserve the planned arc and reveal sequence? |
| Character knowledge | Does it distinguish objective truth from what a character believes? |
| Rule completeness | Are costs, limits and exceptions clear enough to guide future writing? |
| Reveal control | Is the truth private even when part of it is already public? |
| Visual continuity | Would artwork created from this rule remain consistent? |
| Atomicity | Can the record be changed independently without rewriting unrelated truths? |
| Downstream impact | Which episodes, roadmap blocks, Wiki entries or images require separate review? |

### 6.7 Approve the Canon package

An approved preparation package should contain:

- story slug and reviewed source range;
- new records;
- revised records;
- state transitions;
- explicit superseded or retired keys;
- conflict findings;
- downstream review list;
- confirmation that no unrelated content is to be changed;
- approval to perform Supabase Draft sync, where applicable.

## 7. Conflict and revision process

Canon revision must preserve traceability.

### 7.1 Types of conflict

| Conflict | Example | Required response |
|---|---|---|
| Canon-to-Canon | Two confirmed rules describe incompatible limits. | Decide which rule remains authoritative; supersede or revise explicitly. |
| Canon-to-episode | An episode shows a character using a prohibited ability. | Decide whether the episode or Canon is wrong; do not silently change both. |
| Canon-to-roadmap | A future arc depends on a rule that has been retired. | Flag the affected roadmap block for separate revision. |
| Canon-to-Wiki | Public wording states something no longer true. | Prepare a separate spoiler-safe Wiki refresh. |
| Canon-to-artwork | Approved imagery violates appearance or object constraints. | Flag the asset for Artwork Review. |
| Truth-to-belief | A character’s mistaken belief is recorded as objective truth. | Separate the world truth from character knowledge. |

### 7.2 Downstream impact rule

A Canon update may produce an impact report, but it must not automatically rewrite:

- story prose;
- episodes;
- roadmap planning blocks;
- Wiki entries or sections;
- artwork prompts or files;
- audio or publication records.

Each affected object returns to its own development, revision or sync operation.

## 8. Current Supabase data contract

The current independent Canon object is stored in `public.story_canon_rules`.

The independent implementation adds and enforces:

- `canon_key text not null`;
- `title text not null`;
- `canon_state text not null`;
- unique identity on `(story_id, canon_key)`;
- allowed states of `proposed`, `confirmed`, `superseded` and `retired`;
- `is_public = false` as a database constraint;
- removal of anonymous direct table selection.

The current write procedure is:

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

It resolves the story by slug and performs an idempotent upsert on `(story_id, canon_key)`. Execution is restricted to `service_role`.

## 9. Data loading process

### 9.1 Preflight

Before writing any record:

1. Confirm the target story exists exactly once in `public.stories` for the supplied slug.
2. Read existing Canon for the story and compare incoming keys.
3. Confirm every incoming state is valid.
4. Confirm every incoming key is lowercase, stable and unique within the package.
5. Confirm `is_public` will remain false.
6. Confirm the sync scope names every record to be added or changed.
7. Confirm state transitions are deliberate.
8. Confirm no Wiki, episode, roadmap, artwork or user data write is included.

If the story does not exist, stop. Story SQL must run first.

### 9.2 Recommended authoring format

For more than a few records, prepare typed JSON before calling the sync procedure.

```json
[
  {
    "canon_key": "mara-dream-route-perception",
    "title": "Dream-route perception",
    "rule_category": "dreams",
    "rule_text": "Mara can perceive complete dream-routes only while asleep. Waking sketches preserve fragments and may contain errors.",
    "importance": "high",
    "canon_state": "confirmed",
    "content_status": "draft",
    "spoiler_level": 2
  }
]
```

The JSON package is an authoring and review format. The current approved database procedure accepts one Canon record per call unless a separately reviewed bulk procedure is introduced.

### 9.3 Sync execution

For each approved record, call `public.sync_private_canon` using the exact story slug and stable key.

```sql
select public.sync_private_canon(
    p_story_slug     => 'the-cartographers-dream',
    p_canon_key      => 'mara-dream-route-perception',
    p_title          => 'Dream-route perception',
    p_rule_category  => 'dreams',
    p_rule_text      => 'Mara can perceive complete dream-routes only while asleep. Waking sketches preserve fragments and may contain errors.',
    p_importance     => 'high',
    p_canon_state    => 'confirmed',
    p_content_status => 'draft',
    p_spoiler_level  => 2
);
```

The procedure:

1. resolves `story_id` from the supplied slug;
2. raises an exception when the story is missing;
3. inserts a new record or updates the existing `(story_id, canon_key)` record;
4. updates only the Canon fields supplied by the procedure;
5. forces `is_public = false`;
6. updates `updated_at`;
7. returns the Canon record UUID.

### 9.4 Idempotency and update behaviour

| Rule | Required behaviour |
|---|---|
| Stable identity | Reruns target `(story_id, canon_key)`. |
| Approved content | Title, category, rule text, importance, state, content status and spoiler level may be updated. |
| Private enforcement | Every insert and update sets `is_public = false`. |
| No blanket deletion | Do not delete all Canon before reinserting. |
| No absent-row retirement | A key missing from the current package is not automatically superseded, retired or archived. |
| Explicit lifecycle change | Supersede, retire or archive only named records. |
| No schema mutation | Ordinary Canon sync does not create tables, columns, policies, constraints or functions. |
| No cross-object mutation | Do not update stories, episodes, roadmap, Wiki, artwork, audio or listener progress. |

### 9.5 Batch safety

The current procedure performs one upsert per call. For a multi-record package:

- validate the full package before the first write;
- execute through a controlled server-side or administrative process using `service_role`;
- capture each returned UUID and any failure;
- do not claim the batch is complete if only part of it was executed;
- where atomic all-or-nothing loading is required, use a reviewed transaction wrapper or approved bulk sync function rather than relying on independent calls;
- never expose the service-role key in a browser, repository file, prompt output or client-side code.

## 10. Verification

### 10.1 Database verification

After sync, verify:

- the story slug resolves once;
- every approved `canon_key` exists once for that story;
- inserted and updated counts match the approved scope;
- title, category, rule text, importance, state, status and spoiler level match the package;
- every record has `is_public = false`;
- only allowed Canon states exist;
- rerunning the same package creates no duplicate logical records;
- no unnamed record was superseded, retired, archived or deleted;
- Wiki, episodes, roadmap, artwork and user data were unchanged.

Example read-only verification:

```sql
select
    s.slug,
    c.canon_key,
    c.title,
    c.rule_category,
    c.importance,
    c.canon_state,
    c.content_status,
    c.spoiler_level,
    c.is_public,
    c.updated_at
from public.story_canon_rules c
join public.stories s on s.id = c.story_id
where s.slug = 'the-cartographers-dream'
order by c.rule_category, c.title, c.canon_key;
```

Duplicate check:

```sql
select c.story_id, c.canon_key, count(*)
from public.story_canon_rules c
join public.stories s on s.id = c.story_id
where s.slug = 'the-cartographers-dream'
group by c.story_id, c.canon_key
having count(*) > 1;
```

### 10.2 Studio verification

Verify the independent Studio read:

- Private Canon appears beside Wiki for the story;
- the route opens `/stories/[slug]/private-canon` only while Studio is enabled;
- `proposed` and `confirmed` records display with visible state badges;
- `superseded`, `retired` and archived records are absent from the normal browser;
- active recognised categories use database labels and sort order;
- blank, inactive and unrecognised categories appear under **Other**;
- all categories begin closed;
- opening one category closes the previously open category under the Studio Workflow interaction pattern;
- the public Wiki API returns no Private Canon records.

## 11. Visibility and security

Private Canon is always Studio-only in the website interface.

- It is never returned through the public Wiki procedure.
- It is never shown while Studio is off.
- `is_public` must remain false.
- Published story or episode status never makes Private Canon public.
- Direct table selection is not granted to the anonymous role.
- Write access to `public.sync_private_canon` is restricted to `service_role`.

### 11.1 Temporary Studio-toggle limitation

Until Studio authentication is implemented, `public.get_studio_private_canon(story_slug, studio_mode)` may be executed by the anonymous website role and returns records only when `studio_mode = true`.

This is an approved temporary review mechanism, not a true authentication boundary. A caller invoking the procedure directly can supply `true`. Therefore Private Canon must currently be treated as **review-private**, not securely confidential.

Do not store:

- passwords, API keys or credentials;
- personal or regulated information;
- legally sensitive confidential material;
- information whose disclosure would create material harm.

The planned Studio login change must replace the caller-supplied toggle with authenticated, authorised access and remove anonymous execution.

## 12. Wiki refresh relationship

A Wiki refresh is a separate operation. It may read:

- confirmed Private Canon;
- completed or approved episodes;
- roadmap information as future planning context;
- the existing public and Studio Wiki.

It then prepares spoiler-controlled Draft Wiki changes. It never changes Private Canon.

Use:

> **Audio Platform Wiki Refresh — [STORY] — use confirmed Private Canon and [EPISODE/RANGE] — prepare Draft Wiki changes — do not change Private Canon.**

### 12.1 Wiki conversion rules

- Only approved Canon facts should be considered for public wording.
- Public text must be rewritten for the reader’s current knowledge rather than copied from private rule text.
- Future outcomes, hidden causes and author instructions remain private.
- Reveal episodes and spoiler levels belong to the Wiki loading process.
- A Wiki disagreement does not alter Canon automatically; it becomes a review finding.

## 13. Acceptance checklist

- [ ] The exact story slug and Canon scope are stated.
- [ ] The source brief and relevant story evidence have been reviewed.
- [ ] Each Canon record contains one clear truth, proposal or constraint.
- [ ] Every `canon_key` is stable, lowercase, descriptive and unique within the story.
- [ ] Categories use database values or deliberately fall under **Other**.
- [ ] Proposed and confirmed decisions are distinguished.
- [ ] Superseded and retired records are named explicitly.
- [ ] Conflicts with existing Canon, episodes, roadmap, Wiki or artwork are recorded.
- [ ] Downstream changes are listed but not silently performed.
- [ ] The story exists before sync begins.
- [ ] Sync uses `public.sync_private_canon` through an authorised service-role process.
- [ ] No secret or service-role credential appears in the SQL, repository or client.
- [ ] Every loaded record remains `is_public = false`.
- [ ] The rerun creates no duplicate `(story_id, canon_key)` records.
- [ ] Studio grouping, state filtering and **Other** fallback work correctly.
- [ ] The public Wiki returns no Private Canon.
- [ ] No Wiki, episode, roadmap, artwork, audio or user data changed unless separately approved.

## 14. Definition of done

A Private Canon Creation and Data Loading task is complete when:

1. its story, sources and scope are explicit;
2. candidate rules have been written atomically and reviewed against the brief, existing Canon and story evidence;
3. proposed, confirmed, superseded and retired decisions are unambiguous;
4. downstream conflicts are documented without silently rewriting other production objects;
5. approved records have been synced independently and idempotently to Supabase Draft using stable `(story_id, canon_key)` identities;
6. every record remains private;
7. database and Studio verification prove the intended result; and
8. a rerun produces no duplicate logical records or unrelated changes.
