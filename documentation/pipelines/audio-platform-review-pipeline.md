# Audio Platform Review Pipeline

**Status:** Current project standard  
**Scope:** Quality assessment, continuity review and progression decisions  
**Owner:** Audio Platform  
**Last updated:** 28 Jul 2026

This is the authoritative runbook for assessing an Audio Platform draft before it progresses. The Draft Pipeline creates and structurally checks material. The Review Pipeline assesses it. The Public Pipeline releases it.

## 1. Review purpose

The Review Pipeline answers:

> Is this story package strong enough, coherent enough and ready for the next authorised stage?

It must assess both:

- **brief compliance** — whether the output follows the approved creative instruction; and
- **output quality** — whether the resulting story is compelling, coherent and fit for its intended audience.

A Review run must not quietly rewrite the story. It records evidence, required corrections and one explicit decision.

## 2. Review entry criteria

Begin Review only when the relevant Draft package is available:

- approved brief;
- private Story Bible;
- 100-episode roadmap;
- Episodes 1–10 as full prose for the initial batch, or the selected later range;
- episode production cards;
- Studio Wiki/continuity material where included;
- artwork or production metadata where those are in scope.

Episodes 11–100 may be reviewed as roadmap blocks. A roadmap block contains ten planned episode summaries and does not require ten completed episode rows.

## 3. Mandatory Review sequence

### 1. Confirm scope and source material

Record the story, season, episode range or roadmap block, Draft run and revision being assessed. Read the source brief and private Story Bible before judging the prose.

### 2. Check brief compliance

Confirm premise, audience, story promise, tone, central question, required elements, exclusions and ending direction. Record brief and interpretation findings separately from output findings.

### 3. Apply the Story Quality Index

Apply the authoritative [Story Quality Index](../specifications/story-quality-index.md) to the complete assessment unit.

For the initial batch, read Episodes 1–10 as one opening arc and assess them against the roadmap. Score all ten categories, record evidence and calculate the total.

The SQI is a gate measurement, not a generation target:

- **80 or higher** is required for Approve batch or Promote;
- no category may be below half of its maximum;
- critical findings block progression regardless of score.

### 4. Review narrative and continuity evidence

Check:

- character goals, agency, knowledge and relationships;
- episode objectives, obstacles, turns and consequences;
- pacing and duplication;
- escalation across the batch;
- central mystery and reveal timing;
- world rules, timeline, injuries, possessions and travel;
- Episode 10's consequence, revelation or choice;
- fit with the next roadmap block.

### 5. Review Wiki and spoiler control

Confirm:

- private Story Bible material remains private;
- Studio Wiki can support draft/review work;
- public wording does not expose unreleased information;
- episode references resolve to real episode rows;
- roadmap-block references do not pretend Episodes 11–20 already exist individually;
- reveal levels and knowledge states are consistent.

### 6. Review artwork and production readiness

Where in scope, check that artwork represents the actual episode moment, preserves character continuity, communicates emotion, uses the approved format and path, and is technically displayable.

Audio is not required for Review approval. A nullable `audio_url` may remain empty.

### 7. Create the Batch Review Record

Record the SQI, evidence, strengths, weaknesses, findings, corrections, unresolved risks and decision. The record must distinguish:

- brief;
- interpretation;
- output;
- continuity;
- production.

## 4. Review decisions

| Decision | Meaning |
|---|---|
| **Revise** | Correct identified material before reassessment |
| **Hold** | Pause because the brief, concept, roadmap or evidence needs further consideration |
| **Approve batch** | Accept the assessed batch and authorise the next development batch |
| **Promote** | Authorise the assessed material to enter the Public Pipeline; publication is still separate |
| **Stop** | Do not continue the current story direction |

A score alone never changes status or publishes content. The decision must be explicit.

## 5. Batch Review Record

Every Review run must contain:

| Field | Required content |
|---|---|
| Story | Story id, slug and title |
| Scope | Season, episode range or roadmap block |
| Source | Draft run/version assessed |
| Brief findings | Compliance and interpretation findings |
| SQI | Ten category scores, total and assessment notes |
| Quality findings | Evidence-linked output findings |
| Continuity | Canon, knowledge, timeline and reveal results |
| Wiki | Private/Studio/Public separation and reference results |
| Artwork | Asset findings where applicable |
| Corrections | Required changes, owner and re-review condition |
| Decision | Revise, Hold, Approve batch, Promote or Stop |
| Reviewer | Reviewer and date |

## 6. Completion rules

A Review run is complete only when:

- the scope is recorded;
- the source material was read;
- every SQI category has a score and evidence;
- findings are classified by severity and type;
- continuity and Wiki checks are reported;
- artwork/production checks are reported when applicable;
- required corrections are explicit;
- one decision is recorded.

The Review Pipeline may authorise progression, but it does not publish. Publication belongs exclusively to the Public Pipeline.

## 7. Re-review

After corrections, reassess only the affected categories when the change is contained. Recalculate the full SQI whenever a correction changes the brief, central relationship, opening arc, major reveal, roadmap direction or episode ending.

Always retain the previous assessment so SQI movement can be seen over time.

## 8. Reusable instruction

> **Audio Platform Review Pipeline**
>
> Review “[TITLE]” using the authoritative Review Pipeline and Story Quality Index. Assess the approved brief, private Story Bible, roadmap and the requested episode range. Read Episodes 1–10 as one opening arc. Score every SQI category with evidence, identify brief/interpretation/output/continuity/production findings, complete the Wiki and production checks, and record one decision: Revise, Hold, Approve batch, Promote or Stop. Do not publish.
