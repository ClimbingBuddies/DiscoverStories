# Episode Artwork Production Specification

**Audio Platform · Version 1.2 · 26 Jul 2026**

| Status | Owner | Current standard |
|---|---|---|
| Working standard | Audio Platform | Crop-safe artwork |

## Purpose

This specification keeps the visual identity of each story consistent while giving every episode a distinct image. It is designed for AI image generation, manual art direction, storage in Supabase and display on desktop and mobile.

## 1. Core artwork standards

| Asset | Emotional focus | Primary use | Required outcome |
|---|---|---|---|
| Episode artwork | Scene-specific | Episode cards, player and episode detail | One distinct visual event with a clear emotional beat |
| Story cover | Enduring story mood | Story card and story detail | The enduring identity of the story |
| Story banner | World atmosphere | Hero/header areas | A wide atmospheric statement of the world |

Artwork must be supplied at a suitable quality for the platform. No fixed production dimensions are required by this specification.

## 2. Visual principles

- One image, one clear event: the viewer should understand the moment at a glance.
- Character continuity matters: preserve established identity features such as hair, face, age, build, clothing silhouette, colour palette and accessories. Expression, gaze, posture and gesture must change to suit the episode.
- The image supports the story; it does not replace the title, episode number or interface text.
- Keep important faces and action away from the extreme edges so responsive crops remain safe.
- Use cinematic lighting, depth and atmosphere, but preserve readable silhouettes at thumbnail size.
- Never embed titles, logos, watermarks, episode numbers, UI controls or generated text in the artwork.

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
- Exclusions — no text, logos, watermarks, borders, extra limbs, distorted faces or UI elements.

### Prompt template

> [SUBJECT] doing [ACTION] in [SETTING], feeling [EMOTION] because [EMOTIONAL CAUSE]. [FACIAL EXPRESSION, GAZE, POSTURE AND GESTURE]. [INTERACTION OR RELATIONSHIP DYNAMIC]. [COMPOSITION]. [LIGHTING / PALETTE]. [STYLE]. Clean readable silhouettes, consistent character identity, no text, no logos, no watermark, no UI.

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

## 7. File naming and storage

Use lowercase slugs and a predictable naming pattern. Keep the original generated file and the final approved file distinguishable when needed.

| Asset | Recommended filename |
|---|---|
| Episode | `ash-and-silver-s01e01.jpg` |
| Story cover | `ash-and-silver-cover.jpg` |
| Story banner | `ash-and-silver-banner.jpg` |

- Use the story slug already stored in the database.
- Use JPG for standard photographic or illustrated artwork; use PNG only when transparency is genuinely required.
- Do not use spaces, capitals, duplicate suffixes or changing filenames for the same approved asset.

## 8. Production and approval workflow

1. **Read** — Read the story, episode synopsis and character continuity record.
2. **Select** — Choose one visual event that best represents the episode.
3. **Prompt** — Write the prompt using the construction order in Section 5.
4. **Generate** — Create several variants while preserving the character record.
5. **Review** — Check storytelling clarity, emotional accuracy, character continuity and crop safety.
6. **Approve** — Select one final image, apply the standard filename and upload it to the correct story/episode location.

## 9. Final quality checklist

- Does the image have sufficient quality and clarity for its intended platform use?
- Does the image show one clear story moment and the correct emotional beat?
- Are recurring characters recognisable and consistent without repeating the same expression or pose?
- Are the face, action and key object safe from likely responsive cropping?
- Is the image readable as a small thumbnail?
- Is there no embedded text, logo, watermark, border or interface element?
- Is the filename lowercase, correctly slugged and correctly labelled?
- Would a viewer correctly read the intended emotion and relationship dynamic without reading the episode title?
- Has the final image been visually checked before it is marked approved?

## 10. Version control

This is Version 1.2, dated 26 Jul 2026. If storage paths, naming rules or visual-storytelling requirements change, update this specification at the same time as the database and website implementation notes.

**Current decision:** filenames do not include dimensions. Episode artwork uses the story slug, season and episode number, for example `ash-and-silver-s01e01.jpg`.
