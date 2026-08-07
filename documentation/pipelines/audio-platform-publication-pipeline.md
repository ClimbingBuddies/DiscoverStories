# Audio Platform Publication Pipeline

**Status:** Current project standard  
**Scope:** Controlled promotion of an approved Review Candidate to public release  
**Owner:** Audio Platform  
**Last updated:** 06 Aug 2026  
**Version:** 1.0

## Purpose

The Publication Pipeline is the only Audio Platform process that may change approved content into a public release. Review may authorise promotion, but it does not publish.

This pipeline publishes one exact, verified Review Candidate. It does not revise story content, generate replacement artwork, infer missing approval or silently repair failed assets.

## Entry command

Use:

> **Audio Platform Begin Publication Pipeline**

The request must identify the story and the Review decision that authorised promotion. If the candidate or approval is ambiguous, stop.

## Entry gates

Before any public change, confirm:

1. the exact Review Candidate and Review record;
2. the Review decision is **Promote**;
3. all required corrections are closed;
4. Supabase still matches the approved candidate;
5. required IP, ownership and trade mark checks are complete;
6. every in-scope public image points to a verified Storage object;
7. `media_assets` and direct story/episode pointers agree;
8. Studio renders the approved content;
9. a rollback target is recorded for every changed public pointer.

A failed gate returns the work to Review, Image Review or Creative Development. Do not publish partially verified content merely because some records are ready.

## Publication sequence

```text
identify approved Review Candidate
→ read back the exact Supabase records
→ verify approval, content and asset identities
→ verify public Storage destinations
→ apply only authorised publication/status changes
→ read back changed records
→ verify public APIs and HTTP responses
→ verify website and Reader rendering
→ record release evidence and rollback state
```

## Artwork and Storage rules

Publication does not invent Storage paths.

For a new supported draft/review production upload, follow the GitHub queue/OIDC image-upload guides.

For an explicitly authorised linked relocation performed through connected-Supabase Chat, use copy-first handling:

1. discover every reference;
2. copy to the approved destination;
3. verify bytes, MIME type, size and eTag/checksum where available;
4. register or update `media_assets`;
5. relink only the exact authorised records;
6. verify Studio and public rendering;
7. retain the source for rollback;
8. submit the old source to separately controlled cleanup.

Do not directly `storage_move` linked production media. `storage_file_rename` and a general atomic `media_relink` operation do not exist.

A lowercase UUID filename may be used for an approved private object. Random naming does not make a public object private.

## Required verification

Publication is complete only when all applicable checks pass:

- the exact approved candidate was published;
- story and episode statuses are correct;
- no unrelated record changed;
- public API responses contain the intended version;
- every public image URL returns HTTP 200;
- returned MIME type and bytes match the file extension;
- `media_assets` and direct pointers resolve consistently;
- Studio renders the approved records;
- the public website and Reader render the intended content;
- rollback identities remain available;
- temporary Storage-operation authority has been removed.

If a required check cannot be performed, report **NOT VERIFIED**, not **SUCCESS**.

## Failure and rollback

Stop at the first failed gate.

- Before any public write: report the blocker; make no publication change.
- After a database write but before render verification: restore the recorded previous pointer or status when the approved rollback is available.
- After a copy/relink failure: retain both Storage objects until the database and rendering state is certain.
- Never delete the previous public object as part of the same uncertain operation.

## Completion report

| Area | Required result |
|---|---|
| Story and candidate | Exact identity |
| Review approval | Promote decision and record |
| Content verification | Passed/failed |
| Storage verification | Passed/failed/not applicable |
| Database changes | Exact records and fields |
| Public API/HTTP | Passed/failed |
| Studio rendering | Passed/failed |
| Website/Reader rendering | Passed/failed |
| Rollback state | Recorded |
| Outcome | SUCCESS / FAILED / NOT VERIFIED / BLOCKED |

## Supporting processes

- Workflow Router: `documentation/pipelines/audio-platform-draft-pipeline.md`
- Creative Development: `documentation/pipelines/audio-platform-creative-development-process.md`
- Image Review: `documentation/pipelines/audio-platform-image-review-pipeline.md`
- Review Pipeline: `documentation/pipelines/audio-platform-review-pipeline.md`
- Image Upload Guides: `documentation/image-upload/README.md`
- Storage Management Action Specification: `docs/specifications/Storage_Management_Action_Specification_v1.0.md`
- Storage Move and Database Relink Runbook: `docs/actions/storage-move-and-relink-runbook.md`
