# Episode Artwork Production Specification

**Audio Platform · Version 1.3 · 26 Jul 2026**

| Status | Owner | Current standard |
|---|---|---|
| Working standard | Audio Platform | Crop-safe, credit-efficient staged artwork production |

## Purpose

This specification keeps the visual identity of each story consistent while giving every episode a distinct image. It is designed for AI image generation, manual art direction, storage in Supabase and display on desktop and mobile.

The production process deliberately separates low-cost creative decisions from final-quality rendering. Composition, emotion and storytelling should be approved before credits are spent refining detail or generating a production asset.

## 1. Core artwork standards

| Asset | Emotional focus | Primary use | Required outcome |
|---|---|---|---|
| Episode artwork | Scene-specific | Episode cards, player and episode detail | One distinct visual event with a clear emotional beat |
| Story cover | Enduring story mood | Story card and story detail | The enduring identity of the story |
| Story banner | World atmosphere | Hero/header areas | A wide atmospheric statement of the world |

Artwork must be supplied at a suitable quality for the platform. No fixed production dimensions are required by this specification.

Concept and refinement images are temporary review assets and do not need final production quality. Only approved production artwork is uploaded and linked as the platform asset.

## 2. Visual principles

- One image, one clear event: the viewer should understand the moment at a glance.
- Character continuity matters: preserve established identity features such as hair, face, age, build, clothing silhouette, colour palette and accessories. Expression, gaze, posture and gesture must change to suit the episode.
- The image supports the story; it does not replace the title, episode number or interface text.
- Keep important faces and action away from the extreme edges so responsive crops remain safe.
- Use cinematic lighting, depth and atmosphere, but preserve readable silhouettes at thumbnail size.
- Never embed titles, logos, watermarks, episode numbers, UI controls or generated text in the artwork.
- Approve the storytelling before increasing resolution, detail or production quality.

## 3. Emotional storytelling and performance

Every episode image must communicate the emotional truth of the selected moment. A technically attractive image is not approved if the character’s expression or body language contradicts the scene.

Define the intended emotion before generation. Include both the emotion and its cause: for example, playful confidence because Elara knows she can escape; warm happiness because she is safe and absorbed in her father’s craft; guarded suspicion because she does not yet trust Cedric.

Use the full performance, not the mouth alone. Expression should be supported by the eyes, eyebrows, gaze direction, head angle, shoulders, hands, stance, distance between characters and the way they occupy the environment.

Allow emotional range across an episode batch. Deliberately vary joy, teasing, affection, curiosity, concentration, fear, anger, grief, relief, resolve and uncertainty where the story supports them. Do not default every dramatic scene to a stern, blank or worried expression.

Keep identity stable while performance changes. Facial structure, age, build and defining features belong to the character record; expression and pose belong to the episode moment.

For multi-character scenes, show the relationship dynamic. Their expressions and body orientation should make it clear whether they are teaching, teasing, pursuing, protecting, distrusting, comforting or confronting one another.

## 4. Asset direction by type

### Episode artwork

Episode images should depict the most meaningful or intriguing visual moment in the episode—not a generic portrait of the cast. Select a moment that creates a question, reveals a change, captures the episode promise and communicates the character’s emotional state.

- Preferred composition: one dominant subject or action, supported by a recognisable environment and a clearly readable emotional focal point.
- Use the episode synopsis to identify the visual event before writing the image prompt.
- Avoid trying to depict several unrelated scenes in one image.

### Story cover

The story cover is the stable visual anchor. It may show the protagonist, central object, or defining setting, but it must remain suitable across the whole season.

### Story banner

The banner establishes scale and mood. It should be wider and more environmental than the cover, with clean negative space where the website may place story information.

## 5. Prompt construction

Use the following order when preparing an image-generation prompt:

- Subject, action and emotion — who or what is central, what is happening, and what should the viewer feel from the character?
- Setting — the location, era, technology, weather or atmosphere.
- Composition and performance — camera distance, point of view, focal placement, facial expression, gaze, posture, gesture and safe negative space.
- Lighting and palette — time of day, contrast, colour mood and texture.
- Style and quality — cinematic illustration, realistic concept art, painterly, graphic or another agreed style.
- Production stage — concept, refine or production, with the appropriate quality instructions from Section 8.
- Exclusions — no text, logos, watermarks, borders, extra limbs, distorted faces or UI elements.

