# Audio Platform Image Review Pipeline

## Purpose

The Audio Platform Image Review Pipeline reviews, creates, replaces, uploads and verifies artwork for an existing Audio Platform story.

The pipeline can process one image or a batch of images, including:

- story covers;
- story banners;
- individual episode artwork;
- episode ranges or roadmap-block artwork;
- replacement artwork for existing assets;
- character-reference and continuity images.

The pipeline may use the existing:

- story title, summary and premise;
- episode title, summary and script;
- private Story Bible;
- Studio Wiki entries;
- character continuity records;
- existing approved artwork;
- episode visual briefs;
- Episode Artwork Production Specification.

## Trigger Phrase

Use:

> Audio Platform Image Review Pipeline

Examples:

> Audio Platform Image Review Pipeline  
> Review and replace the artwork for Ash and Silver, Episodes 3, 5 and 7.

> Audio Platform Image Review Pipeline  
> Create a new cover, banner and artwork for Episodes 1–10 of The Cartographer’s Dream.

## 1. Identify the Request

Confirm:

- story slug;
- requested assets;
- episode numbers or ranges;
- whether each asset is new, replacement or review-only;
- artwork stage: `concept`, `draft`, `review` or `production`;
- whether upload and database linking are authorised.

A single request may contain multiple asset types.

| Asset | Target | Action |
|---|---|---|
| Cover | Story | Replace |
| Banner | Story | Review only |
| Episode artwork | Episodes 3, 5 and 7 | Create and upload |

## 2. Retrieve Story Context

Before assessing or generating an image, retrieve the relevant information from the database and specifications.

For story-level images, use:

- story title;
- short and long summary;
- genre and audience;
- story promise;
- principal characters;
- setting;
- overall visual style.

For episode images, use:

- episode title;
- episode summary;
- script where available;
- emotional movement;
- key visual event;
- relevant Wiki and Story Bible entries;
- character continuity requirements.

For roadmap-block images, use:

- block title;
- block description;
- structured episode plans within the block;
- planned themes and locations;
- spoiler restrictions.

The image must not introduce unsupported story facts unless they are clearly approved as visual interpretation.

## 3. Review Existing Artwork

Where artwork already exists, review it against:

- story and episode accuracy;
- character identity;
- age, clothing, hair and physical continuity;
- emotional expression;
- setting accuracy;
- composition and focal event;
- consistency with neighbouring episode images;
- duplicate or near-duplicate imagery;
- text, logos, borders or watermarks;
- technical suitability;
- correct file and database path.

Classify each asset as:

- **Approved**
- **Approved with minor change**
- **Replace**
- **Missing**
- **Blocked by insufficient story detail**

The review must explain the specific reason for replacement rather than only stating that an image is unsuitable.

## 4. Prepare the Visual Brief

Every new or replacement image requires a visual brief containing:

- asset role;
- story and episode identity;
- visual event;
- setting;
- subject and action;
- emotional expression;
- focal object;
- composition;
- lighting and palette;
- character continuity notes;
- details that must not appear;
- intended artwork stage.

Each image should normally show one clear story moment.

Dreams, memories, supernatural events and altered states must be identified explicitly.

## 5. Generate Concepts

For a new visual direction:

- generate low-resolution concepts first;
- normally create 2–4 alternatives;
- preserve approved character identity;
- vary composition or emotional framing rather than changing character design;
- do not upload unapproved alternatives.

For a minor replacement or correction:

- the existing approved image may be used as the direct reference;
- preserve unaffected content;
- change only the requested elements;
- avoid restarting the entire visual design unnecessarily.

## 6. Image Approval

The pipeline must clearly identify which image has been selected.

Approval may be expressed through statements such as:

- “Use this image.”
- “This one is approved.”
- “Make this the Episode 3 artwork.”
- “Upload these images.”
- “Replace the current artwork with these.”

Once an image is approved and upload authority is included, the pipeline should proceed without asking the user to separately repeat the upload instruction.

## 7. Production Preparation

Approved artwork must be prepared according to the Episode Artwork Production Specification.

Default standards:

| Asset | Production dimensions |
|---|---:|
| Cover | 1024 × 1024 |
| Episode artwork | 1024 × 1024 |
| Roadmap artwork | 1024 × 1024 |
| Banner | 1600 × 900 |

Operational requirements:

- convert ordinary artwork to genuine JPEG;
- strip unnecessary metadata;
- preserve transparency only where genuinely required;
- verify the resulting image format;
- use predictable lowercase filenames;
- do not merely rename a PNG extension to `.jpg`.

Example paths:

```text
<slug>/cover.jpg
<slug>/banner.jpg
<slug>/episodes/<slug>-s01e03.jpg
<slug>/episodes/<slug>-s01e11-20.jpg
```

## 8. Upload and Database Linking

When upload is authorised:

1. Send the approved production image through the supported artwork upload process.
2. Upload the image to Supabase Storage.
3. Register or update the corresponding `media_assets` record.
4. Link the asset to the correct story, episode or roadmap block.
5. Store a relative Storage path in the database.
6. Preserve unrelated existing database fields.
7. Replace the existing object safely where the asset is being revised.

The database stores the path, not the image bytes.

Where the existing path remains correct, replace the Storage object and leave the database link unchanged.

## 9. Verification

After upload, verify:

- the Storage object exists;
- the object is a valid JPEG or approved alternative;
- the expected database record exists;
- the story or episode points to the correct asset;
- no unrelated artwork links were changed;
- the image displays in Studio;
- the website displays the updated image where applicable;
- draft images remain unavailable through public-only queries when the story is not published.

Do not report an image as complete merely because a database path has been updated.

## 10. Batch Behaviour

The pipeline can process one or many images.

Each image is treated independently:

- one failure must not prevent other valid assets from processing;
- duplicate episode images should be detected;
- failures should identify the exact asset;
- successful uploads should not be repeated unnecessarily;
- only failed items should require rerunning.

For large batches, process an acceptance set first:

- cover;
- banner;
- Episode 1;
- Episode 2.

Proceed with the remaining batch only after Storage, database and website verification succeeds.

## 11. Completion Report

| Area | Result |
|---|---|
| Story context retrieved | Complete / blocked |
| Existing artwork reviewed | Complete / not applicable |
| Visual briefs prepared | Complete / blocked |
| Concepts created | Complete / not required |
| Images approved | Yes / pending |
| Production conversion | Verified / blocked |
| Supabase Storage upload | Verified / blocked |
| `media_assets` registration | Verified / blocked |
| Story/episode links | Verified / blocked |
| Studio display | Verified / blocked |
| Website display | Verified / not applicable / blocked |
| Image Review Pipeline complete | Yes / No |

## Reusable Instruction

> **Audio Platform Image Review Pipeline**
>
> Review the requested story, cover, banner, episode or roadmap artwork using the existing story summaries, episode content, private Story Bible, Studio Wiki, visual briefs and character-continuity records.
>
> Identify missing, inaccurate, duplicated or unsuitable artwork. Prepare visual briefs and create replacement concepts where required. Preserve approved character identity and story continuity.
>
> Once I approve an image and authorise upload, prepare the production JPEG, upload it through the supported artwork process, register it in `media_assets`, link it to the correct story or episode, and verify Storage, database and Studio display. Process each image independently and report the first failure for each asset.

## Pipeline Position

This pipeline sits between the Audio Platform Draft Pipeline and the Audio Platform Review Pipeline, while remaining independently callable.

It can therefore review, repair or replace images without rerunning the full Draft Pipeline.
