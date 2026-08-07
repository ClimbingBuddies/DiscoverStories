# Image Upload Destination Profiles

## Rule

These destination profiles apply to the GitHub queue/OIDC production route. Every supported destination uses the [Core Upload Process](./core-upload-process.md); a profile changes routing and linking only.

The final Storage path is derived by the Supabase upload function. Do not invent or override it in a queue manifest.

## Profile summary

| Role | Required identifiers | Production path pattern | Link behaviour | Status |
|---|---|---|---|---|
| Cover | `storySlug` | `{storySlug}/story/{uuid}.jpg` | Updates story cover path and URL | Supported |
| Banner | `storySlug` | `{storySlug}/story/{uuid}.jpg` | Updates story banner path | Supported |
| Episode | `storySlug`, `seasonNumber`, `episodeNumber` | `{storySlug}/episodes/{episode}/{uuid}.jpg` | Updates episode artwork path and URL | Supported |
| Reader | Story and episode identifiers | `{storySlug}/episodes/{episode}/reader/{uuid}.jpg` | Registers media; Reader JSON must reference ID | Blocked |
| Canon | `storySlug`, `canonProjectSlug`, `canonObjectSlug`, `canonAssetTitle` | `{canonProjectSlug}/canon/{canonObjectSlug}/production/{uuid}.jpg` | Registers `media_assets` and `private_canon_assets` relationship | **Supported** |

For `concept` and `refined` stages, the production function uses deterministic stage/version paths appropriate to the destination. Production assets use UUID filenames.

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

Verify actual banner rendering; a successful object upload alone is incomplete.

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

For an existing episode replacement, follow the replacement runbook rather than guessing whether an existing filename should be retained. Production uploads may receive a new UUID path and therefore require verification of the returned database link.

## Canon image — supported profile

Canon images use the same GitHub queue/OIDC transport as other artwork but are linked through Canon-specific records rather than story or episode artwork columns.

Minimum production manifest:

```json
{
  "storySlug": "life-inside-the-dyson",
  "assetRole": "canon",
  "stage": "production",
  "workflowStatus": "draft",
  "versionNumber": 1,
  "canonProjectSlug": "life-inside-the-dyson",
  "canonObjectSlug": "white-dwarf-energy-limits",
  "canonAssetTitle": "Descriptive unique image title",
  "canonAssetRole": "reference",
  "canonAssetDescription": "What this image shows and why it belongs to the Canon object.",
  "canonSortOrder": 0,
  "canonIsPrimaryReference": false,
  "generationNotes": "Controlled Canon image upload."
}
```

Required identifiers:

- `storySlug` — must match the story linked to the Canon workspace;
- `canonProjectSlug` — exact existing Canon workspace slug;
- `canonObjectSlug` — exact existing `canon_key` for the Canon object;
- `canonAssetTitle` — non-empty logical title used in idempotency checks.

Optional Canon metadata:

- `canonAssetRole`, default `reference`;
- `canonAssetDescription`;
- `canonSortOrder`, non-negative integer;
- `canonIsPrimaryReference`, boolean;
- consistency/refinement notes when supported by the invoking route.

Expected effects:

1. upload genuine image bytes to the derived Canon Storage path;
2. register the object in `media_assets` with a source SHA-256 hash;
3. create the `private_canon_assets` relationship to the exact Canon object;
4. preserve story and episode artwork fields;
5. preserve story/episode workflow status;
6. return the asset ID, Storage path and public URL.

### Canon idempotency

For an existing Canon object, the production function checks the logical combination of Canon object, asset role and title. If that logical asset already exists with the same source hash, the existing asset is reused. If the same title and role exist with different bytes, the upload is rejected and an explicit replacement workflow is required.

This prevents a retry from silently creating duplicate Canon assets.

### Canon acceptance test

The supported profile was verified with `life-inside-the-dyson` → `white-dwarf-energy-limits`: three distinct approved images, one primary image, matching database relationships, and a clean workflow rerun without duplicate creation.

## Characters

A character reference is a Canon image, not a separate transport role. Use `assetRole: "canon"` with the exact Character Canon object's project slug and object slug.

Do not create an invented `character` transport role.

## Reader/Tiptap image — blocked profile

Intended behaviour:

1. upload and register the image in `media_assets`;
2. do not replace the episode's primary artwork;
3. return the media asset ID;
4. write that ID to the Tiptap image node;
5. retain `src` only as a fallback;
6. resolve approved Reader-visible media by ID at render time.

The current end-to-end workflow does not yet guarantee the required Reader document/Tiptap linkage. A model must stop and report **Reader profile blocked** rather than substituting episode artwork or an unregistered URL.

## Random-filename behaviour

Production filenames are intentionally derived by the production function and currently use generated UUID filenames for production assets. The queue folder name does not control the Storage filename.

Do not add an unsupported `filename` or `storagePath` field to a GitHub manifest and assume it will be honoured.

Connected-Supabase Storage maintenance may use an explicitly approved UUID destination as a separate route. Storage-only operations do not automatically register `media_assets` or relink content records.
