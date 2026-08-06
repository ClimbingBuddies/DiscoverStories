# Audio Platform Image Review Pipeline

## Purpose

The Audio Platform Image Review Pipeline reviews, creates, refines, replaces, uploads and verifies artwork for an existing Audio Platform story.

It supports the complete artwork lifecycle:

```text
Create → Review → Approve → Publish → Re-review → Replace → Verify
```

The pipeline can process one image or many images, including:

- story covers;
- story banners;
- individual episode artwork;
- episode ranges or roadmap-block artwork;
- replacement artwork for draft or published assets;
- character-reference and continuity images.

The pipeline may be used during story creation, before publication or after publication. Running an image review does not by itself authorise an image change or alter the story's publication status.

Image creation is controlled by [`documentation/image-creation/README.md`](../image-creation/README.md). Conversion, upload, Storage naming, linking and technical verification are controlled by [`documentation/image-upload/README.md`](../image-upload/README.md). Do not invent a Storage path from examples in this review pipeline.

The pipeline may use:

- story title, summary and premise;
- episode title, summary and script;
- private Story Bible;
- Studio Wiki entries;
- character continuity records;
- existing approved artwork;
- episode visual briefs;
- Episode Artwork Production Specification;
- Artwork Quality Index.

## Source-of-Truth and Review-Surface Rule

Supabase is the authoritative source for story content, image identity, asset paths and database relationships.

Studio is the mandatory controlled visual-review surface for artwork, regardless of whether the story or artwork is draft, approved or published.

The public website is an additional verification surface when reviewing an existing published image and is mandatory after a published image is replaced.

No image generation or image review should begin until the relevant story, episode, roadmap, Story Bible and Wiki records have been loaded to Supabase and read back successfully.

The image prompt and visual brief must be built from the Supabase records rather than from temporary conversation text. This ensures that artwork reflects the current stored version of:

- story summaries;
- episode summaries and scripts;
- character descriptions;
- settings and locations;
- emotional beats;
- roadmap-block details;
- Wiki continuity;
- Story Bible rules.

Supabase records establish what the image should depict. Studio or direct asset inspection establishes what the image actually looks like. Database paths, filenames, prompts and metadata alone are insufficient for an Artwork Quality Index assessment.

Where Supabase data is incomplete or inconsistent, the affected image must be marked as blocked rather than generated from assumptions.

Where the image cannot be viewed in Studio and cannot be inspected directly, the visual assessment must be marked as blocked. Technical checks may still be reported separately.

## Relationship to the Workflow Router

The Audio Platform Workflow Router may create fast, low-resolution draft concepts after its Supabase load and verification steps.

Draft concepts exist to establish:

- mood;
- visual direction;
- character feel;
- setting;
- episode atmosphere.

The Workflow Router should not spend significant time refining production artwork.

Draft availability in Studio exists so the assembled story package can be visually reviewed before public release. This includes covers, banners, episode cards, roadmap artwork, Wiki imagery and other rendered assets.

The Image Review Pipeline is responsible for:

- reviewing draft concepts;
- reviewing existing production or published artwork;
- checking images against the stored story data;
- replacing weak, inaccurate, duplicated or outdated images;
- refining approved concepts;
- producing final artwork;
- uploading and verifying production assets.

## Trigger Phrase

Use:

> Audio Platform Image Review Pipeline

Examples:

> Audio Platform Image Review Pipeline  
> Review and replace the artwork for Ash and Silver, Episodes 3, 5 and 7.

> Audio Platform Image Review Pipeline  
> Create a new cover, banner and artwork for Episodes 1–10 of The Cartographer’s Dream.

> Audio Platform Image Review Pipeline  
> Review the published artwork for The Cartographer’s Dream and identify any images that should be replaced.

## 1. Identify the Request

Confirm:

- story slug;
- requested assets;
- episode numbers or ranges;
- current story status: draft, review, published or archived;
- current artwork state: concept, draft, approved, production or published;
- operation: create, review, refine, replace or verify;
- whether the request is review-only;
- whether generation is authorised;
- whether upload and database linking are authorised;
- whether a published image is being replaced.

A single request may contain multiple asset types and operations.

| Asset | Target | Operation |
|---|---|---|
| Cover | Story | Replace published asset |
| Banner | Story | Review only |
| Episode artwork | Episodes 3, 5 and 7 | Create and upload |

## 2. Retrieve and Verify Supabase Context

Before assessing or generating an image:

1. retrieve the relevant Supabase records;
2. confirm that the expected story, episode, roadmap and Wiki records exist;
3. read the records back;
4. verify that the content is sufficient for image creation or review;
5. confirm the current image path, media asset and lifecycle state where available;
6. use the retrieved data to prepare the visual brief and assessment criteria.

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

## 3. Open Studio and Establish Visual Access

Open the relevant story in Studio mode before assigning an Artwork Quality Index or approving an image.

Inspect the artwork as it is actually rendered in its intended context:

