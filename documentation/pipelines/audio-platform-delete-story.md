# Audio Platform Delete Story

Use this procedure when the user says:

```text
Audio Platform Delete Story — <exact title or slug>
```

Resolve the story to one exact slug. If a title produces zero or multiple
matches, stop and ask for the slug. Never delete by partial title, prefix,
wildcard or category.

## Safety model

Deletion is deliberately split into two authenticated runs.

1. **Preview** creates a deletion manifest and changes nothing.
2. **Execute** requires the preview `operationId` and the exact confirmation
   `DELETE <slug>`.

The operation supports only stories whose current status is `draft` or
`review`. Published stories require a separate archival or production-removal
process.

## Preview

Run the `Audio Platform Delete Story` GitHub workflow with:

- `action`: `preview`
- `story_slug`: the exact database slug

Review and report:

- story ID, title and status;
- counts of episodes, wiki records, category assignments, production records,
  artwork direction and media records;
- every object under `story-images/<slug>/`;
- confirmation that no listed object is referenced outside the target story;
- the returned `operationId`.

Do not proceed when the manifest is incomplete, shared ownership is detected,
or the user has not authorised deletion.

## Execute

Run the same workflow with:

- `action`: `execute`
- `story_slug`: the unchanged exact slug
- `operation_id`: the value returned by preview
- `confirmation`: `DELETE <slug>`

The operation rebuilds the manifest before deletion. A changed or stale
manifest invalidates the operation ID.

Storage objects are removed through the Supabase Storage API and verified
absent before the exact story row is deleted. Database foreign keys then
cascade through story-owned records. Category master rows are never targeted.

## GitHub queue cleanup

After the Supabase execution succeeds, search the working branch and default
branch for the exact directory:

```text
production-queue/<slug>/
```

Delete only files within that exact directory. Use GitHub file identity and
blob SHA checks; never delete by broad text search alone.

## Final verification

Confirm and report:

- no story remains with the slug;
- no story-owned database records remain;
- no objects remain under `story-images/<slug>/`;
- the direct website route no longer displays the story;
- category master records remain;
- unrelated story counts are unchanged;
- exact GitHub queue files removed, or explicitly report that none existed.

Do not rebuild the story unless the user gives a separate instruction.