### Prompt template

> [PRODUCTION STAGE]. [SUBJECT] doing [ACTION] in [SETTING], feeling [EMOTION] because [EMOTIONAL CAUSE]. [FACIAL EXPRESSION, GAZE, POSTURE AND GESTURE]. [INTERACTION OR RELATIONSHIP DYNAMIC]. [COMPOSITION]. [LIGHTING / PALETTE]. [STYLE AND STAGE-APPROPRIATE QUALITY]. Clean readable silhouettes, consistent character identity, no text, no logos, no watermark, no UI.

## 6. Character continuity record

Before generating a sequence of images, keep a short visual record for every recurring character. Reuse the stable identity wording in each prompt, but deliberately change expression, gaze, posture, gesture and interaction to match the episode.

| Field | Record |
|---|---|
| Identity | Name, age range and narrative role |
| Face and hair | Hair colour/style, eye colour, complexion and distinctive features |
| Build and posture | Height impression, build, posture and usual expression |
| Clothing | Core outfit, colours, materials and important accessories |
| Visual constraints | Details that must not change between images |
| Episode performance | Scene-specific emotion, facial expression, gaze, posture, gesture and relationship dynamic |
| Approved references | Approved character, clothing, object and location references that should be reused |

Character identity should be approved separately before large episode batches are produced. Once approved, do not repeatedly redesign a recurring character during episode production unless the story explicitly changes their appearance.

## 7. File naming and storage

Use lowercase slugs and a predictable naming pattern. Keep temporary review assets separate from the final approved production asset.

| Asset | Recommended filename |
|---|---|
| Episode production asset | `ash-and-silver-s01e01.jpg` |
| Story cover production asset | `ash-and-silver-cover.jpg` |
| Story banner production asset | `ash-and-silver-banner.jpg` |
| Optional concept working file | `ash-and-silver-s01e01-concept-01.jpg` |
| Optional refined working file | `ash-and-silver-s01e01-refine-01.jpg` |

- Use the story slug already stored in the database.
- Use JPG for standard photographic or illustrated artwork; use PNG only when transparency is genuinely required.
- Do not use spaces, capitals, duplicate suffixes or changing filenames for the same approved asset.
- Temporary concept and refinement files must never replace the correctly named production asset in the database.
- Only the final approved production filename is treated as the stable public platform asset.

## 8. Three-stage production and approval workflow

All new artwork should move through the following stages. A stage may be skipped only where an existing approved reference makes it unnecessary and the final result can be confidently produced without avoidable regeneration.

### Stage 1 — Concept

**Purpose:** Approve the visual idea and storytelling at the lowest practical generation cost.

Use a fast, low-resolution or reduced-detail draft. Prioritise:

- the selected story event;
- composition and camera angle;
- subject placement and crop safety;
- facial expression, pose and relationship dynamic;
- the main environmental idea;
- immediate thumbnail readability.

Background detail, fine textures, exact lighting polish and production-level rendering are not required. The concept may use a loose painterly, storyboard, sketch or simplified concept-art treatment.

**Concept approval question:** Does this image tell the right story in the right way?

Do not proceed when the selected moment, emotion, composition or character interaction is wrong. Revise these decisions while the image remains inexpensive to generate.

### Stage 2 — Refine

**Purpose:** Approve visual accuracy and continuity before final production rendering.

Use the approved concept as the creative direction. Refine:

- recurring character identity, age, face, hair and build;
- clothing, props and established visual constraints;
- expression, gaze, posture and gesture;
- setting accuracy and important background elements;
- lighting direction, colour palette and atmosphere;
- crop safety and focal clarity.

The refined image should be sufficiently clear to judge the intended final artwork, but it does not need maximum resolution, texture detail or final post-processing.

**Refine approval question:** Is this the exact image we want to produce?