- story card;
- story detail page;
- banner or hero area;
- episode card;
- episode detail or player;
- roadmap block;
- Wiki or character page where applicable.

Studio visual review is mandatory for draft, approved, production and published artwork.

For published artwork review, compare the Studio rendering with the currently published website where useful. Review-only work does not alter the live asset.

If Studio rendering is unavailable but the direct asset can be inspected, visual review may proceed with the Studio-display result marked blocked. If neither surface is available, do not calculate AQI.

## 4. Review Existing Artwork

Where artwork already exists, review it against:

- story and episode accuracy;
- character identity;
- age, clothing, hair and physical continuity;
- emotional expression;
- dream, memory, supernatural or altered-state treatment;
- setting accuracy;
- composition and focal event;
- thumbnail readability;
- responsive crop safety;
- consistency with neighbouring episode images;
- duplicate or near-duplicate imagery;
- text, logos, borders or watermarks;
- technical suitability;
- correct file and database path;
- suitability for its current lifecycle state.

Use the Artwork Quality Index to assess the image that is visible in Studio or available through direct asset inspection. Do not score a prompt, filename, path or database record as though it were an image.

Classify the visual result as:

- **Approved**
- **Approved with minor change**
- **Replace recommended**
- **Replace**
- **Missing**
- **Blocked by insufficient story detail**
- **Blocked by unavailable visual access**

The review must explain the specific reason for replacement rather than only stating that an image is unsuitable.

An existing published image may be retained, refined or replaced. Publication status does not prevent reassessment.

## 5. Separate Visual and Production Decisions

Every reviewed asset has two independent decisions.

| Decision | Meaning |
|---|---|
| Visual / AQI decision | Whether the image accurately and effectively represents the story or episode. |
| Production decision | Whether format, dimensions, filename, Storage object, media record and database linkage are compliant and verified. |

A visually successful image may still require technical correction.

Example:

| Asset | AQI | Visual result | Production result |
|---|---:|---|---|
| Episode 3 | 88 | Approved | Convert to JPEG and register in `media_assets` |

Do not describe a technically outdated asset as artistically unsuccessful unless the visual assessment supports that conclusion.

## 6. Prepare the Visual Brief

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
- intended artwork stage;
- Supabase source records used;
- whether the replacement affects a published asset.

Each image should normally show one clear story moment.

Dreams, memories, supernatural events and altered states must be identified explicitly.

## 7. Generate Concepts or Replacements

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

For a published replacement:

- keep the existing published image live while the replacement is prepared;
- review the replacement privately in Studio;
- do not change the live database link until the replacement has been approved;
- preserve the previous asset or its version information for rollback;
- do not unpublish the story merely to prepare replacement artwork.

## 8. Image Approval

The pipeline must clearly identify which image has been selected.

Approval may be expressed through statements such as:

- “Use this image.”
- “This one is approved.”
- “Make this the Episode 3 artwork.”
- “Upload these images.”
- “Replace the current artwork with these.”

Review-only instructions do not authorise generation, upload or replacement.

Once an image is approved and upload authority is included, the pipeline should proceed without asking the user to separately repeat the upload instruction.

For published assets, approval must identify whether the existing image is being retained, replaced or superseded by a new version.

## 9. Production Preparation

Approved artwork must be prepared according to the Episode Artwork Production Specification.

Default standards:

| Asset | Production dimensions |
|---|---:|
| Cover | 1024 × 1024 |
| Episode artwork | 1024 × 1024 |
| Roadmap artwork | 1024 × 1024 |
| Banner | 1280 × 720 |

Operational requirements:

- convert ordinary artwork to genuine JPEG;
- strip unnecessary metadata;
- preserve transparency only where genuinely required;
- verify the resulting image format;
- use predictable lowercase filenames;
- do not merely rename a PNG extension to `.jpg`.

Final Storage paths are derived by the supported upload implementation. Follow the destination profile in [`documentation/image-upload/destination-profiles.md`](../image-upload/destination-profiles.md); do not prescribe or override a path here.

## Storage transport decision

After image approval and explicit upload authority, select one route and keep its rules separate:

| Route | Use | Naming rule |
|---|---|---|
| GitHub queue and OIDC bridge | Supported production cover, banner and episode profiles | The upload function derives the canonical path and filename |
| Connected-Supabase Chat | Controlled private upload, copy and maintenance | An approved path may include a lowercase UUID filename; access still depends on bucket policy |

For linked production media, use copy-first relocation: discover every reference, copy, verify the destination, register or update `media_assets`, relink only the exact authorised records, verify Studio and public rendering, and retain the source for rollback. A direct `storage_move` is for unlinked objects only.

There is no `storage_file_rename` operation and no general atomic `media_relink` operation. A rename is a move to a new path; database relinking is a separate controlled step.

## 10. Upload and Database Linking

When upload is authorised:

