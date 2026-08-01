# Audio Production Specification

**Version:** 1.1  
**Date:** 30 Jul 2026  
**Status:** Current project standard — initial preview pipeline implemented  
**Scope:** Private Draft audio generation, registration, review and later promotion

## 1. Purpose

This specification defines how Discover Stories converts approved or test narration text into versioned audio without publishing it accidentally.

The current implementation is a contained preview pipeline. It can generate a short MP3, store it privately, register both the generation run and media asset, and return a temporary signed review link. It does not alter the public website audio pointer.

## 2. Current production decision

The economical default is one narrator per story. The narrator performs narration and dialogue in a consistent voice. Full-cast and enhanced narration remain supported future experiments, not the normal launch workflow.

The implemented test provider is OpenAI using `gpt-4o-mini-tts`. The initial successful test used the `marin` voice.

## 3. Timing and authority

Production audio is created only after the story text is approved for narration. Drafting and audio production are separate stages because narrative changes can otherwise require paid regeneration.

Short preview generations may be run earlier to test voice, pronunciation, pacing and the technical pipeline. Preview generation is not approval to publish.

An episode becomes production-audio-ready only when:

- its script has passed creative review;
- the intended source text is identified;
- the source hash is recorded;
- relevant Private Canon pronunciation, character voice, emotional, cultural and continuity rules have been consulted;
- and an explicit production decision has been made.

## 4. Implemented components

| Component | Responsibility |
|---|---|
| `story-audio-production` Edge Function | Validates and generates a private preview, registers records and returns a signed URL |
| OpenAI Speech API | Converts the supplied text and instructions into MP3 audio |
| Private `story-audio` bucket | Stores versioned MP3 files; it is not a public bucket |
| `audio_generation_runs` | Stores provider request identity, state, output path, notes and errors |
| `media_assets` | Stores the versioned Draft audio asset and its storage metadata |
| `episodes.audio_url` | Remains the explicit pointer to the currently approved public/playable asset |

The Edge Function is deployed with JWT verification enabled. It also requires Supabase service-operator authorisation inside the function. It must never be called directly from a public browser client.

Secrets are supplied through the Edge Function environment:

- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

No secret value is stored in GitHub.

## 5. Preview request contract

The function accepts `POST` only with `action: generate-preview` and these inputs:

| Input | Requirement |
|---|---|
| `storySlug` | Lowercase story slug |
| `seasonNumber` | Positive integer; defaults to `1` |
| `episodeNumber` | Positive integer |
| `text` | Required preview text; maximum 1,200 characters |
| `voice` | Supported OpenAI voice; defaults to `marin` |
| `instructions` | Narration direction; maximum 500 characters |

The current supported voice allow-list is maintained in the function source. Unsupported voices are rejected before a paid generation call.

Example internal request body:

```json
{
  "action": "generate-preview",
  "storySlug": "aristotle-the-shape-of-thought",
  "seasonNumber": 1,
  "episodeNumber": 1,
  "text": "Short narration text for a private pipeline test.",
  "voice": "marin",
  "instructions": "Read as a calm, natural audiobook narrator with measured pacing."
}
```

The authorisation header must be added only by a secure operator or server-side process. Never paste or commit the service-role key into a request example, script or client application.

## 6. Generation process

1. Require a valid operator request and reject non-`POST` methods.
2. Validate the story slug, season number, episode number, preview text, voice and instructions.
3. Resolve the existing `stories` and `episodes` records. The pipeline does not create or rewrite story content.
4. Calculate a SHA-256 source hash over the model, voice, instructions and exact input text.
5. Check `audio_generation_runs` for an existing completed run with the same story, episode and source hash.
6. If an identical completed run exists, reuse its private object and return a new one-hour signed URL without buying the same audio again.
7. Determine the next episode audio version number and create an `audio_generation_runs` row with `run_status = running`.
8. Call the OpenAI Speech API and request MP3 output.
9. Validate that the returned payload is plausibly an MP3 and is not empty.
10. Upload it to the private `story-audio` bucket with overwrite disabled.
11. Register one episode-owned `media_assets` row with `asset_type = audio_file`, `lifecycle_status = draft`, the source hash and version number.
12. Mark the generation run `completed` and record its private storage path.
13. Read the storage folder back to verify that the expected object exists.
14. Return a one-hour signed review URL.

