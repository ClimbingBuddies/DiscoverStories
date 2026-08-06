# Image Creation Entry Point

## Purpose

Use this folder to create, refine or replace artwork. It controls creative routing only. Upload conversion, Storage paths, database linking and technical verification are controlled by [`documentation/image-upload/README.md`](../image-upload/README.md).

## Authority and reading order

1. Read the stored story source and continuity records.
2. Read the authoritative [`Episode Artwork Production Specification`](../specifications/episode-artwork-production-specification.md).
3. For a smaller model, follow the [`Low-Capacity Model Runbook`](./low-capacity-model-runbook.md) literally.
4. For an existing asset, also follow the [`Replacement Runbook`](./replacement-runbook.md).
5. Use the [`Artwork Quality Index`](../specifications/artwork-quality-index.md) only after viewing the actual image.
6. After approval and explicit upload authority, hand off to the [Reliable Image Upload Guides](../image-upload/README.md).

If documents conflict, the Episode Artwork Production Specification v1.5 controls creative production and the Reliable Image Upload Guides control conversion, upload, linking and verification.

## Operation words

| Request | Required result |
|---|---|
| **PREPARE** | Produce a visual brief and prompt only. Do not generate or upload. |
| **GENERATE** | Generate one actual viewable Concept image, show it with a short art-direction summary, then stop for approval. |
| **REPLACE** | Inspect the existing asset, generate one replacement Concept, obtain approval, then follow the replacement runbook. |
| **REVIEW** | Inspect the actual image and report AQI or a concise visual decision. Do not generate or upload unless separately authorised. |

## Required source gate

For episode artwork, retrieve the full script when it exists. Otherwise use the approved synopsis plus required continuity records. For story-level artwork, retrieve the approved premise, summary, setting and principal-character context.

Stop when required source or continuity cannot be retrieved. Do not create from the title alone and do not substitute conversation memory for missing stored records.

## Default approval rule

Generate one Concept image. Show the image and art-direction summary. Stop for approval. Do not refine, produce, upload or replace anything until the user explicitly authorises the next stage.

Generate alternatives only when explicitly requested or when the user approves exploration of materially different directions.

## Technical boundary

The current canonical upload path supports draft/review cover, banner and episode artwork. Canon, Reader/Tiptap and published-status-preserving replacements remain blocked as documented in the upload capability matrix. Creative preparation may continue, but the blocked upload must not be substituted with another role or pathway.