1. send the approved production image through the supported artwork upload process;
2. upload the image to Supabase Storage;
3. register or update the corresponding `media_assets` record;
4. link the asset to the correct story, episode or roadmap block;
5. store a relative Storage path in the database;
6. preserve unrelated existing database fields;
7. replace the existing object safely where the asset is being revised;
8. preserve the previous asset or version information where a published image is replaced;
9. record enough information to restore the previous published asset if verification fails.

The database stores the path, not the image bytes.

Visual preparation and approval of a published replacement are supported. Database replacement of a published asset is currently blocked through the canonical GitHub upload bridge because it cannot safely preserve published status. Follow the [replacement runbook](../image-creation/replacement-runbook.md) and stop before upload until that capability is separately enabled and verified.

Where versioned paths are used, update only the intended story or episode link after the replacement has been approved.

## 11. Verification

After upload, verify:

- the Storage object exists;
- the object is a valid JPEG or approved alternative;
- the expected database record exists;
- the `media_assets` lifecycle and approval state are correct;
- the story or episode points to the correct asset;
- no unrelated artwork links were changed;
- the image displays correctly in Studio;
- draft images remain unavailable through public-only queries when the story is not published;
- the public website displays the updated image when a published asset was replaced;
- expected cards, detail pages, players and banners use the intended asset;
- stale caching does not continue to show the previous image;
- the previous published asset can be restored if verification fails.

Studio verification is mandatory for every completed create, refine or replace operation.

Public website verification is:

- not applicable for draft-only artwork;
- recommended when reviewing an existing published image without changing it;
- mandatory after a published image is replaced.

Do not report an image as complete merely because a database path has been updated.

## 12. Batch Behaviour

The pipeline can process one or many images.

Each image is treated independently:

- one failure must not prevent other valid assets from processing;
- duplicate episode images should be detected;
- failures should identify the exact asset;
- successful uploads should not be repeated unnecessarily;
- only failed items should require rerunning;
- replacing one published image must not alter neighbouring episode assets.

For large batches, process an acceptance set first:

- cover;
- banner;
- Episode 1;
- Episode 2.

Proceed with the remaining batch only after Storage, database and Studio verification succeeds. Where published assets are being replaced, the acceptance set must also pass public website verification.

## 13. Completion Report

| Area | Result |
|---|---|
| Supabase records retrieved | Complete / blocked |
| Supabase source verified | Complete / blocked |
| Studio visual access | Complete / blocked |
| Existing artwork reviewed | Complete / not applicable / blocked |
| AQI assessment | Complete / blocked |
| Visual briefs prepared | Complete / blocked |
| Concepts or replacements created | Complete / not required |
| Images approved | Yes / pending |
| Visual decision | Approved / minor change / replace recommended / replace / blocked |
| Production conversion | Verified / blocked |
| Supabase Storage upload | Verified / blocked |
| `media_assets` registration | Verified / blocked |
| Story/episode links | Verified / blocked |
| Previous published asset preserved | Verified / not applicable / blocked |
| Studio display | Verified / blocked |
| Public website display | Verified / not applicable / blocked |
| Rollback readiness | Verified / not applicable / blocked |
| Image Review Pipeline complete | Yes / No |

## Reusable Instruction

> **Audio Platform Image Review Pipeline**
>
> Retrieve and verify the relevant story, episode, roadmap, Story Bible and Wiki records from Supabase before reviewing or generating artwork. Supabase is the source of truth for content, asset identity and database relationships.
>
> Open the story in Studio and review the actual rendered cover, banner, episode or roadmap artwork. Studio is the mandatory controlled visual-review surface for draft, approved, production and published artwork. Calculate AQI only from artwork that can actually be viewed in Studio or inspected directly.
>
> Review the requested artwork using the stored records, existing visual briefs, approved character references and continuity requirements. Identify missing, inaccurate, duplicated, outdated or unsuitable artwork. Separate the visual decision from the production-compliance decision.
>
> The pipeline may be used to create new artwork, review existing draft or published images, refine an approved image or replace a published asset. Review-only work must not change the live image.
>
> Once I approve an image and authorise upload, prepare the production JPEG, upload it through the supported artwork process, register it in `media_assets`, link it to the correct story or episode, and verify Storage, database and Studio display. When replacing a published image, keep the existing image live until the replacement is approved, preserve the previous asset for rollback, and verify the result on the public website. Process each image independently and report the first failure for each asset.

## Pipeline Position

This pipeline sits between the Audio Platform Draft Pipeline and the Audio Platform Review Pipeline, while remaining independently callable throughout the artwork lifecycle.

It can review, repair or replace draft and published images without rerunning the full Draft Pipeline or changing the story's publication status.

## Version History

| Version | Date | Change |
|---|---|---|
| 1.1 | 29 Jul 2026 | Added Studio as the mandatory visual-review surface, separated visual and production decisions, and formalised published-image review, replacement, verification and rollback. |
| 1.0 | Initial | Original image creation, review, upload and verification workflow. |
