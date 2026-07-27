# Story Quality Specification

**Version:** 1.0  
**Status:** Working standard  
**Assessment unit:** One ten-episode draft batch

## 1. Purpose

This specification defines a repeatable internal Story Quality Index (SQI) for a completed ten-episode draft batch. It does not claim that a numeric score proves equivalence to a famous or exceptional author. The score identifies strengths, weaknesses and revision priorities using consistent criteria.

Quality assessment occurs after the Draft Story Pipeline has completed. It does not block the technical pipeline from reaching Draft.

## 2. Operating principles

1. Assess the complete ten-episode batch, not isolated sentences.
2. Score evidence visible in the story; do not reward intentions recorded only in the private bible.
3. Separate craft quality from technical correctness.
4. Record uncertainty where a judgement is subjective.
5. Produce no more than five priority improvements.
6. Store one compact assessment record in `public.story_quality_assessments`.
7. Keep detailed scores and evidence in `assessment_json`; do not create one table per criterion.
8. Treat the initial score as an internal editorial signal until calibrated against human review and reader behaviour.

## 3. Story Quality Index

| Category | Weight | Core question |
|---|---:|---|
| Story promise and hook | 10 | Does the opening establish a distinctive experience and make the reader want to continue? |
| Character appeal and agency | 20 | Are the central characters memorable, emotionally legible and responsible for meaningful choices? |
| Plot and arc structure | 15 | Do Episodes 1–10 form a coherent opening movement with escalation, consequence and a new objective? |
| Emotional engagement | 15 | Does the batch create attachment, tension, wonder, humour, fear or another intended emotional response? |
| Pacing and dramatic load | 10 | Does each episode carry an appropriate amount of story without repetition or compression? |
| World and atmosphere | 10 | Is the setting distinctive, comprehensible and integrated into events rather than merely described? |
| Dialogue and voice | 5 | Do characters sound purposeful and sufficiently differentiated? |
| Originality and specificity | 5 | Does the story combine familiar elements into a recognisable identity with specific details? |
| Continuity and causality | 5 | Do knowledge, rules, objects, injuries, motivations and consequences remain consistent? |
| Episode endings and continuation | 5 | Does each ending create a credible reason to begin the next episode without repeating one cliff-hanger pattern? |
| **Total** | **100** | |

Each category receives a score from 0 to its maximum weight. The overall SQI is the sum of the category scores.

## 4. Score interpretation

These bands describe internal editorial readiness, not publishing prestige or author equivalence.

| SQI | Interpretation |
|---:|---|
| 90–100 | Exceptional internal result. Revise only clear weaknesses and validate with human readers. |
| 80–89 | Strong draft. The story promise works; targeted revision should materially improve it. |
| 70–79 | Promising but uneven. Several craft weaknesses reduce engagement or clarity. |
| 60–69 | Functional draft requiring substantial revision before serious review. |
| Below 60 | The batch likely needs structural or interpretive redesign rather than line editing. |

A score above 90 does not mean “equivalent to a great author”. That conclusion requires independent human judgement and reader evidence.

## 5. Required assessment evidence

For every category, record:

- numeric score and maximum,
- two or three concise evidence references,
- confidence: low, medium or high,
- one improvement only when the category materially underperforms.

Evidence references should identify episode numbers and describe the relevant event or pattern. Long quotations are unnecessary.

## 6. Assessment JSON contract

```json
{
  "categories": {
    "story_promise": {
      "score": 8,
      "maximum": 10,
      "confidence": "high",
      "evidence": ["Episode 1 establishes ...", "Episode 3 changes ..."],
      "improvement": "Clarify ..."
    }
  },
  "technical_findings": [],
  "reader_hypotheses": [],
  "assessment_notes": ""
}
```

`technical_findings` records continuity, missing content or formatting problems. These findings do not automatically reduce unrelated creative categories.

`reader_hypotheses` records predictions to test later, such as “Episode 4 may cause drop-off because the objective repeats Episode 3.”

## 7. Calibration

The SQI becomes credible only when compared with external evidence. Over time compare it with:

- human editorial scores,
- Episode 1 to Episode 2 continuation,
- completion of Episodes 1–10,
- favourites and ratings,
- repeat listening or reading,
- structured reader comments.

Do not change weights after every story. Review the rubric only after enough assessments exist to identify a repeated mismatch between SQI and human or reader outcomes.

## 8. Required output

A completed assessment returns:

- overall SQI,
- category score table,
- three strongest qualities,
- no more than five priority improvements,
- confidence statement,
- technical findings separated from creative findings,
- assessment record saved to `public.story_quality_assessments`.

## 9. Definition of done

A Story Quality assessment is complete when one ten-episode batch has been scored against every weighted category, evidence and confidence are recorded, strengths and priority improvements are concise, the result is stored under a named rubric version, and no claim of author equivalence is made without human and reader validation.
