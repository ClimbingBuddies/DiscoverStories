# Image Replacement Runbook

## Purpose

Use this process when an existing cover, banner, episode, roadmap, Canon or Reader image may be replaced. Review and creative preparation do not authorise upload or database changes.

## 1. Inspect before changing

Retrieve and record:

- exact story and asset identity;
- current image path and media asset ID;
- current content and artwork status;
- actual rendered image in Studio or by direct inspection;
- approved source and continuity records;
- whether the asset is published;
- rollback identity for the current asset.

If the image cannot be viewed, visual replacement is blocked. If the target does not resolve exactly once, stop.

## 2. Decide

Use the Artwork Quality Index where helpful and choose one result:

- retain;
- minor refinement;
- replacement recommended;
- replace;
- blocked.

Review-only work must leave the current asset unchanged.

## 3. Create the replacement

Use the authoritative production specification and the default one-Concept approval rule:

1. select one source-backed moment;
2. generate one actual replacement Concept;
3. show it beside a short explanation of what it fixes;
4. stop for approval;
5. refine and produce only after separate approval.

Keep the existing asset live throughout preparation.

## 4. Upload gate

Upload requires explicit authority and a supported destination in [`documentation/image-upload/README.md`](../image-upload/README.md).

Draft/review cover, banner and episode replacements may proceed through the canonical upload runbook.

Published database replacement is currently **BLOCKED** because the GitHub upload bridge cannot safely preserve published status. Do not downgrade status, manually relink as a workaround, overwrite the live object, or claim replacement support. The replacement Production image may be prepared and approved, but upload must wait for a separately implemented and verified published-preservation pathway.

Canon and Reader/Tiptap replacements remain blocked by their destination-profile limitations.

## 5. Verification and rollback

For a supported replacement, verify in this order:

1. new Storage object;
2. genuine JPEG and correct MIME;
3. `media_assets` registration;
4. exact target link;
5. previous content status preserved;
6. unrelated records unchanged;
7. HTTP 200 where public;
8. Studio rendering;
9. public rendering where applicable;
10. rollback asset remains recoverable.

Report **SUCCESS** only when every applicable gate passes. Otherwise report **FAILED**, **NOT VERIFIED** or **BLOCKED** and name the exact gate.