Do not proceed while important character, costume, continuity, setting or emotional-performance issues remain.

### Stage 3 — Production

**Purpose:** Create the final website-ready asset from an approved refined direction.

The production render must:

- use the approved composition and story moment;
- preserve the approved character and environmental details;
- have sufficient resolution and clarity for its platform use;
- use final lighting, atmosphere, textures and colour treatment;
- remain readable as a thumbnail and safe under responsive cropping;
- contain no generated text, logos, watermarks, borders or UI elements;
- receive final visual quality assurance;
- use the stable production filename;
- be uploaded to the correct Supabase storage location;
- be linked to the correct story or episode record; and
- be checked on the website after publishing.

Production rendering is not the stage for experimenting with a different scene, pose, costume or composition. Material creative changes should return to Concept or Refine rather than repeatedly regenerating full-quality assets.

### End-to-end workflow

1. **Read** — Read the story, episode synopsis and character continuity record.
2. **Select** — Choose one visual event that best represents the episode.
3. **Direct** — Define the emotion, emotional cause, relationship dynamic and composition.
4. **Concept** — Generate a fast, low-cost visual draft.
5. **Concept review** — Approve or revise the storytelling, pose, emotion, camera and crop safety.
6. **Refine** — Correct character, clothing, setting, lighting and continuity details.
7. **Refine review** — Confirm that this is the exact image intended for production.
8. **Produce** — Generate the final-quality platform asset without changing the approved direction.
9. **Quality assurance** — Check storytelling clarity, emotional accuracy, character continuity, crop safety and technical quality.
10. **Publish** — Apply the production filename, upload it, link the database record and verify website display.

## 9. Credit optimisation strategy

The following rules reduce unnecessary image-generation cost while protecting final quality:

- Never use a full production render merely to test a composition, pose, expression or camera angle.
- Resolve major creative uncertainty during the Concept stage.
- Resolve character, clothing, continuity and environmental accuracy during the Refine stage.
- Generate Production artwork only after the creative direction has been approved.
- Reuse approved character descriptions and visual references rather than redesigning recurring characters in each prompt.
- Reuse approved clothing, recurring locations, important props and established colour palettes.
- Keep concept prompts intentionally simple; do not request invisible detail that cannot affect approval.
- Do not regenerate an approved asset solely to create minor differences that will not be visible at platform size.
- Where practical, approve a batch of episode concepts before producing the final batch.
- Preserve successful prompt wording and reference decisions so later episodes require fewer exploratory generations.
- When a Production render fails because the underlying creative decision changed, return to the appropriate earlier stage rather than continuing expensive production attempts.

The goal is not simply to create lower-quality images. The goal is to spend high-quality generation credits only after the storytelling and art direction are sufficiently settled.

## 10. Final quality checklist

### Storytelling and continuity

- Does the image show one clear story moment and the correct emotional beat?
- Would a viewer correctly read the intended emotion and relationship dynamic without reading the episode title?
- Are recurring characters recognisable and consistent without repeating the same expression or pose?
- Does the image match the approved Concept and Refine direction?

### Composition and platform use

- Are the face, action and key object safe from likely responsive cropping?
- Is the image readable as a small thumbnail?
- Does the image have sufficient quality and clarity for its intended platform use?

### Technical and publishing checks

- Is there no embedded text, logo, watermark, border or interface element?
- Is the filename lowercase, correctly slugged and correctly labelled?
- Is this the final Production asset rather than a temporary Concept or Refine file?
- Has the final image been visually checked before it is marked approved?
- Has the storage upload, database link and website display been verified?

## 11. Version control

This is Version 1.3, dated 26 Jul 2026. It introduces the formal Concept, Refine and Production workflow and the associated credit-optimisation rules.

If storage paths, naming rules, production stages or visual-storytelling requirements change, update this specification at the same time as the database and website implementation notes.

**Current decisions:**

- Filenames do not include dimensions.
- Episode production artwork uses the story slug, season and episode number, for example `ash-and-silver-s01e01.jpg`.
- Concept and Refine images are temporary approval assets; only the approved Production asset is published and linked as the stable platform image.
