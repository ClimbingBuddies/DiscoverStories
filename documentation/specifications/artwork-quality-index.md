# Artwork Quality Index (AQI)

## Purpose

The Artwork Quality Index provides a lightweight, repeatable assessment of story, banner, episode and roadmap artwork.

It is used by the Audio Platform Image Review Pipeline to identify artwork that is approved, needs refinement or should be replaced.

AQI is a review aid, not a replacement for artistic judgement.

## Scoring

Score each artwork asset from 0 to 20 in five areas.

| Area | What is assessed | Maximum |
|---|---|---:|
| Story accuracy | The image reflects the stored story, episode or roadmap content and does not introduce unsupported facts. | 20 |
| Character continuity | Character identity, age, appearance, clothing and established visual details remain consistent. | 20 |
| Emotional and narrative value | The expression, action and selected moment communicate the intended emotional beat and advance the story visually. | 20 |
| Composition and originality | The image has a clear focal point, readable composition and does not unnecessarily duplicate other artwork. | 20 |
| Production suitability | The image is technically usable, free of unwanted text or artefacts, and appropriate for its intended cover, banner or episode role. | 20 |

**Maximum AQI: 100**

## Assessment Result

| AQI | Result | Required action |
|---:|---|---|
| 85–100 | Approved | Retain unless a specific issue is identified. |
| 70–84 | Approved with minor change | Refine only the identified weakness. |
| 50–69 | Replace recommended | Prepare a replacement concept. |
| 0–49 | Replace | Do not use as production artwork. |

An image may still be marked **Replace** regardless of its total score where it contains a critical continuity error, incorrect character identity, unsupported story event or unusable technical defect.

## Review Output

The Image Review Pipeline should report only:

| Asset | AQI | Result | Main reason |
|---|---:|---|---|
| Episode 3 | 62 | Replace recommended | Expression does not match the stored episode beat. |

Detailed category scoring is only required where the user asks for it or where the reason for the result is unclear.

## Operating Rules

- Read the relevant Supabase story records before scoring.
- Review the existing artwork against the stored story context and approved continuity references.
- Score the artwork that exists; do not score a written prompt as though it were an image.
- Do not generate replacements until the review report has identified the assets requiring work, unless the user has already authorised replacement.
- Reassess replacement artwork before production upload.
- Keep the assessment concise and focus on the main artistic issue.
