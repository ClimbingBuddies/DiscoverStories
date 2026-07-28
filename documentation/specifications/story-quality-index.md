# Story Quality Index (SQI)

**Status:** Current project standard  
**Project:** Discover Stories  
**Version:** 1.0  
**Owner:** Audio Platform

## 1. Purpose

The Story Quality Index (SQI) is the story-level KPI used by the Audio Platform Review Pipeline to assess whether a draft story package is strong enough to progress.

The SQI measures creative quality. It does not replace the Batch Review Record, continuity checks, artwork checks or publication controls.

The SQI is applied after the draft package exists and before a Review decision. It is not a live score used while the Draft Pipeline is generating material.

## 2. Assessment unit

For the initial review, assess the complete package:

- approved story brief;
- private Story Bible;
- 100-episode roadmap;
- Episodes 1–10 read as one opening arc;
- episode production cards;
- Studio Wiki and continuity material;
- artwork only where it affects story communication or production readiness.

Episodes 11–100 are assessed as roadmap blocks. A roadmap block is not treated as ten completed scripts or a playable episode.

A later Review may assess a revised batch, a selected full-script range or a roadmap block. The assessment record must identify the exact scope.

## 3. Scoring model

Score each category from 0 to the maximum shown. Use whole numbers. Award points for demonstrated quality, not intention.

| Category | Maximum | Assessment question |
|---|---:|---|
| Story promise and hook | 10 | Is the distinctive experience clear and compelling from the opening? |
| Character appeal and agency | 20 | Do characters want things, make choices and create consequences? |
| Plot and arc structure | 15 | Does the batch form a purposeful movement within the wider season? |
| Emotional engagement | 15 | Do events matter emotionally and do relationships change? |
| Pacing and dramatic load | 10 | Does each episode carry appropriate movement, pressure or discovery? |
| World and atmosphere | 10 | Is the setting specific, coherent and dramatically useful? |
| Dialogue and voice | 5 | Do voices feel distinct and does dialogue create conflict, insight or choice? |
| Originality and specificity | 5 | Does the story have memorable details rather than generic substitutes? |
| Continuity and causality | 5 | Do knowledge, rules, timelines and consequences remain coherent? |
| Episode endings | 5 | Do episode endings create a meaningful next question, choice or consequence? |
| **Total** | **100** | |

Record the evidence supporting each score. A score without evidence is incomplete.

## 4. Score interpretation

| SQI score | Meaning | Default Review position |
|---:|---|---|
| 90–100 | Exceptional and highly controlled | Approve batch or Promote if all non-SQI checks pass |
| 80–89 | Strong and ready to progress | Approve batch if no critical findings exist |
| 70–79 | Promising but material weaknesses remain | Revise before progression |
| 60–69 | Unstable or uneven | Hold or Revise; reassess affected package |
| 0–59 | Fundamentally weak or misaligned | Stop or return to brief development |

The score is a decision aid, not an automatic publication rule. A high score cannot override a critical brief, continuity, spoiler, safety, database or production finding.

For an **Approve batch** or **Promote** decision:

- SQI must be at least 80;
- no category may score below half of its maximum;
- no unresolved critical finding may remain;
- brief, continuity, Wiki and production-readiness checks must be complete;
- the Batch Review Record must contain evidence and the explicit decision.

A score below 80 may be recorded as an interim assessment, but it cannot authorise the next production batch.

## 5. Finding severity

Each finding must be classified separately from the score:

- **Critical:** prevents progression regardless of SQI. Examples include a premise that no longer matches the approved brief, broken core continuity, an unresolved reveal that invalidates the opening arc, unsafe or prohibited material, or missing evidence required to review the package.
- **Major:** materially weakens one or more SQI categories and requires correction before approval.
- **Minor:** a contained issue that can be corrected without changing the approved premise or arc.

Findings must also identify their type:

- brief;
- interpretation;
- output;
- continuity;
- production.

This preserves the existing review distinction between an instruction problem and a writing problem.

## 6. Review frequency

Run SQI:

1. after Episodes 1–10 and the initial roadmap are complete;
2. after a material revision to the brief, Story Bible, opening arc or roadmap;
3. before authorising a new full-script batch where the previous review identified unresolved weaknesses;
4. before a Promote decision;
5. after a substantial replacement of episodes or core artwork where the change affects story meaning.

Do not recalculate SQI for cosmetic edits that do not change story meaning. Record the reason when an assessment is carried forward.

## 7. Required assessment record

Each SQI assessment must record:

- story id and slug;
- season and assessed range or roadmap block;
- review run or batch identifier;
- assessment date;
- reviewer;
- score for every category;
- total SQI;
- strengths;
- weaknesses;
- evidence and episode references;
- critical, major and minor findings;
- required corrections;
- previous SQI, when reassessing;
- final Review decision.

The SQI is the measurement. The Batch Review Record remains the authoritative record of what happens next.

## 8. Relationship to status

SQI does not change database status by itself.

The normal lifecycle remains:

`draft → review → approved → published`

- `draft` means the material is being developed or tested;
- `review` means it is being assessed;
- `approved` means the relevant Review decision authorises progression;
- `published` requires the separate Public Pipeline.

Inserting a record, receiving a high SQI or setting `approved` does not itself publish content.

## 9. Minimum assessment template

```text
Story:
Scope:
Review run:
Reviewer:
Date:

Story promise and hook:       /10
Character appeal and agency:  /20
Plot and arc structure:       /15
Emotional engagement:         /15
Pacing and dramatic load:     /10
World and atmosphere:         /10
Dialogue and voice:            /5
Originality and specificity:  /5
Continuity and causality:     /5
Episode endings:              /5
TOTAL SQI:                    /100

Strengths:
Weaknesses:
Critical findings:
Major findings:
Minor findings:
Required corrections:
Decision: Revise / Hold / Approve batch / Promote / Stop
```
