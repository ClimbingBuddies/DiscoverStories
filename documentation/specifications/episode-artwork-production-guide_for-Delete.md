# Episode Artwork Production Guide

> **DEPRECATED — FOR DELETE.** Do not use this document. It is retained temporarily for review history and will be removed after the cleanup is approved. Start with [`documentation/image-creation/README.md`](../image-creation/README.md); the Episode Artwork Production Specification v1.5 controls creative quality and the Reliable Image Upload Guides control upload behaviour.

**Audio Platform · Version 1.0 · 26 Jul 2026**

| Status | Owner | Related standard |
|---|---|---|
| Working guide | Audio Platform | Episode Artwork Production Specification v1.3 |

## Purpose

This guide defines the repeatable operating process used to create story covers, banners and episode artwork. It explains how to move from story material to an approved platform asset while controlling image-generation cost and preserving quality.

The related **Episode Artwork Production Specification** defines what approved artwork must achieve. This guide defines how the work is carried out.

## 1. Required inputs

Before artwork begins, collect the following:

- story title and slug;
- episode number and title where applicable;
- episode synopsis or full episode text;
- character continuity records;
- approved character references;
- world-building or location references;
- asset type: episode, cover or banner;
- intended emotional beat;
- any mandatory story object, clue, costume or dream-state element.

Do not begin visual production from the title alone when the episode text or synopsis is available.

## 2. Production sequence

```text
Story material
    ↓
Identify emotional beat
    ↓
Choose one visual moment
    ↓
Write art direction
    ↓
Create Concept
    ↓
Concept review
    ↓
Create Refine image
    ↓
Refine review
    ↓
Create Production image
    ↓
Final QA
    ↓
Name and upload
    ↓
Link database record
    ↓
Verify website display
```

## 3. Step-by-step workflow

### Step 1 — Read

Read enough of the source material to understand:

- what changes in the episode;
- what the character wants;
- what the character feels;
- what causes that emotion;
- what visual information the audience should notice;
- how the episode connects to earlier and later episodes.

### Step 2 — Identify the emotional beat

Write one sentence in this form:

> [Character] feels [emotion] because [cause].

Examples:

- Mara feels unsettled wonder because her dream reveals a place she has never seen while awake.
- Elara feels playful confidence because she knows Cedric cannot stop her escaping.
- Kai feels exhilarated curiosity because the forbidden Dead Sector is finally within reach.

This sentence becomes the emotional control for every later prompt.

### Step 3 — Select one visual moment

Choose the single moment that best combines:

- story consequence;
- emotional clarity;
- visual interest;
- recognisable setting;
- an unanswered question or promise.

Avoid generic portraits, summaries of multiple scenes and moments that are important only because of dialogue.

Record the chosen moment before generating.

### Step 4 — Write the art direction brief

Use this template:

| Field | Direction |
|---|---|
| Asset | Episode, cover or banner |
| Story moment | One sentence describing the visual event |
| Emotional beat | Emotion and cause |
| Main subject | Character, object or action |
| Character performance | Expression, gaze, posture and gesture |
| Relationship dynamic | How characters relate in the moment |
| Setting | Place, era, weather, technology and atmosphere |
| Composition | Camera distance, angle, focal position and crop-safe area |
| Lighting and palette | Time, contrast, colour mood and texture |
| Continuity constraints | Details that must remain stable |
| Mandatory elements | Clues, props, dream effects or story-specific details |
| Exclusions | Text, logos, watermarks, UI and known failure risks |

### Step 5 — Create the Concept image

The Concept stage tests only the main visual decision.

Concept instructions should request:

- low-cost or reduced-detail concept art;
- clear composition;
- readable emotion and pose;
- approximate environment;
- crop-safe subject placement;
- no unnecessary fine textures or finishing detail.

A concept prompt should not spend tokens or generation effort describing invisible production detail.

Generate only enough alternatives to evaluate materially different directions. Three concepts is a useful default when the visual direction is uncertain. One concept may be sufficient when the composition is already well established.

### Step 6 — Review the Concept

Review in this order:

1. Is this the correct story moment?
2. Is the intended emotion immediately readable?
3. Does the pose and relationship dynamic support that emotion?
4. Is there one dominant focal event?
5. Is the composition safe for responsive cropping?
6. Is the image readable at thumbnail size?
7. Does it create the intended question, promise or mood?

