# Planning Block Review Notes Specification

**Status:** Current project standard  
**Scope:** Studio review comments for roadmap and planning blocks  
**Owner:** Audio Platform  
**Last updated:** 02 Aug 2026

## 1. Purpose

This specification defines how reviewers comment on a planning block without directly changing the planning block, its episode intentions or its Reader document.

The review-note system exists to preserve four separate things:

1. the exact draft being reviewed;
2. the reviewer's recommendation;
3. the author's response and decision;
4. the later creative revision, when one is deliberately applied.

Review comments are evidence and recommendations. They are not source-content edits.

## 2. Core operating rule

> **Review the source. Record the recommendation. Revise separately. Preserve the history.**

The Studio review screen must present the planning-block intention and Reader content as read-only material. Reviewers add notes beside that content rather than editing it.

## 3. Review scopes

Version 1 supports two annotation scopes:

- **Whole planning block** — a comment applying to the complete episode range or block intention.
- **Planned episode** — a comment applying to one episode intention inside the block.

Paragraph-level highlights and text-range anchors are outside Version 1. They may be added later only if stable source-version anchoring is implemented.

## 4. Required review-note data

Each review note records:

- story;
- planning block;
- optional planned episode number;
- reviewer identity and display name;
- note text;
- status;
- optional author response;
- creation and update timestamps;
- optional parent note for future threaded replies.

Allowed statuses are:

| Status | Meaning |
|---|---|
| `open` | Recommendation is awaiting an author decision or action. |
| `accepted` | The author agrees that a revision should be made. |
| `rejected` | The author has considered the recommendation and will not apply it. |
| `resolved` | The recommendation has been addressed or otherwise completed. |

Changing a note status never changes the source material automatically.

## 5. Studio presentation

The planning-block review page must show:

### Source panel

- story title;
- episode range and planning-block title;
- planning-block intention;
- full Reader rendering;
- no direct editing controls for the source.

### Review panel

- selector for the whole block or one planned episode;
- reviewer name;
- review comment or recommendation;
- filters for All, Open, Accepted, Rejected and Resolved;
- author response;
- status controls;
- reviewer and date history.

The interface must state clearly that comments do not alter the planning block or Reader.

## 6. Workflow

The normal workflow is:

```text
Synced planning block
        ↓
Reviewer reads exact source
        ↓
Reviewer records block-level or episode-level note
        ↓
Author responds and sets Open / Accepted / Rejected
        ↓
Accepted changes return to Creative Development
        ↓
Source is revised and explicitly synced
        ↓
Note is marked Resolved after verification
```

A note may remain open across multiple creative-development sessions.

## 7. Relationship to Creative Development

Review notes do not authorise silent changes.

When an author accepts a recommendation:

1. record the response and set the note to `accepted`;
2. return the affected material to **Audio Platform Begin Creative Development**;
3. apply the agreed revision to the working source;
4. perform **Audio Platform Supabase Draft Sync** when authorised;
5. verify the changed source;
6. set the note to `resolved` only after the intended change is represented in the synced draft.

Rejected notes remain part of the review history.

## 8. Relationship to formal Review Pipeline

Planning-block review notes may be used during informal peer review, Creative Development or formal Review.

They do not replace the Batch Review Record, Story Quality Index or final Review decision. Formal Review may cite relevant review notes as evidence, but must still complete the authoritative Review Pipeline.

## 9. Security and access

- Studio users may read review notes when Studio mode allows access to the draft.
- Creating or changing a review note requires an authenticated user with a profile.
- Reviewers may update notes they created.
- Administrators may update any review note.
- The public site must not display planning-block review notes.
- A Studio-mode browser cookie is not sufficient authority for a database write.

## 10. Data model

The authoritative table is:

`public.planning_block_review_notes`

The source records remain:

- `public.story_episode_planning_blocks` for the planning block and episode intentions;
- `public.episodes.reader_content_json` for the visible Reader document.

Review notes must not be embedded inside either source JSON structure because that would mix review history with authored content.

## 11. Preservation and deletion

Review history should normally be preserved even after a note is rejected or resolved.

Deleting a story or planning block may cascade-delete its review notes. Ordinary draft syncs must not delete notes because a note was absent from the current source batch.

## 12. Definition of done

The review-note feature is complete when:

- the planning block and Reader are read-only on the review screen;
- a reviewer can target the whole block or one planned episode;
- authenticated reviewers can add notes;
- notes show reviewer, date, target and status;
- authors can record a response and change status;
- filters expose outstanding and completed recommendations;
- source revisions remain separate and explicit;
- review history survives normal draft syncs.
