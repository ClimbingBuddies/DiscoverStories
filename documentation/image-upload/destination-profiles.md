# Image Upload Destination Profiles

## Rule

All destinations use the [Core Upload Process](./core-upload-process.md). A destination profile changes routing and linking only. It does not authorise an alternative transport method.

The final Storage path is derived by the Supabase upload function. Do not invent or override it in a queue manifest.

## Profile summary

| Role | Required identifiers | Canonical path pattern | Link behaviour | Status |
|---|---|---|---|---|
| Cover | `storySlug` | `{storySlug}/{storySlug}-cover[-stage-version].jpg` | Updates story cover path and URL | Supported |
| Banner | `storySlug` | `{storySlug}/{storySlug}-banner[-stage-version].jpg` | Updates story banner path | Supported |
| Episode | `storySlug`, `seasonNumber`, `episodeNumber` | `{storySlug}/episodes/{storySlug}-s##e##[-stage-version].jpg` | Updates episode artwork path and URL | Supported |
| Reader | Story and episode identifiers | `{storySlug}/episodes/{episode}/reader/{filename}` | Registers media; Reader JSON must reference ID | Blocked |
| Canon | Canon project and object identifiers | `{canonProjectSlug}/canon/{canonObjectSlug}/{object}-stage-version.jpg` | Registers media and `private_canon_assets` relationship | Blocked |

For `production` stage, the stage/version suffix is omitted. For `concept` and `refined`, the suffix is included.

## Story cover

Required manifest values:

```json
{
  "storySlug": "exact-existing-slug",
  "assetRole": "cover",
  "stage": "concept",
  "workflowStatus": "draft",
  "versionNumber": 1,
  "generationNotes": "Reason for upload."
}
```

Expected database effects:

- one `media_assets` row is inserted or updated by Storage path;
- `stories.cover_image_path` receives the relative Storage path;
- `stories.cover_image_url` receives the public URL.

Stop if the story slug does not resolve exactly once.

## Story banner

Required manifest values:

```json
{
  "storySlug": "exact-existing-slug",
  "assetRole": "banner",
  "stage": "concept",
  "workflowStatus": "draft",
  "versionNumber": 1,
  "generationNotes": "Reason for upload."
}
```

Expected database effects:

- one `media_assets` row is inserted or updated by Storage path;
- `stories.banner_image_path` receives the relative Storage path.

Verify the actual banner rendering; a successful object upload alone is incomplete.

## Episode artwork

Required manifest values:

```json
{
  "storySlug": "exact-existing-slug",
  "assetRole": "episode",
  "stage": "concept",
  "workflowStatus": "draft",
  "versionNumber": 1,
  "seasonNumber": 1,
  "episodeNumber": 3,
  "generationNotes": "Reason for upload."
}
```

Expected database effects:

- one `media_assets` row is associated with the episode;
- `episodes.artwork_path` receives the relative Storage path;
- `episodes.artwork_url` receives the public URL.

The workflow rejects identical converted JPEG bytes used for two episode assets in the same batch.

For an existing episode replacement:

1. record the existing path;
2. determine whether the established canonical path must be preserved;
3. upload and verify the new object;
4. confirm the episode was linked only after upload;
5. verify HTTP 200 and page rendering.

Do not use a random filename for an intended episode replacement. The current upload function derives the canonical filename.

## Random-filename test

A random queue folder name does not produce a random Storage filename. The current production function derives Storage paths from story, role, stage, version and episode identifiers.

A truly random Storage filename is therefore not supported by this canonical pipeline without a separate test-only implementation. Do not add an unsupported `filename` or `storagePath` field to the manifest and assume it will be honoured.

A safe low-impact test uses:

- an existing draft story;
- a non-production stage;
- a new version number;
- one asset;
- an exact queue folder;
- verification before any larger batch.

## Reader/Tiptap image — blocked profile

Intended behaviour:

1. upload and register the image in `media_assets`;
2. do not replace the episode’s primary artwork;
3. return the media asset ID;
4. write that ID to the Tiptap image node;
5. retain `src` only as a fallback;
6. resolve approved Reader-visible media by ID at render time.

Current blockers:

- the upload function constructs the Reader path without first assigning the supplied season and episode values;
- the GitHub-to-database sequence does not write the returned asset ID into a specific Tiptap document;
- approval and Reader-visibility state require separate controlled handling.

A lower-capacity model must stop and report **Reader profile blocked**. It must not upload the image as episode artwork and must not paste an unregistered permanent URL into Tiptap as a substitute.

## Canon image — blocked profile

Intended required values include:

- `canonProjectSlug`;
- `canonObjectSlug`;
- `canonAssetRole`;
- optional consistency and refinement notes.

Intended database effects:

- register the object in `media_assets`;
- create or update its `private_canon_assets` relationship;
- do not alter story or episode artwork fields.

Current blocker:

- the GitHub workflow accepts the `canon` role but does not forward the Canon-specific fields required by the upload function.

A lower-capacity model must stop and report **Canon profile blocked**. It must not substitute an episode, cover or banner role.

## Characters

A character reference is currently a Canon image, not a separate transport role. It inherits the Canon blocked status until the queue forwards the required Canon project and object identifiers.

Do not create an invented `character` asset role; the workflow rejects roles outside:

```text
cover, banner, episode, reader, canon
```
