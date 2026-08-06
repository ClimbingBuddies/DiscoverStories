# DiscoverStories Storage Management Action Specification

Version 1.3
Date: 06 Aug 2026
Status: Verified standard; custom GPT `storage_move` not implemented

## Purpose

This specification defines the controlled connection between a private custom GPT and DiscoverStories image storage. It exposes only the operations needed to inspect, upload, copy and publish artwork. Move and delete are excluded from the private custom GPT Action.

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

Move and delete remain excluded from the private custom GPT Action in Version 1.3. Periodic deletion remains a manual Supabase task.

`storage_copy` is the supported relocation primitive. It can copy private-to-private, private-to-public, public-to-public or public-to-private while preserving the source. It does not convert image formats, update `media_assets`, relink story or episode records, or delete the source.

For the verified copy process, use [`docs/actions/storage-copy-runbook.md`](../actions/storage-copy-runbook.md). The [`storage-move-runbook.md`](../actions/storage-move-runbook.md) is restricted to chats with connected Supabase tools and is not a custom GPT Action.

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
- Story banner: 1280 x 720 pixels.
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
7. In Preview, test `storage_list`, then `storage_inspect`, one private `storage_upload` and one isolated `storage_copy`. `storage_move` must not appear as an available Action.

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
9. Do not call or claim access to `storage_move`; it is not implemented in the private custom GPT Action.
10. Use returned public paths as relative database paths; never store signed URLs.

## Initial acceptance test

| Stage | Test | Expected result |
|---|---|---|
| 1 | `storage_list` for one known story | Existing permitted objects returned |
| 2 | `storage_inspect` for one returned path | `exists: true` with metadata |
| 3 | Upload one uniquely named image to private storage | `result: uploaded`; no existing file changed |
| 4 | Inspect the uploaded image | The private object exists with correct MIME type and size |
| 5 | Preview one private-to-public mapping | `dryRun: true`, `ready: true`, no object copied |
| 6 | Approve and execute the same mapping | `result: published`; private source remains |

## Verified Storage copy acceptance tests

On 06 Aug 2026, the Storage Management Action was invoked from ChatGPT Work through the connected Supabase project using `pg_net` and a short-lived `storage_copy`-only Action key.

| Test | Source | Destination | Result |
|---|---|---|---|
| Public to public | Life Inside the Dyson Episode 4 PNG | Isolated public test path | HTTP 200; `result: copied` |
| Public to private | Life Inside the Dyson Episode 4 PNG | Story UUID private test path | HTTP 200; `result: copied` |

Both tests verified:

- the source remained in place;
- the destination did not exist before execution;
- the destination existed after execution;
- source and destination eTag, byte size and MIME type matched;
- no episode or `media_assets` record changed;
- the temporary Action key was removed after verification.

These tests prove that ChatGPT Work can trigger the deployed `storage_copy` function even when the custom Storage Action is not exposed as a direct chat tool. The controlled fallback is Supabase SQL execution → short-lived Action key → `pg_net` → Edge Function → response and Storage verification.

## Backend Storage move evidence — not a custom GPT acceptance test

On 06 Aug 2026, a Chat session with connected Supabase tools invoked `storage_move` through the connected Supabase project using a short-lived move-only Action key and `pg_net`.

| Test | Source | Destination | Result |
|---|---|---|---|
| Private to private | Life Inside the Dyson Episode 4 private copy-test PNG | New private directory with a renamed test filename | HTTP 200; `result: moved` |

Verification confirmed:

- the destination existed after execution;
- the original source path no longer existed;
- the destination retained eTag `2f29aaf209991409f5d0b9101c8dc146`;
- byte size remained 2,238,863 and MIME type remained `image/png`;
- no database record changed;
- the temporary Action key was removed.

The first invocation attempt was safely rejected before execution because the Action-key constraint did not yet allow `storage_move`. The allow-list was migrated, the Edge Function was deployed as version 2, and the single controlled retest succeeded.


This proves the Supabase backend pathway only. It does **not** prove or authorise `storage_move` in a private custom GPT. The operation is absent from the custom GPT OpenAPI schema, and the long-lived `private-gpt-initial` key does not allow it. Models must not attempt it as a custom GPT Action.

## Relationship to existing specifications

- Story Creation determines the image brief and continuity requirements.
- Episode Artwork Production controls canvas dimensions, composition, filename and image acceptance.
- Story SQL Insert and Wiki SQL Insert store relative public paths only after the image has been approved and published.
- This specification controls the separate Storage transport and publishing workflow.

## Version history

| Version | Date | Change |
|---|---|---|
| 1.3 | 06 Aug 2026 | Removed `storage_move` from the private custom GPT OpenAPI contract and long-lived key. Marked it not implemented for custom GPTs while preserving connected-Supabase backend evidence. |
| 1.2 | 06 Aug 2026 | Added Chat-executable `storage_move`, the Action-key allow-list migration, OpenAPI operation, private-to-private acceptance evidence and the Storage Move Runbook. |
| 1.1 | 06 Aug 2026 | Added the verified ChatGPT Work `storage_copy` execution path, public-to-public and public-to-private evidence, metadata verification, short-lived-key cleanup and the operational runbook. Corrected the banner target to 1280 × 720. |
| 1.0 | 04 Aug 2026 | Initial private-GPT Storage Management standard. |
