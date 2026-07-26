# Episode Artwork Production Specification

**Audio Platform · Version 1.4 · 26 Jul 2026**

| Status | Owner | Current standard |
|---|---|---|
| Working standard | Audio Platform | Evidence-backed, crop-safe, credit-efficient staged artwork production |

## Purpose

This specification keeps the visual identity of each story consistent while giving every episode a distinct image. It is designed for AI image generation, manual art direction, storage in Supabase and display on desktop and mobile.

The production process separates low-cost creative decisions from final-quality rendering. Composition, emotion, story fidelity and scene selection must be approved before credits are spent refining detail or generating a production asset.

## 1. Core artwork standards

| Asset | Emotional focus | Primary use | Required outcome |
|---|---|---|---|
| Episode artwork | Scene-specific | Episode cards, player and episode detail | One distinct visual event with a clear emotional beat and direct support from the episode text |
| Story cover | Enduring story mood | Story card and story detail | The enduring identity of the story |
| Story banner | World atmosphere | Hero/header areas | A wide atmospheric statement of the world |

Artwork must be supplied at a suitable quality for the platform. No fixed production dimensions are required by this specification.

Concept and refinement images are temporary review assets and do not need final production quality. Only approved production artwork is uploaded and linked as the platform asset.

## 2. Source-of-truth hierarchy

Artwork must be derived from the strongest available story source in this order:

1. Full episode script (`script_text`)
2. Episode synopsis
3. Story bible or world-building documentation
4. Character continuity records

When `script_text` is available, it is the primary source for scene selection. The summary may help identify the episode function, but it must not replace the full text as evidence for the chosen image.

Every episode concept must be traceable to one or more scenes, paragraphs or narrative moments in the episode text.

## 3. Required concept deliverables

Every concept-art batch must produce three separate deliverables.

### Deliverable 1 — Concept Art Board

The concept board is a clean visual review asset.

Requirements:

- artwork only;
- episode number and title may be included;
- no embedded report, evidence table or production notes;
- no long summaries inside the image;
- one concept panel per episode;
- consistent layout for batch review;
- low-cost concept quality rather than final rendering.

### Deliverable 2 — Art Direction and Episode Alignment Report

The report must be supplied separately as readable text, preferably Markdown.

Required fields:

| Field | Requirement |
|---|---|
| Episode number and title | Correct database identity |
| Source material | Confirm whether full script or fallback source was used |
| Episode inspiration | The exact chosen scene or closely related group of moments |
| Source reference | Paragraph, scene or descriptive text reference where practical |
| Emotional beat | Emotion and cause |
| Why this scene | Reason it best represents the episode |
| Scene evidence | Important visual elements supported by the episode text |
| Things deliberately not shown | Spoilers, future reveals or misleading fantasy imagery intentionally excluded |
| Character continuity | Recurring identity and performance requirements |
| Visual continuity | Required setting, props, symbols, costume or dream-state details |
| Director’s intent | What the audience should feel or wonder |
| Alignment confirmation | Yes, Partial or No |
| Confidence | High, Medium or Low |

The report must not claim textual evidence that has not actually been checked in the episode text.

### Deliverable 3 — Approved Production Prompt

The Production Prompt is created only after the Concept is approved. It must preserve the approved scene, composition, character performance and continuity decisions. Refine and Production generation should use this locked direction rather than redesigning the episode image.

## 4. Visual principles

- One image, one clear event: the viewer should understand the moment at a glance.
- Character continuity matters: preserve established identity features such as hair, face, age, build, clothing silhouette, colour palette and accessories. Expression, gaze, posture and gesture must change to suit the episode.
- The image supports the story; it does not replace the title, episode number or interface text.
- Keep important faces and action away from the extreme edges so responsive crops remain safe.
- Use cinematic lighting, depth and atmosphere, but preserve readable silhouettes at thumbnail size.
- Never embed logos, watermarks, interface controls or unwanted generated text in the production artwork.
- Approve the storytelling and story fidelity before increasing resolution, detail or production quality.
- Avoid the most generic interpretation of the genre. Choose visual details that could only belong to this story and episode.

## 5. Emotional storytelling and performance

Every episode image must communicate the emotional truth of the selected moment. A technically attractive image is not approved if the character’s expression or body language contradicts the scene.

Define the intended emotion before generation. Include both the emotion and its cause.

Use the full performance, not the mouth alone. Expression should be supported by the eyes, eyebrows, gaze direction, head angle, shoulders, hands, stance, distance between characters and the way they occupy the environment.

Allow emotional range across an episode batch. Do not default every dramatic scene to a stern, blank or worried expression.

Keep identity stable while performance changes. Facial structure, age, build and defining features belong to the character record; expression and pose belong to the episode moment.

For multi-character scenes, show the relationship dynamic clearly.

## 6. Episode artwork direction

Episode images should depict the most meaningful or intriguing visual moment in the episode, not a generic portrait of the cast.

Select a moment that:

- exists in the episode text;
- creates a question, promise or emotional response;
- reveals a meaningful change;
- communicates the character’s emotional state;
- reinforces the unique identity of the story world;
- does not unnecessarily reveal later episodes.

Avoid trying to depict several unrelated scenes in one image.

## 7. Prompt construction

Use the following order when preparing an image-generation prompt:

1. Source-backed story moment
2. Subject, action and emotional cause
3. Character performance and relationship dynamic
4. Setting and story-specific visual evidence
5. Composition and crop-safe focal placement
6. Lighting and palette
7. Style and production stage
8. Continuity constraints
9. Exclusions

