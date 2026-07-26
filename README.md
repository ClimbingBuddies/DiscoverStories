# Discover Stories

Discover Stories is a story-production and reading/listening platform built with Next.js and Supabase.

The project supports:

- long-form stories developed in ten-episode review batches,
- spoiler-aware public wikis backed by private story-bible data,
- reusable character, location, object and canon knowledge,
- evidence-based episode artwork production,
- optional single-narrator audio with provider experimentation,
- Supabase Storage assets displayed through the website.

## Current architecture

The current operating model is documented in:

- [`documentation/architecture/story-production-pipeline.md`](documentation/architecture/story-production-pipeline.md)
- [`documentation/architecture/production-knowledge-model.md`](documentation/architecture/production-knowledge-model.md)
- [`documentation/specifications/episode-artwork-production-specification.md`](documentation/specifications/episode-artwork-production-specification.md)
- [`documentation/specifications/episode-artwork-production-guide.md`](documentation/specifications/episode-artwork-production-guide.md)

Git history preserves retired prototype decisions. The repository should contain one current architecture rather than parallel versioned standards.

## Source-of-truth summary

| Information | Home |
|---|---|
| Story and episode content | Supabase `stories` and `episodes` |
| Story bible, wiki, canon and knowledge | Supabase wiki tables |
| Production profiles and task-ready bundles | Supabase production tables |
| Artwork and audio files | Supabase Storage, registered through `media_assets` |
| Architecture, specifications and migrations | GitHub |
| Public presentation | Next.js website |

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Required environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Database changes

Database changes are stored as reviewed SQL migrations under [`database/`](database/).

Important rules:

- Story and wiki loaders must be safe to rerun.
- Creative recommendations such as word-count ranges are reported, not enforced by SQL.
- A published story may intentionally contain no episodes for catalogue and empty-state testing.
- Story loads preserve existing audio and approved production assets unless explicitly authorised otherwise.
- The season-aware episode key is `(story_id, season_number, episode_number)`.

The production foundation migration is:

- [`database/011_story_production_foundation.sql`](database/011_story_production_foundation.sql)

## Image upload automation

The project can sync Supabase Storage story covers, banners and episode artwork into database path fields.

Relevant files:

- `database/007_image_upload_automation.sql`
- `database/IMAGE-UPLOAD-AUTOMATION.md`
- `supabase/functions/sync-storage-image/index.ts`

The sync process must be verified through `storage_image_sync_errors`; an uploaded file should not be considered linked until its database path and website display have been checked.

## Deployment

The website is deployed through Vercel. Production data and media are hosted in the connected Supabase project.
