# Low-Capacity Model Image Creation Runbook

Follow this document literally. Do not reconcile conflicting guidance yourself; use the authority order in [`README.md`](./README.md).

## 1. Classify the request

- **PREPARE:** brief and prompt only.
- **GENERATE:** one actual Concept image.
- **REPLACE:** one replacement Concept after inspecting the existing image.
- **REVIEW:** inspect the actual image; do not generate.

If the requested operation is unclear, ask one precise question and stop.

## 2. Retrieve sources

Retrieve the exact story and asset target from the authoritative database records.

For episode artwork, retrieve:

- story slug;
- season and episode number;
- full script when available, otherwise the approved synopsis;
- relevant character and world continuity;
- current artwork when reviewing or replacing.

Stop if the target does not resolve exactly once, the source is missing, or required continuity cannot be retrieved. Never use the title alone.

## 3. Select one moment

Record:

- the source-backed moment;
- the emotion and its cause;
- the focal subject and action;
- continuity constraints;
- crop-safe composition;
- exclusions and spoilers.

Do not combine unrelated scenes.

## 4. Produce only the requested deliverable

For **PREPARE**, return the visual brief and prompt, then stop.

For **GENERATE** or **REPLACE**:

1. generate one actual Concept image;
2. show the image;
3. provide a short art-direction summary and source alignment statement;
4. stop for approval.

Do not generate three alternatives by default. Do not refine, create a Production image, upload or change a database record.

For **REVIEW**, inspect the actual image. If it cannot be viewed directly or in Studio, report **BLOCKED — image not visually accessible**. Never score a prompt, path or metadata as though it were the image.

## 5. After approval

Proceed only with the stage explicitly authorised:

- approved Concept → Refine;
- approved Refine → Production;
- approved Production plus upload authority → upload hand-off.

Before upload, read [`documentation/image-upload/README.md`](../image-upload/README.md). Do not invent filenames or Storage paths.

## Blocked uploads

Stop and report **BLOCKED** for:

- Canon or character-reference upload;
- Reader/Tiptap upload;
- published replacement whose publication status cannot be preserved;
- any unsupported asset role.

Do not substitute cover, banner or episode artwork for a blocked role.
