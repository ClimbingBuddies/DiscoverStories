# Story Loading Specification

**Status:** Current project standard

## 1. Purpose

This specification governs idempotent loading of one story and a controlled episode batch into Supabase.

## 2. Stable identity

- Story: `stories.slug`
- Episode: `(story_id, season_number, episode_number)`

The obsolete two-column episode key is not used.

## 3. Required behaviour

A story load must:

1. Run in one transaction.
2. Resolve or upsert the story by slug.
3. Insert or update exactly the intended episode range.
4. Update approved narrative fields only.
5. Calculate `word_count` from stored `script_text`.
6. Preserve unrelated production data.
7. Verify identity, count, sequence and required content.
8. Commit itself or fail clearly.

## 4. Fields owned by the story loader

The loader may update:

- story title and descriptions,
- story cover and banner paths when supplied,
- episode title,
- episode summary,
- episode script,
- calculated word count,
- episode artwork path when supplied,
- explicitly authorised visibility status.

## 5. Fields preserved by default

The loader must not overwrite:

- `audio_url`,
- `duration_seconds`,
- asset history in `media_assets`,
- `published_at` unless publication is the explicit purpose,
- `created_at` or audit ownership,
- production bundles,
- art-direction records,
- audio-generation run history.

## 6. Word count

Word count is calculated and displayed for review. Creative ranges are recommendations, not SQL constraints. A script may fail only when required content is blank or structurally invalid, not because of its length.

## 7. Status

New rows default to draft unless publication is explicitly authorised. A published story may legally contain no episodes; this is a supported catalogue and application-test state.

## 8. Safety rules

- No blanket delete.
- No delete-and-recreate testing.
- No schema changes inside story seed files.
- No signed storage URLs when a relative path is available.
- No secrets or service keys in SQL.
- No assumption that absence from the current batch means retirement.

## 9. Verification

Post-commit verification reports:

- story slug and title,
- season and episode numbers,
- episode status,
- word count,
- artwork path,
- presence of audio without exposing or modifying it,
- missing or duplicate intended rows.

## 10. Definition of done

A story load is complete when it is safe to rerun, updates the intended narrative batch without duplicates, preserves production outputs and returns clear verification evidence.