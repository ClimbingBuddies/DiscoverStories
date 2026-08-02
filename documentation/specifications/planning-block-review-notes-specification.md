# Planning Block Notes Specification

**Status:** Current project standard  
**Scope:** Studio notes for roadmap and planning blocks  
**Owner:** Audio Platform  
**Last updated:** 02 Aug 2026

## 1. Purpose

This specification defines how a person reading a planning block can make notes without directly changing the planning block, its episode intentions or its Reader document.

The notes system preserves four separate things:

1. the exact draft being read;
2. the reader's comment or recommendation;
3. the author's later response and decision;
4. the later creative revision, when one is deliberately applied.

Notes are observations and recommendations. They are not source-content edits and they do not constitute a formal Review decision.

## 2. Core operating rule

> **Read the source. Make a note. Review the notes later. Revise separately. Preserve the history.**

The Reader presents the planning-block intention and episode plans as read-only material. A **Make Notes** action opens a small modal over the Reader. The person records a note, saves it to Supabase and closes the modal without leaving the Reader.

## 3. Note scopes

Version 1 supports two note scopes:

- **Whole planning block** — a note applying to the complete episode range or block intention.
- **Planned episode** — a note applying to one episode intention inside the block.

Paragraph-level highlights and text-range anchors are outside Version 1. They may be added later only if stable source-version anchoring is implemented.

## 4. Required note data

Each note records:

- story;
- planning block;
- optional planned episode number;
- note-maker name;
- optional authenticated user identity;
- note text;
- status;
- optional author response;
- creation and update timestamps;
- optional parent note for future threaded replies.

Allowed statuses are:

| Status | Meaning |
|---|---|
| `open` | The note has not yet been assessed or acted upon. |
| `accepted` | The author agrees that a revision should be made. |
| `rejected` | The author has considered the note and will not apply it. |
| `resolved` | The note has been addressed or otherwise completed. |

Changing a note status never changes the source material automatically.

## 5. Reader presentation

The Reader must show the planning-block source normally. In Studio mode, a **Make Notes** button is displayed for a planning-block Reader record.

Selecting **Make Notes** opens a modal containing:

- selector for the whole block or one planned episode;
- note-maker name;
- note or recommendation text;
- **Save Note** action;
- **Cancel** and close actions.

After a successful save:

- the note is inserted into `public.planning_block_review_notes`;
- the modal closes;
- the Reader remains unchanged;
- the user stays on the same Reader page.

The old separate **Edit Reader** or **Review Notes** page is not the primary note-taking interaction.

## 6. Workflow

The normal workflow is:

```text
Synced planning block
        ↓
Reader opens planning-block Reader
        ↓
Reader selects Make Notes
        ↓
Reader targets whole block or one planned episode
        ↓
Note is saved to Supabase and modal closes
        ↓
Author or ChatGPT later reads notes against the exact source
        ↓
Accepted changes return to Creative Development
        ↓
Source is revised and explicitly synced
        ↓
Note is marked Resolved after verification
```

A note may remain open across multiple creative-development sessions.

## 7. ChatGPT review of notes

ChatGPT may retrieve open notes together with:

- the relevant story;
- planning-block intention;
- planned episode record;
- Reader content;
- current draft status.

ChatGPT may then:

- group overlapping comments;
- identify contradictions between notes;
- compare each note with the actual episode intention;
- recommend which changes should be accepted, rejected or discussed;
- draft proposed revisions for approval.

ChatGPT must not silently apply a note. Any source change still requires the normal Creative Development and Supabase Draft Sync authority.

## 8. Relationship to Creative Development

Notes do not authorise silent changes.

When an author accepts a recommendation:

1. record the response and set the note to `accepted`;
2. return the affected material to **Audio Platform Begin Creative Development**;
3. apply the agreed revision to the working source;
4. perform **Audio Platform Supabase Draft Sync** when authorised;
5. verify the changed source;
6. set the note to `resolved` only after the intended change is represented in the synced draft.

Rejected notes remain part of the notes history.

## 9. Relationship to formal Review Pipeline

Planning-block notes may support informal peer feedback, Creative Development or formal Review.

They do not replace the Batch Review Record, Story Quality Index or final Review decision. Formal Review may cite relevant notes as evidence, but must still complete the authoritative Review Pipeline.

## 10. Security and access

- The Make Notes action is available only through the Studio Reader experience.
- Notes may be submitted without a completed site login during the current open Studio phase.
- Anonymous inserts are limited to new `open` notes with a note-maker name and note text.
- Anonymous users cannot change status, add an author response or resolve a note.
- Authenticated note authors may update notes they created.
- Administrators may update any note.
- The public site must not display planning-block notes.
- A later authenticated Studio release should restrict note creation to approved Studio users.

## 11. Data model

The authoritative table is:

`public.planning_block_review_notes`

The source records remain:

- `public.story_episode_planning_blocks` for the planning block and episode intentions;
- `public.episodes.reader_content_json` for the visible Reader document.

Notes must not be embedded inside either source JSON structure because that would mix feedback history with authored content.

## 12. Preservation and deletion

Notes history should normally be preserved even after a note is rejected or resolved.

Deleting a story or planning block may cascade-delete its notes. Ordinary draft syncs must not delete notes because a note was absent from the current source batch.

## 13. Definition of done

The notes feature is complete when:

- the planning block and Reader remain read-only;
- the Reader includes a Make Notes button in Studio mode;
- Make Notes opens and closes as a modal without page navigation;
- a person can target the whole block or one planned episode;
- a valid note is saved to Supabase;
- saving a note does not change Reader or planning-block content;
- ChatGPT can retrieve the note with the relevant episode intention for later analysis;
- source revisions remain separate and explicit;
- notes history survives normal draft syncs.
