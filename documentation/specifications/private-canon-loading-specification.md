# Private Canon Loading Specification

**Status:** Current project standard  
**Scope:** Studio-only Private Canon creation, revision and Supabase sync  
**Last updated:** 30 Jul 2026

## Purpose

Private Canon records authoritative story truths, proposed creative decisions, secrets, constraints and continuity rules. It is a separate content object from the Wiki, episodes and roadmap.

> Private Canon defines what is true. Episodes and roadmap express it dramatically. The Wiki presents what readers are currently allowed to know.

## Independent operation

Private Canon Development may run as a standalone Creative Development task. It may read the story, episodes, roadmap and existing Wiki for context, but writes only Private Canon unless another scope is explicitly approved. Canon changes may identify conflicts; they do not silently rewrite story content.

Use:

> **Audio Platform Private Canon Development — [STORY] — [SCOPE] — do not change episodes, roadmap or Wiki.**

## Stable identity and state

Each record is identified by `(story_id, canon_key)`. The key is stable, lowercase and descriptive. Titles and wording may change without creating a new identity.

| State | Meaning |
|---|---|
| `proposed` | Being considered; not established |
| `confirmed` | Authoritative truth future work must respect |
| `superseded` | Replaced by a newer decision |
| `retired` | Deliberately removed from active canon |

Only proposed and confirmed records appear in the normal Studio view.

## Visibility

Private Canon is always Studio-only in the website interface.

- It is never returned through the public Wiki procedure.
- It is never shown while Studio is off.
- `is_public` must remain `false`.
- Published status never makes Private Canon public.
- Superseded and retired records are excluded from the normal view.

### Temporary Studio-toggle access

Until Studio authentication is implemented, `public.get_studio_private_canon(story_slug, studio_mode)` may be executed by the anonymous website role and returns records only when `studio_mode = true`. This is an explicitly approved temporary review mechanism, not an authentication boundary: a caller who invokes the procedure directly can supply `true`.

Therefore Private Canon must currently be treated as review-private rather than securely confidential. Do not store credentials, personal data or other sensitive information in it. The planned login change must replace this caller-supplied flag with authenticated, authorised Studio access and remove anonymous execution.

## Independent Supabase sync

Use:

> **Audio Platform Private Canon Sync — [STORY] — [CANON SCOPE] — Supabase Draft — do not update Wiki, episodes or roadmap.**

The database procedure `public.sync_private_canon(...)` performs an idempotent upsert using `(story_id, canon_key)`. Execution is restricted to the service role. A combined sync is allowed only when every content type is explicitly named in the approved scope.

## Category behaviour

Private Canon category selectors are database-driven through `private_canon_category_types`. A record whose category is blank, inactive or unrecognised is retained and displayed under **Other** in Studio. New recognised category rows and new canon records appear without a website code change.

## Wiki refresh relationship

A Wiki refresh is a separate operation. It may read confirmed Private Canon, completed or approved episodes, roadmap information as future planning, and the existing Wiki. It prepares Draft Wiki changes with reveal controls and never changes Private Canon.

Use:

> **Audio Platform Wiki Refresh — [STORY] — use confirmed Private Canon and [EPISODE/RANGE] — prepare Draft Wiki changes — do not change Private Canon.**

## Verification

Verify:

- the story slug resolves once;
- canon keys are unique within the story;
- counts match the approved scope;
- every record has `is_public = false`;
- only valid canon states exist;
- the Studio read returns intended active records;
- blank and unrecognised categories appear under **Other**;
- the public Wiki returns no Private Canon;
- rerunning creates no duplicates;
- Wiki, episodes and roadmap were not changed.

## Website contract

In Studio mode, **Private Canon** appears beside **Wiki** and opens `/stories/[slug]/private-canon`. The route returns not found while Studio is off and displays proposed and confirmed records with visible state badges. The browser starts with every category closed and opens one category at a time using the Studio Workflow interaction pattern.

## Definition of done

A Private Canon task is complete when its scope is explicit, records sync independently and idempotently, public Wiki visibility is prevented, the Studio page displays the intended records, the temporary access limitation is documented, and no unrelated story or Wiki records changed.
