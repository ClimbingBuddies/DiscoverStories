# DiscoverStories Storage Management Action Specification

Version 1.0  
Date: 04 Aug 2026  
Status: Initial private-GPT standard

## Purpose

This specification defines the controlled connection between a private custom GPT and DiscoverStories image storage. It exposes only the operations needed to inspect, upload, copy and publish artwork. It does not expose delete or move operations.

## Authoritative storage model

| Visibility | Supabase bucket | Physical root | GPT input |
|---|---|---|---|
| Private | `stories` | Story UUID | Story slug plus a path relative to the story root |
| Public | `story-images` | Story slug | Story slug plus a path relative to the story root |

The Action resolves the story UUID from `public.stories.slug`. The GPT and user do not need to supply or remember UUIDs.

## Exposed operations

| Operation | Behaviour | Change risk |
|---|---|---|
| `storage_list` | Lists permitted objects for one story. | Read-only |
| `storage_inspect` | Returns existence and metadata for one object. | Read-only |
| `storage_upload` | Uploads one conversation image to the private `stories` bucket. | Creates one private object; never overwrites |
| `storage_copy` | Copies one object and preserves the source. | Creates one object; never overwrites |
| `storage_publish_batch` | Copies mapped private objects to `story-images`. | Dry-run first; creates public copies only after approval |

Delete and move/rename are excluded from Version 1.0. Periodic deletion remains a manual Supabase task.

## Authentication and security

1. The GPT Action uses a dedicated Bearer API key.
2. Only a SHA-256 hash of that key is stored in `public.storage_action_keys`.
3. Row Level Security is enabled on the key table and `anon` and `authenticated` receive no access.
4. The Edge Function uses the Supabase service role internally; the service-role key is never entered into ChatGPT or GitHub.
5. Each key contains an allowlist of operation names and may be disabled or expired.
6. Paths reject traversal, backslashes, control characters, uppercase letters and spaces.
7. Upload accepts one JPG, PNG or WEBP image up to 12 MB and only from an OpenAI temporary file URL.
8. Existing destinations are never overwritten.
9. Batch publishing supports at most 50 mapped files, must be previewed with `dryRun: true`, and rolls back copies created by a failed batch.

## Artwork rules

The Episode Artwork Production Specification remains authoritative:

- Episode and story-cover artwork: 1024 x 1024 pixels.
- Story banner: 1600 x 900 pixels.
- Lowercase predictable filenames with no spaces.
- JPG is preferred for standard illustration; PNG is reserved for a genuine transparency requirement.
- No embedded title, logo, watermark, episode number, UI or generated text.

Public database fields continue to store relative paths such as:

- `the-cartographers-dream/episodes/the-cartographers-dream-s01e01.jpg`
- `the-cartographers-dream/the-cartographers-dream-story-cover.jpg`
- `the-cartographers-dream/the-cartographers-dream-banner.jpg`

## Private GPT setup

1. Open ChatGPT on the web and go to **Explore GPTs > My GPTs > Create**.
2. In **Configure**, add the Storage instructions and conversation starters.
3. Under **Actions**, select **Create new action**.
4. Set Authentication to **API Key**, choose **Bearer**, and enter the dedicated Action key supplied during deployment.
5. Paste the OpenAPI schema from `docs/actions/discoverstories-storage-action.openapi.yaml`.
6. Save the GPT as **Only me**.
7. In Preview, test `storage_list`, then `storage_inspect`, then one private `storage_upload`.

## Required GPT instructions

The private GPT must apply these rules:

1. Resolve the exact story slug before calling a Storage Action.
2. Use `storage_list` and `storage_inspect` freely because they are read-only.
3. Before upload, confirm asset type, approved filename, story-relative private path and artwork dimensions.
4. Never invent a filename when the target path is ambiguous; ask the user.
5. Upload only to private storage. Publishing is a separate approval step.
6. Call `storage_publish_batch` with `dryRun: true` first and display the exact source-to-destination manifest.
7. Call the same batch with `dryRun: false` only after explicit user approval.
8. Never claim an image is public until the execution response reports `result: published`.
9. Use returned public paths as relative database paths; never store signed URLs.

## Initial acceptance test

| Stage | Test | Expected result |
|---|---|---|
| 1 | `storage_list` for one known story | Existing permitted objects returned |
| 2 | `storage_inspect` for one returned path | `exists: true` with metadata |
| 3 | Upload one uniquely named image to private storage | `result: uploaded`; no existing file changed |
| 4 | Inspect the uploaded image | The private object exists with correct MIME type and size |
| 5 | Preview one private-to-public mapping | `dryRun: true`, `ready: true`, no object copied |
| 6 | Approve and execute the same mapping | `result: published`; private source remains |

## Relationship to existing specifications

- Story Creation determines the image brief and continuity requirements.
- Episode Artwork Production controls canvas dimensions, composition, filename and image acceptance.
- Story SQL Insert and Wiki SQL Insert store relative public paths only after the image has been approved and published.
- This specification controls the separate Storage transport and publishing workflow.