### Prompt template

> [PRODUCTION STAGE]. Depict the episode-text scene in which [SUBJECT] is [ACTION] in [SETTING], feeling [EMOTION] because [CAUSE]. Include the following source-supported elements: [EVIDENCE]. Show [EXPRESSION, GAZE, POSTURE AND GESTURE]. Preserve [CHARACTER AND WORLD CONTINUITY]. Use [COMPOSITION] with crop-safe focal placement. [LIGHTING / PALETTE]. [STYLE AND STAGE-APPROPRIATE QUALITY]. Do not show [SPOILERS OR EXCLUDED ELEMENTS]. No logos, watermark, UI or unintended text.

## 8. Character continuity record

Before generating a sequence of images, keep a short visual record for every recurring character.

| Field | Record |
|---|---|
| Identity | Name, age range and narrative role |
| Face and hair | Hair colour/style, eye colour, complexion and distinctive features |
| Build and posture | Height impression, build, posture and usual expression |
| Clothing | Core outfit, colours, materials and important accessories |
| Visual constraints | Details that must not change between images |
| Episode performance | Scene-specific emotion, facial expression, gaze, posture, gesture and relationship dynamic |
| Approved references | Approved character, clothing, object and location references that should be reused |

Character identity should be approved separately before large episode batches are produced.

## 9. File naming and storage

Use lowercase slugs and a predictable naming pattern. Keep temporary review assets separate from the final approved production asset.

| Asset | Recommended filename |
|---|---|
| Episode production asset | `ash-and-silver-s01e01.jpg` |
| Story cover production asset | `ash-and-silver-cover.jpg` |
| Story banner production asset | `ash-and-silver-banner.jpg` |
| Concept working file | `ash-and-silver-s01e01-concept-01.jpg` |
| Refined working file | `ash-and-silver-s01e01-refine-01.jpg` |
| Concept board | `ash-and-silver-s01e01-e10-concept-board.jpg` |
| Art direction report | `ash-and-silver-s01e01-e10-art-direction.md` |
| Approved prompt record | `ash-and-silver-s01e01-e10-production-prompts.md` |

Only the final approved production filename is treated as the stable public platform asset.

## 10. Three-stage workflow

### Stage 1 — Concept

Purpose: approve the visual idea, story fidelity and storytelling at the lowest practical cost.

Prioritise:

- the source-backed story event;
- emotional beat;
- composition and camera angle;
- subject placement and crop safety;
- pose and relationship dynamic;
- recognisable world-specific elements;
- thumbnail readability.

Concept approval questions:

1. Does this scene exist in the episode text?
2. Is it one of the strongest visual moments?
3. Does it express the correct emotion?
4. Does it avoid spoilers or future reveals?
5. Does it feel specific to this story rather than generic fantasy or science fiction?

### Stage 2 — Refine

Purpose: approve visual accuracy and continuity before final production rendering.

Refine character identity, clothing, props, location accuracy, expression, magical or dream-state effects, lighting, colour, foreground/background relationships and crop safety.

### Stage 3 — Production

Purpose: create the final website-ready asset from an approved refined direction.

Do not introduce a new scene, camera angle, pose, costume or emotional interpretation during Production.

## 11. Review scoring

Each concept should receive the following scores from 1 to 5:

| Measure | Question |
|---|---|
| Story fidelity | Does the image accurately represent the episode text? |
| Emotional fidelity | Does it communicate the intended feeling and cause? |
| Character fidelity | Are recurring characters recognisable and correct? |
| Composition | Is the focal event clear and crop-safe? |
| Story-world specificity | Could this image only belong to this story? |
| Thumbnail readability | Is the moment understandable at small size? |
| Production readiness | Can the concept move to Refine without redesign? |

Any concept with Story Fidelity below 4 must not proceed to Refine.

## 12. Credit optimisation

- Never use a full production render merely to test a composition, pose, expression or camera angle.
- Read and verify the source scene before generation.
- Resolve major creative uncertainty during Concept.
- Resolve continuity and environmental accuracy during Refine.
- Generate Production artwork only after approval.
- Review batches together to prevent repeated poses, expressions, framing and locations.
- Keep the Concept Board and text report separate; do not spend image-generation effort rendering report tables.

## 13. Final quality checklist

### Story and evidence

- Does the chosen scene exist in the episode text?
- Does the Art Direction Report identify the supporting evidence?
- Is the image aligned to that evidence rather than merely to the summary?
- Are spoilers and misleading elements excluded?
- Does the image reinforce the unique story world?

### Storytelling and continuity

- Does the image show one clear story moment and the correct emotional beat?
- Are recurring characters recognisable and consistent?
- Does the image match the approved Concept and Refine direction?

### Composition and platform use

- Are the face, action and key object safe from responsive cropping?
- Is the image readable as a small thumbnail?
- Does the image have sufficient quality for its intended use?

### Technical and publishing

- Is there no logo, watermark, interface element or unwanted text?
- Is the filename correctly slugged?
- Is this the final Production asset rather than a temporary file?
- Has storage, database linkage and website display been verified?

## 14. Version control

This is Version 1.4, dated 26 Jul 2026.

Version 1.4 introduces:

- full episode text as the primary source of truth;
- separate Concept Board, Art Direction Report and Production Prompt deliverables;
- evidence-backed scene selection;
- explicit alignment confirmation;
- Story Fidelity and Story-World Specificity scoring;
- the rule that report tables remain text rather than being rendered inside the image.
