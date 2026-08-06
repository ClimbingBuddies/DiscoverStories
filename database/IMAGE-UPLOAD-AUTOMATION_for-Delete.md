# Automatic image upload process

> **DEPRECATED — FOR DELETE.** Do not use this document. It is retained temporarily for review history. The authoritative upload entry point is [`documentation/image-upload/README.md`](../documentation/image-upload/README.md).

The supported Draft route is:

```text
Generated image → real JPEG conversion → GitHub queue → OIDC bridge
→ Supabase Storage → media_assets → story/episode link → status update
```

The bridge is asynchronous infrastructure, not a direct ChatGPT file-upload tool.

## Draft file policy

- Ordinary Draft artwork is converted to genuine JPEG bytes before upload.
- The workflow resizes to a maximum of 1280×1280, strips metadata and uses JPEG quality 82.
- Changing an extension is not conversion; the workflow verifies the JPEG signature.
- PNG is retained only where transparency is required or a later production decision explicitly calls for it.
- Database fields store relative Storage paths.

## Reliability behaviour

- Each image is processed independently and temporary failures are retried three times.
- A failed image does not prevent later queue items from being attempted.
- The result artifact lists successes and failures so only failed items need rerunning.
- Versioned Draft paths use safe Storage upsert.
- Workflow status is changed only after upload, media registration, linking and Storage verification succeed.
- An asset is not complete until its public object, database field and website display are verified.

## Acceptance test

Before a full batch, queue one cover, one banner and Episodes 1–2. Success means all four are genuine JPEGs, exist in Storage, are linked in the database, display on the website and the result artifact reports zero failures. Only then queue Episodes 3–10.

## Queue fields

Each queue item needs `storySlug`, `assetRole`, `stage`, `workflowStatus`, `versionNumber` and `imageBase64`. Episode items also need `seasonNumber` and `episodeNumber`.

## Legacy storage sync

The existing `sync-storage-image` webhook remains available for manually uploaded, correctly named objects. It is separate from the GitHub OIDC bridge.