At this stage, ignore minor texture, costume-detail and finish issues unless they reveal a larger continuity problem.

Choose one outcome:

- **Approve:** proceed to Refine.
- **Revise:** keep the same idea but adjust composition, pose or emotion.
- **Reject:** choose a different story moment or visual approach.

### Step 7 — Create the Refine image

Use the approved concept as the visual direction. Do not casually redesign the scene.

Refine:

- character identity;
- facial structure and age;
- hair and clothing;
- expression and gaze;
- important props;
- location accuracy;
- dream-state or magical effects;
- lighting direction;
- colour palette;
- foreground and background relationships;
- crop safety.

The Refine stage should be detailed enough to judge the final result, but it does not require maximum production rendering.

### Step 8 — Review the Refine image

Review in this order:

1. Does it still preserve the approved Concept?
2. Are recurring characters recognisable?
3. Are costume, props and location details correct?
4. Is the emotion still readable after detail was added?
5. Are dream or magical states clearly distinct where required?
6. Is the lighting and palette appropriate to the episode?
7. Is anything likely to fail at Production scale?

Choose one outcome:

- **Approve:** proceed to Production.
- **Correct:** adjust a limited continuity, lighting, expression or setting issue.
- **Return to Concept:** use only when the underlying composition or story moment has become wrong.

### Step 9 — Create the Production image

The Production stage creates the final platform asset.

Use the approved direction and request:

- final-quality rendering;
- sufficient resolution for platform use;
- complete textures and environmental detail;
- polished facial features and hands;
- final cinematic lighting and colour treatment;
- clean crop-safe composition;
- no text, logos, watermarks, borders or UI.

Do not introduce a new scene, camera angle, pose, costume or emotional interpretation at this stage.

### Step 10 — Final quality assurance

Check the Production image against the Episode Artwork Production Specification.

Confirm:

- one clear visual event;
- correct emotional beat;
- stable character identity;
- correct story and world continuity;
- thumbnail readability;
- crop safety;
- no generated text or UI artefacts;
- no distorted anatomy or distracting generation errors;
- appropriate production quality.

### Step 11 — Name and upload

Use the stable production filename only after approval.

Examples:

- `the-cartographers-dream-s01e01.jpg`
- `ash-and-silver-cover.jpg`
- `life-inside-the-dyson-banner.jpg`

Upload to the correct Supabase storage folder. Temporary Concept and Refine files must not replace the production asset.

### Step 12 — Link and verify

After upload:

1. confirm the storage object exists;
2. confirm the database path matches the object path;
3. confirm the record belongs to the correct story or episode;
4. load the website;
5. confirm the correct image displays;
6. check both card and expanded/player views where applicable;
7. confirm responsive cropping remains acceptable.

Artwork is not complete until website verification succeeds.

## 4. Decision rules

### When Concept fails

Revise the story moment, composition, camera, pose or emotional direction. Do not move to Refine.

### When Refine fails

Correct identity, costume, environment, lighting, expression or continuity. Return to Concept only when the underlying visual idea is wrong.

### When Production fails

- Return to Refine for rendering, anatomy, continuity or detail corrections.
- Return to Concept only when the approved direction itself is no longer suitable.
- Do not repeatedly regenerate full-quality images without first identifying the failure category.

## 5. Batch production

For a group of episodes:

1. read all episode summaries;
2. identify the emotional progression across the batch;
3. avoid repeating the same pose, expression, framing or location;
4. create and review all Concepts first;
5. approve the visual range across the batch;
6. then Refine and Produce approved concepts.

Batch approval helps detect repetition before expensive rendering begins.

## 6. Concept-art test record

For each trial, record:

| Field | Result |
|---|---|
| Story and episode | |
| Source material used | |
| Emotional beat | |
| Chosen moment | |
| Concept prompt | |
| Number of concepts generated | |
| Best concept | |
| Storytelling score | 1–5 |
| Emotional clarity score | 1–5 |
| Character consistency score | 1–5 |
| Composition score | 1–5 |
| Thumbnail readability score | 1–5 |
| Estimated unnecessary detail | Low / Medium / High |
| Decision | Approve / Revise / Reject |
| Required change | |

This test record should be used to evaluate whether the Concept stage reduces cost without reducing decision quality.

## 7. Version control

This is Version 1.0, dated 26 Jul 2026.

Update this guide whenever the operating workflow, approval gates, storage process or website-verification process changes.
