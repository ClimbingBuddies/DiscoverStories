# Audio Platform Initial Draft Process

**Status:** Current project standard  
**Scope:** First structured creative package for a new Audio Platform story  
**Owner:** Audio Platform  
**Last updated:** 29 Jul 2026

This process turns a new story idea into a structured Initial Draft that is substantial enough to discuss and develop without committing to full production. It is separate from Creative Development, Review and Publication.

## 1. Entry command

Use the project-specific command:

> **Audio Platform Initial Draft**

A title, category, audience, premise or other creative instructions may follow the command. When information is missing, use the available project context and identify assumptions in the Initial Draft rather than silently treating them as approved canon.

## 2. Purpose

The Initial Draft answers:

> Is there a coherent story direction worth developing further?

It creates the first working interpretation of the idea. It does not claim that the story is complete, review-ready or approved for publication.

## 3. Required Initial Draft package

The normal Initial Draft contains:

1. **Story identity and brief**
   - working title and lowercase slug;
   - category, genre and intended audience;
   - premise, story promise and central question;
   - tone, themes, required elements, exclusions and ending direction.

2. **Initial private Story Bible**
   - world and ordinary life;
   - major rules and costs;
   - principal characters, goals, fears, relationships and planned arcs;
   - major locations, factions, objects and unresolved mysteries;
   - early canon, character-knowledge and visual-continuity notes.

3. **Episodes 1–10 opening map**
   - ten individually numbered episode titles and summaries;
   - each episode's objective, obstacle, turn, consequence and ending hook;
   - the collective opening-arc purpose and Episode 10 transition;
   - full prose is not required during the Initial Draft unless explicitly requested.

4. **Episodes 11–100 roadmap**
   - nine ten-episode roadmap blocks for Episodes 11–100;
   - each block's objective, escalation, reversal, consequence and bridge;
   - individually numbered planned episode titles or short summaries where useful;
   - future plans remain flexible and may change during Creative Development.

5. **Initial visual direction**
   - recurring-character visual records;
   - cover and banner concepts;
   - selected low-resolution concept art or concept briefs sufficient to test character, setting, mood and visual identity;
   - concept art is exploratory and normally remains unlinked.

6. **Initial quality baseline**
   - an optional development SQI baseline when enough material exists;
   - strengths, uncertainties, risks and questions for Creative Development;
   - the baseline is diagnostic and is not a Review Pipeline decision.

## 4. Boundaries

The Initial Draft Process must not:

- automatically create ten full episode scripts;
- treat roadmap plans as completed or playable episodes;
- publish any story, episode, Wiki or artwork;
- automatically insert or update Supabase records;
- perform the formal Review Pipeline;
- treat exploratory ideas as approved canon without recording the decision.

A Supabase load may occur only under a separate explicit command, normally during Creative Development.

## 5. Completion report

An Initial Draft is complete when the response identifies:

| Area | Required result |
|---|---|
| Story brief | Complete / assumptions identified / blocked |
| Initial Story Bible | Complete / blocked |
| Episodes 1–10 map | Complete / blocked |
| Episodes 11–100 roadmap | Complete / blocked |
| Visual direction | Complete / optional / blocked |
| Initial SQI baseline | Completed / not yet useful |
| Open questions and risks | Recorded |
| Supabase updated | No, unless separately authorised |
| Next process | Creative Development |

## 6. Handoff to Creative Development

After presenting the Initial Draft, ask:

> The Initial Draft is complete. Would you like to **Audio Platform Begin Creative Development** for the whole draft or revise something specific?

The user may nominate the whole package, a single character, episode range, roadmap block, mystery, artwork direction, SQI finding or another precise scope.

## 7. Reusable instruction

> **Audio Platform Initial Draft**
>
> Create the Initial Draft for “[TITLE]”. Prepare the approved working brief, initial private Story Bible, ten-episode opening map for Episodes 1–10, roadmap blocks for Episodes 11–100, initial visual direction and a diagnostic SQI baseline where useful. Do not automatically write full episode prose, update Supabase, begin formal Review or publish. Present assumptions, risks and development questions, then offer to begin Audio Platform Creative Development for the whole draft or a specific area.

## 8. Supporting specifications

- Draft process router: `documentation/pipelines/audio-platform-draft-pipeline.md`
- Creative Development: `documentation/pipelines/audio-platform-creative-development-process.md`
- Review Pipeline: `documentation/pipelines/audio-platform-review-pipeline.md`
- Story creation: `documentation/specifications/story-creation-specification.md`
- Story Quality Index: `documentation/specifications/story-quality-index.md`
- Episode artwork: `documentation/specifications/episode-artwork-production-specification.md`