At no point does preview generation update `episodes.audio_url`, approve the asset or expose the bucket publicly.

## 7. Versioning and storage path

Preview files use this pattern:

```text
<story-slug>/audio/s<season>e<episode>/<story-slug>-s<season>e<episode>-preview-v<version>.mp3
```

Example:

```text
aristotle-the-shape-of-thought/audio/s01e01/aristotle-the-shape-of-thought-s01e01-preview-v01.mp3
```

Uploads use `upsert: false`. A new version receives a new object path; an existing approved file is not overwritten.

## 8. Database registration

### 8.1 `audio_generation_runs`

Each attempt records:

- story and episode;
- provider and voice identifier;
- production mode;
- source script hash;
- `running`, `completed` or `failed` status;
- output storage path when successful;
- structured quality and purpose notes;
- completion time;
- error details when unsuccessful.

Failed runs are retained for audit and diagnosis.

### 8.2 `media_assets`

A successful preview creates a versioned episode asset with:

- `story_id = null`;
- the target `episode_id`;
- `asset_type = audio_file`;
- `storage_provider = supabase`;
- the private storage path;
- `public_url = null`;
- `mime_type = audio/mpeg`;
- the file size;
- `lifecycle_status = draft`;
- `is_approved = false`;
- version number, source hash and generation notes.

`media_assets` requires either a story parent or an episode parent, not both. Episode audio therefore uses the episode as its sole parent.

## 9. Failure handling and rollback

If generation fails after the run row is created, the run is marked `failed`, its error is recorded and the error is returned to the operator.

If the MP3 upload succeeds but `media_assets` registration fails, the newly uploaded object is removed before the run is marked failed. This prevents an unregistered orphan file.

The first live test exposed the parent constraint because both `story_id` and `episode_id` were initially supplied to `media_assets`. The database rejected that registration, the function removed the temporary MP3, and the failed run remained as an audit record. Version 2 corrected the insert to use only `episode_id`.

## 10. Completed end-to-end test

On 30 Jul 2026, the pipeline completed a private test against Draft Episode 1 of *Aristotle — The Shape of Thought*:

- model: `gpt-4o-mini-tts`;
- voice: `marin`;
- input: 197 characters;
- output: valid MP3 of approximately 191 KB;
- storage: private `story-audio` bucket;
- records: one completed `audio_generation_runs` row and one versioned Draft `media_assets` row;
- public result: `episodes.audio_url` remained unchanged and the website player was not updated.

The test proves generation, storage, database registration, read-back verification and private signed review access. It does not constitute production voice approval.

## 11. Narration script and Private Canon

The canonical story remains `episodes.script_text`. A provider-ready narration script may be registered as a `media_assets` record of type `narration_script`.

Provider preparation may adjust punctuation, pronunciation, pauses or supported speech instructions, but it must not silently rewrite story meaning.

Before full-episode generation, prepare a production bundle containing:

- the approved episode text and source hash;
- the selected narrator and provider settings;
- relevant Private Canon pronunciation and voice guidance;
- pacing and emotional direction;
- the intended production mode;
- and the approved output format.

## 12. Review and promotion

Review at least:

- intelligibility;
- pronunciation;
- pacing;
- emotional appropriateness;
- dialogue clarity;
- consistency across episodes;
- mobile playback quality;
- duration and cost.

Promotion is a separate explicit operation. A future approved promotion process may mark the selected asset approved and update `episodes.audio_url`. The current preview function deliberately cannot perform either action.

## 13. Operator checklist

Before generation:

- confirm the exact story, season and episode;
- confirm that a preview or production generation has been authorised;
- confirm the intended text, voice and instructions;
- check relevant Private Canon guidance;
- confirm that generation may incur provider cost.

After generation:

- confirm the run is `completed`;
- confirm the `media_assets` row has the correct episode parent and Draft lifecycle;
- confirm the private object exists and the signed URL plays;
- confirm `episodes.audio_url` is unchanged for a preview;
- record review notes and the accept/reject decision.

## 14. Definition of done

Preview audio is complete when the exact source identity is known, the completed run and Draft asset are registered, the private MP3 has passed read-back verification, and the public episode pointer remains unchanged.

Production audio is complete only when the source script and hash are approved, the selected run has passed quality review, the approved master is registered, and a separately authorised promotion operation has updated the website pointer.
