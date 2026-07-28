# Story Creation Specification

**Status:** Current project standard  
**Project:** Discover Stories

## 1. Purpose

This specification governs the creative development of a story from approved brief through a private story bible, a 100-episode roadmap, complete episode prose, continuity controls and production-ready metadata.

The Draft and Review Pipelines may each run repeatedly. Draft creates or revises creative material; Review assesses quality, continuity and KPIs and authorises progression. Review approval is not publication approval.

## 2. Source brief

Every story begins with one approved brief containing:

- working title and lowercase hyphenated slug,
- genre and intended audience,
- one-sentence premise,
- repeatable story promise,
- central seasonal question,
- tone, point of view and language level,
- required elements,
- exclusions,
- intended season consequence.

Later invention may deepen the brief but must not quietly replace its premise, audience or emotional promise.

## 3. Private story bible

The private story bible records:

- world and ordinary life,
- rules, limits and costs,
- character goals, fears, strengths, flaws and relationships,
- timeline and history,
- factions, locations and important objects,
- mysteries, secrets and reveal ranges,
- canon rules,
- character knowledge by episode,
- visual identity and recurring motifs.

Public wiki wording is derived later. It must not replace the complete private explanation.

## 4. Season architecture

A season is planned as ten connected arcs of approximately ten episodes:

| Episodes | Function |
|---|---|
| 1–10 | Promise and disruption |
| 11–20 | Commitment |
| 21–30 | Expansion |
| 31–40 | Pressure |
| 41–50 | Midpoint transformation |
| 51–60 | Aftershock |
| 61–70 | Convergence |
| 71–80 | Loss and narrowing choices |
| 81–90 | Final approach |
| 91–100 | Climax and consequence |

Episodes 1–10 are written in full. Episodes 11–100 are stored as individually planned roadmap blocks by default. Each block is one draft presentation record titled, for example, `Episodes 11–20`, containing ten numbered titles and summaries. A later Draft run may develop a selected block into full episodes.

## 5. Episode production card

Each episode has:

- season and episode number,
- spoiler-controlled summary,
- opening image,
- viewpoint objective,
- obstacle,
- meaningful turn,
- ending consequence or hook,
- continuity changes,
- linked characters, locations, objects and concepts,
- candidate visual beat.

The candidate visual beat is not the final artwork decision. Final evidence-based scene selection belongs in `episode_art_direction` after the episode prose is approved.

## 6. Writing standard

Each episode requires a clear opening situation, objective, obstacle, meaningful turn and ending consequence.

Most episodes will often fall around 900–1,300 words, but this is creative guidance only. Shorter or longer episodes are valid when the dramatic unit requires them. SQL loaders calculate and report word counts; they never reject prose because it falls outside a recommendation.

Dialogue should reveal character, conflict or decision. Description should favour memorable specifics over inventories. Point of view, knowledge access, injuries, possessions, travel time and world rules must remain consistent.

Creative prose contains no synthesis instructions, speaker labels, music cues or provider-specific audio markup.

## 7. Continuity and reveal control

For every important fact, record:

- what is true,
- what each character believes,
- when the reader may learn it,
- when a character learns or rejects it,
- what later episodes depend on it.

When an approved episode changes, review all later outlines, linked wiki entries, canon, production bundles, artwork and audio for consequences.

## 8. Knowledge hand-off

After a batch is approved:

1. Store story and episode prose in `stories` and `episodes`.
2. Upsert reusable entities into the wiki knowledge model.
3. Link each episode to the entries it actually uses through `episode_wiki_entries`.
4. Store private context, character profiles, canon and knowledge state.
5. Add visual profiles only for recurring entries where consistency matters.
6. Build or refresh production bundles only when production begins.

The private Story Bible is the internal production knowledge base. The Studio Wiki is the draft/review presentation of private and planned material. The Public Wiki is separate and contains only published, reader-safe content.

## 9. Review gates

The review process distinguishes:

- brief issues,
- interpretation issues,
- output issues,
- continuity issues,
- production issues.

The Review Pipeline must apply the Story Quality Index (SQI) after the draft package is complete and before authorising progression. SQI is a 100-point story-level KPI covering story promise and hook, character appeal and agency, plot and arc structure, emotional engagement, pacing and dramatic load, world and atmosphere, dialogue and voice, originality and specificity, continuity and causality, and episode endings.

The authoritative scoring model, thresholds, evidence requirements and assessment template are defined in `documentation/specifications/story-quality-index.md`. The Review Pipeline and its Batch Review Record remain responsible for the findings and final decision.

A Review run may assess any Draft run or roadmap block, including revised ideas. Development of a later full-script batch may be authorised by Review, but Draft may prepare or revise roadmap material before that authorisation.

## 10. Definition of done

A batch is complete when:

- the brief and private bible remain coherent,
- the ten episodes form one connected movement,
- continuity and reveal timing are reconciled,
- episode production cards are complete,
- reusable knowledge has been identified,
- the next arc still fits the season roadmap,
- the SQI assessment has been completed,
- and the relevant Draft or Review run has a recorded outcome. Publication requires a separate Public Pipeline decision.
