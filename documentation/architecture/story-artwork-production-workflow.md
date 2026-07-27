# Story Artwork Production Workflow

**Status:** Implemented foundation  
**Date:** 27 Jul 2026  
**Project:** Discover Stories

## Purpose

This workflow automates the safe transition from generated artwork to a linked Supabase story asset. It supports low-resolution concepts, refined images and final production artwork while using one current artwork pointer per story or episode.

## Visibility rule

A story undergoing artwork production is placed into `draft` or `review`. All non-archived episodes for that story are placed into the same status.

While the story is in `draft` or `review`, these fields may point to the current concept, refined image or final production image:

- `stories.cover_image_path`
- `stories.banner_image_path`
- `episodes.artwork_path`

No separate concept-pointer columns are required. `media_assets` retains the version and lifecycle history.

The story and episodes are returned to `published` only after the external release process verifies all required content and assets.

## Secure entry point

Supabase Edge Function:

```text
story-artwork-production
```

The function has Supabase JWT verification enabled and performs an additional application-level check that the authenticated user has `profiles.is_admin = true`.

The function uses the server-only `SUPABASE_SERVICE_ROLE_KEY` supplied by the Edge Function runtime. The service-role key must never be placed in browser code, source control or public environment variables.

No public Storage upload policy is required. Anonymous and ordinary authenticated users do not receive direct write access to `story-images`.

## Supported actions

### 1. Set story workflow status

JSON request:

```json
{
  "action": "set-status",
  "storySlug": "echoes-under-the-city",
  "status": "review"
}
```

Allowed statuses are `draft` and `review`.

The action updates the story and all non-archived episodes.

### 2. Upload and link one artwork file

Send a `multipart/form-data` request containing:

| Field | Required | Meaning |
|---|---:|---|
| `action` | Yes | `upload` |
| `storySlug` | Yes | Existing story slug |
| `assetRole` | Yes | `cover`, `banner` or `episode` |
| `stage` | Yes | `concept`, `refined` or `production` |
| `workflowStatus` | Yes | `draft` or `review` |
| `versionNumber` | Yes | Positive integer |
| `seasonNumber` | Episode only | Positive integer |
| `episodeNumber` | Episode only | Positive integer |
| `generationNotes` | No | Prompt, provider or review note |
| `file` | Yes | JPEG, PNG or WebP, maximum 12 MB |

The function:

1. verifies the admin user;
2. resolves the story and, when applicable, the exact season and episode;
3. places the full story into the requested safe workflow status;
4. generates the canonical filename;
5. uploads the file to `story-images`;
6. creates or updates the corresponding `media_assets` record;
7. updates the single current story or episode image pointer;
8. verifies that the Storage object exists;
9. returns the path, public URL and lifecycle result.

### 3. Verify a batch

JSON request:

```json
{
  "action": "verify",
  "storySlug": "echoes-under-the-city",
  "seasonNumber": 1,
  "startEpisode": 1,
  "endEpisode": 10
}
```

The response reports:

- expected and found episode counts;
- missing episode numbers;
- expected asset count;
- current story and episode paths;
- Storage existence;
- `media_assets` registration;
- public URLs;
- overall `complete` or `incomplete` status.

The workflow must not be described as complete unless all expected assets are uploaded, registered and linked.

## Canonical filenames

### Concept

```text
<slug>/<slug>-cover-concept-01.jpg
<slug>/<slug>-banner-concept-01.jpg
<slug>/episodes/<slug>-s01e01-concept-01.jpg
```

### Refined

```text
<slug>/<slug>-cover-refined-01.jpg
<slug>/<slug>-banner-refined-01.jpg
<slug>/episodes/<slug>-s01e01-refined-01.jpg
```

### Production

```text
<slug>/<slug>-cover.jpg
<slug>/<slug>-banner.jpg
<slug>/episodes/<slug>-s01e01.jpg
```

Concept and refined versions use numbered filenames. The production filename is the stable current website asset and may be replaced only through the controlled workflow.

## Asset registration

Every uploaded image is registered in `media_assets` with:

- the story ID;
- the episode ID where applicable;
- asset type;
- storage path and public URL;
- MIME type and size;
- lifecycle status;
- version number;
- approval state;
- generation and uploader notes.

Lifecycle mapping:

| Stage | Asset type | Lifecycle | Approved |
|---|---|---|---:|
| Concept | `concept_image` | `concept` | No |
| Refined | `refined_image` | `refined` | No |
| Production cover | `cover_image` | `approved` | Yes |
| Production banner | `story_banner` | `approved` | Yes |
| Production episode | `episode_image` | `approved` | Yes |

## Access model

| Component | Access |
|---|---|
| Public website | Read published stories and episodes under existing RLS/API rules |
| Admin production UI | Authenticated Supabase session plus `profiles.is_admin = true` |
| Edge Function | Server-only service role for Storage and database writes |
| Direct public Storage upload | Not permitted |
| Legacy SQL backfill | `service_role` only |

## Current deployment

The `story-artwork-production` Edge Function is deployed to the `ai-audio-stories` Supabase project with JWT verification enabled.

The legacy `sync_existing_story_images` database function has been restricted to `service_role`. It remains available only as an administrative backfill for files placed in Storage outside the normal workflow.

## Remaining application work

The backend foundation is deployed. A website production screen is still required to make the workflow convenient for the user. It should provide:

1. story selection;
2. draft/review status control;
3. batch drag-and-drop or generated-file intake;
4. automatic role, season and episode mapping;
5. upload progress and per-file errors;
6. concept review and regeneration controls;
7. final batch verification;
8. explicit republish action after all production checks pass.

Until that production screen is built, the Edge Function can be called by an authenticated admin client or server-side tool.
