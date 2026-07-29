# Audio Platform Review Pipeline

**Status:** Current project standard  
**Scope:** Quality assessment, continuity review and progression decisions  
**Owner:** Audio Platform  
**Last updated:** 29 Jul 2026

This is the authoritative runbook for assessing an Audio Platform Review Candidate before it progresses. The Initial Draft Process creates the first story package. Creative Development explores, diagnoses, revises and synchronises it. The Review Pipeline assesses one exact synced revision. The Public Pipeline releases approved material.

## 1. Review purpose

The Review Pipeline answers:

> Is this exact synced story package strong enough, coherent enough and ready for the next authorised stage?

It must assess both:

- **brief compliance** — whether the output follows the approved creative instruction; and
- **output quality** — whether the resulting story is compelling, coherent and fit for its intended audience.

A Review run must not quietly rewrite the story. It records evidence, required corrections and one explicit decision.

## 2. Review entry command and candidate control

The preferred handoff command is:

> **Audio Platform Submit to Review Pipeline**

That command must first:

1. identify the currently agreed working revision;
2. perform a Supabase Draft Sync when accepted changes are unsynced, or verify the existing synced version;
3. verify all in-scope story, episode, roadmap, Wiki/continuity and artwork links;
4. nominate that exact synced revision as the Review Candidate;
5. begin this Review Pipeline only after verification succeeds.

If sync or verification fails, Review must not begin.

The direct command:

> **Audio Platform Begin Review Pipeline**

may be used only when an exact synced Review Candidate has already been identified and verified. It does not perform creative revisions and must not silently resync a different version.

## 3. Review entry criteria

Begin Review only when the nominated Review Candidate contains the relevant package:

- approved working brief;
- private Story Bible;
- 100-episode roadmap;
- Episodes 1–10 as full prose for the initial formal batch, or the selected later range;
- episode production cards;
- Studio Wiki/continuity material where included;
- artwork or production metadata where those are in scope;
- Supabase verification evidence identifying the exact synced revision.

Episodes 11–100 may be reviewed as roadmap blocks. A roadmap block contains ten planned episode summaries and does not require ten completed episode rows.

Exploratory ideas that were discussed but not accepted are not part of the Review Candidate.

## 4. Mandatory Review sequence

### 1. Confirm scope and source material

Record the story, season, episode range or roadmap block, synced Draft revision and Review Candidate being assessed. Read the source brief and private Story Bible before judging the prose.

Confirm that the reviewed package matches the verified Supabase candidate. If the working material has changed since submission, stop and return to Creative Development or resubmit the candidate.

### 2. Check brief compliance

Confirm premise, audience, story promise, tone, central question, required elements, exclusions and ending direction. Record brief and interpretation findings separately from output findings.

### 3. Apply the Story Quality Index

Apply the authoritative [Story Quality Index](../specifications/story-quality-index.md) to the complete assessment unit.

For the initial batch, read Episodes 1–10 as one opening arc and assess them against the roadmap. Score all ten categories, record evidence and calculate the total.

The formal Review SQI is a gate measurement, not a generation target:

- **80 or higher** is required for Approve batch or Promote;
- no category may be below half of its maximum;
- critical findings block progression regardless of score.

Creative Development SQI diagnostics may be included as history, but they do not replace the formal Review SQI.

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

## 5. Review decisions

| Decision | Meaning |
|---|---|
| **Revise** | Return identified material to Audio Platform Creative Development before reassessment |
| **Hold** | Pause because the brief, concept, roadmap or evidence needs further consideration |
| **Approve batch** | Accept the assessed batch and authorise the next development batch |
| **Promote** | Authorise the assessed material to enter the Public Pipeline; publication is still separate |
| **Stop** | Do not continue the current story direction |

A score alone never changes status or publishes content. The decision must be explicit.

A **Revise** decision returns the story to:

> **Audio Platform Begin Creative Development**

After corrections, the revised candidate must be synced, verified and resubmitted before formal reassessment.

## 6. Batch Review Record

Every Review run must contain:

| Field | Required content |
|---|---|
| Story | Story id, slug and title |
| Scope | Season, episode range or roadmap block |
| Source | Exact synced Draft revision and Review Candidate assessed |
| Sync verification | Verification result and relevant identifiers |
| Brief findings | Compliance and interpretation findings |
| SQI | Ten category scores, total and assessment notes |
| Quality findings | Evidence-linked output findings |
| Continuity | Canon, knowledge, timeline and reveal results |
| Wiki | Private/Studio/Public separation and reference results |
| Artwork | Asset findings where applicable |
| Corrections | Required changes, owner and re-review condition |
| Decision | Revise, Hold, Approve batch, Promote or Stop |
| Reviewer | Reviewer and date |

## 7. Completion rules

A Review run is complete only when:

- the exact synced Review Candidate is identified;
- candidate verification passed before Review began;
- the scope is recorded;
- the source material was read;
- every SQI category has a score and evidence;
- findings are classified by severity and type;
- continuity and Wiki checks are reported;
- artwork/production checks are reported when applicable;
- required corrections are explicit;
- one decision is recorded.

The Review Pipeline may authorise progression, but it does not publish. Publication belongs exclusively to the Public Pipeline.

## 8. Re-review

After corrections, reassess only the affected categories when the change is contained. Recalculate the full SQI whenever a correction changes the brief, central relationship, opening arc, major reveal, roadmap direction or episode ending.

Always retain the previous assessment so SQI movement can be seen over time.

Corrections must return through Creative Development. The revised working draft must then be synced, verified and resubmitted as a new Review Candidate.

## 9. Reusable instructions

### Preferred submission and review

> **Audio Platform Submit to Review Pipeline**
>
> Sync any agreed unsynced changes for “[TITLE]” to Supabase as `draft`, verify that Supabase represents the exact current revision, nominate that synced revision as the Review Candidate and begin the Audio Platform Review Pipeline. Do not begin Review if sync or verification fails. Do not publish.

### Review an existing candidate

> **Audio Platform Begin Review Pipeline**
>
> Review the already identified and verified Review Candidate for “[TITLE]” using the authoritative Review Pipeline and Story Quality Index. Confirm the exact synced source, assess the approved brief, private Story Bible, roadmap and requested episode range, score every SQI category with evidence, identify brief/interpretation/output/continuity/production findings, complete the Wiki and production checks, and record one decision: Revise, Hold, Approve batch, Promote or Stop. Do not revise, resync or publish.

## 10. Supporting processes

- Draft router: `documentation/pipelines/audio-platform-draft-pipeline.md`
- Initial Draft: `documentation/pipelines/audio-platform-initial-draft-process.md`
- Creative Development: `documentation/pipelines/audio-platform-creative-development-process.md`
- Story Quality Index: `documentation/specifications/story-quality-index.md`
