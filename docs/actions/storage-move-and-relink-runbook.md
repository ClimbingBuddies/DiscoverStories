# Storage Move and Database Relink Runbook

> **Implementation status — process specification only.** This coordinated workflow is not a single deployed operation. `storage_move` does not update database records, and no general `media_relink` operation has been implemented. Models must perform only the separately available, authorised steps and must not claim an atomic move-and-relink capability.

## Purpose

Use this process to relocate or rename an existing Storage image while ensuring the website continues displaying it.

A linked production image must not use a direct `storage_move` first because the website could point to a missing object. Use the safe relocation sequence:

```text
Discover references
→ copy to destination
→ verify destination
→ relink approved database records
→ verify website
→ retain source or submit it to controlled cleanup
```

## Required inputs

- exact story slug;
- source visibility and story-relative path;
- destination visibility and story-relative path;
- reason for relocation;
- expected image record or content relationship;
- confirmation whether the source should be retained or marked for later deletion.

## Gate 1 — Find every reference

Before changing Storage, identify every reference to the source path, including:

- `media_assets`;
- episode artwork fields;
- story cover and banner fields;
- Canon and Wiki image records;
- Reader and Tiptap JSON content;
- any other structured content containing the path.

Stop if the source cannot be matched confidently or an embedded reference cannot be safely updated.

## Gate 2 — Validate the destination

Confirm:

1. the source exists;
2. the destination does not exist;
3. both paths are within the correct story;
4. the filename and extension are valid;
5. the source MIME type matches the destination extension;
6. no existing object will be overwritten.

## Gate 3 — Create and verify the destination

For a website-linked image, use `storage_copy` so the original path remains available during relinking.

Verify that the destination:

- exists;
- has the same eTag or content checksum;
- has the same byte size;
- has the same MIME type;
- is accessible through the intended public, authenticated or signed access method.

Do not update the database until these checks pass.

## Gate 4 — Relink approved database records

Update only the references identified in Gate 1 and approved for this operation.

Prefer linking content through `mediaAssetId`. Where a path must be stored, save the exact new relative Storage path. Never store a temporary signed URL.

Record:

- table and record changed;
- old path;
- new path;
- operation identifier and timestamp.

## Gate 5 — Verify the website

Confirm:

- the affected story, episode, Canon, Wiki or Reader page loads;
- the relocated image renders;
- the browser no longer requests the old path where relinking was intended;
- private images remain inaccessible without authorised access;
- no unrelated image reference changed.

## Gate 6 — Complete or roll back

If Storage, database and website verification succeed:

- retain the source for an agreed safety period; or
- submit the source to the separately controlled deletion process.

If database or website verification fails:

1. restore the original database references;
2. verify the original image still renders;
3. retain the destination and flag it for controlled cleanup;
4. report the workflow as failed or rolled back.

Do not delete either object during an uncertain state.

## Direct `storage_move`

A direct `storage_move` may be used only for an isolated object with no database or embedded-content reference.

Do not directly move linked production media. A direct move removes the source path before database and website verification can finish.

## Result report

```text
STORAGE RELOCATION AND RELINK: SUCCESS | FAILED | ROLLED BACK | NOT IMPLEMENTED

Story:
Source visibility/path:
Destination visibility/path:
References found:
Destination verified:
Database records updated:
Website verified:
Original source retained:
Source marked for deletion:
Rollback required:
Temporary authority removed:
```

## Security boundary

Random UUID filenames make public objects difficult to guess but do not make them private. Restricted images must use private Storage with authenticated access or time-limited signed URLs.
