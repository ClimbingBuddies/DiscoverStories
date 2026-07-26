# Audio Production Specification

**Status:** Current project standard

## 1. Current production decision

The economical default is one narrator per story. The narrator performs narration and dialogue in a consistent voice. Full-cast and enhanced narration remain supported experiments, not the normal launch workflow.

## 2. Timing

Audio is produced only after the story text is approved for narration. Drafting and audio production are separate stages because narrative changes can otherwise require expensive regeneration.

An episode becomes audio-ready only when:

- its script has passed creative review,
- the intended source text is identified,
- its source hash is recorded,
- and an explicit production decision has been made.

## 3. Configuration and experimentation

- `story_audio_voice_settings` stores the preferred story narrator/provider configuration.
- `voice_profiles` stores reusable voice definitions.
- `story_voice_pack` stores approved or experimental alternatives.
- `story_speaker_voices` remains available for future enhanced narration or full-cast production.
- `audio_generation_runs` records each provider experiment and its outcome.

The existence of advanced voice tables does not require their use in the default pipeline.

## 4. Generation runs

Each audio-generation run records:

- story and episode,
- provider and provider voice identifier,
- reusable voice profile when applicable,
- production mode,
- source script hash,
- run status,
- output storage path,
- duration,
- estimated and actual cost where available,
- quality notes,
- error details,
- accepted or rejected outcome.

This permits direct comparison of Azure and other providers without changing the story’s approved narrator configuration.

## 5. Narration script

The canonical story remains `episodes.script_text`. A provider-ready narration script may be registered as a `media_assets` record of type `narration_script`.

Provider preparation may adjust punctuation, pronunciation, pauses or supported SSML, but it must not silently rewrite story meaning.

## 6. Asset and pointer model

- `audio_generation_runs` stores experiments.
- `media_assets` stores accepted masters, narration scripts and audio history.
- `episodes.audio_url` remains the website pointer to the currently approved playable file.

An existing approved audio file is never overwritten merely because the episode script changes. A changed script makes the old run visibly stale through its source hash.

## 7. Quality review

Review at least:

- intelligibility,
- pronunciation,
- pacing,
- emotional appropriateness,
- dialogue clarity,
- consistency across episodes,
- mobile playback quality,
- duration and cost.

## 8. Definition of done

Audio is complete when the source script and hash are known, the selected run has passed review, the approved master is registered, and the website pointer references the accepted file.