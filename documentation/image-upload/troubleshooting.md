# Image Upload Troubleshooting and Evidence

## Use

First identify the selected route: GitHub queue/OIDC production upload or connected-Supabase Chat Storage management. Match the observed failure to that route and table. Do not change pathways before identifying the failed gate.

| Symptom | Likely cause | Required response |
|---|---|---|
| Manifest exists but nothing can upload | `image.b64` is missing | Add actual Base64 image bytes; do not retry manifest-only |
| Base64 decode failed | Invalid or empty `image.b64` | Re-encode the source image and validate locally |
| JPEG conversion failed | Source is not a readable image or conversion failed | Inspect the decoded source; do not rename extensions |
| `magick: command not found` | ImageMagick 6 environment | Use workflow fallback to `convert`; current workflow supports both |
| Queue count is larger than requested | Pull-request scan found historical `batch.json` files | Stop; use an exact manual `queue_path` |
| Wrong items processed | Batch discovery took precedence over standalone manifests | Stop and isolate the intended queue |
| Upload failed before request | DNS, connector or credential unavailable | Do not report any Supabase change; retain queue for later retry |
| HTTP 400/not found on public URL | Object missing or not public | Check Storage object and bucket visibility before database changes |
| `.jpg` reports `image/png` | Extension was renamed without conversion | Convert genuine bytes and replace through the controlled pipeline |
| Database points to missing object | Link changed before upload verification | Restore the previous link, then rerun in correct order |
| Canon upload requests missing object slug | Workflow does not forward Canon fields | Stop: Canon profile blocked |
| Reader path contains invalid episode text | Reader values were not assigned by upload function | Stop: Reader profile blocked |
| Workflow is green but no intended link changed | Wrong queue item or incomplete destination handler | Mark failed/not verified and inspect result artifact |
| Story or episodes changed status | `workflowStatus` caused a broad status update | Stop, report affected records and restore only with explicit authority |

## Connected-Supabase Chat checks

For `storage_upload`, `storage_copy` or `storage_move`, separately verify the source/destination bucket, exact path, MIME type, size and eTag/checksum where available. A successful Storage response does not prove that `media_assets`, episode/story fields, Canon, Wiki or Reader content were relinked.

For linked production media, do not use direct move. Copy first, verify, relink only authorised references, verify Studio and website rendering, retain the source for rollback, then submit the source to controlled cleanup.

## Proven successful pattern

Successful uploads used this sequence:

```text
real source image
→ Base64 queue content
→ GitHub Actions
→ ImageMagick conversion to genuine JPEG
→ OIDC-authenticated Supabase bridge
→ Storage object
→ media_assets row
→ intended link
→ public URL and rendering verification
```

Successful evidence has included:

- a three-image run where 3/3 items reached `story-images`, three media rows were created, and two episode paths plus one story cover path were updated;
- an Aristotle acceptance run where Episodes 3–10 were linked to genuine JPEG objects;
- public episode rebuilds where existing PNGs were converted to JPEG, uploaded, registered, relinked and verified with HTTP 200.

## Proven failed patterns

The following are not acceptable substitutes:

- direct Supabase upload without an available authenticated upload capability;
- direct Edge Function calls when DNS or service credentials are unavailable;
- GitHub manifest without image bytes;
- attempting a binary commit through a text-only connector;
- renaming `.png` to `.jpg`;
- treating private object existence as proof of a public URL;
- updating the database first and hoping the upload succeeds later.

## Failure handling

If upload fails before Storage creation:

- report no Storage or database change;
- correct the queue input;
- rerun only the failed item.

If Storage succeeds but registration or linking fails:

- the upload function should remove the newly created Storage object;
- verify removal;
- report whether rollback succeeded.

If a batch is partial:

- use the result artifact to identify failed items;
- do not rerun successful items unnecessarily;
- prepare a queue containing only failures;
- keep the final outcome as partial until all intended items pass.

## Idempotency

The media registration code looks up `media_assets` by `storage_path` and updates the existing row when present. Storage upload uses upsert for versioned paths.

This supports retries, but it is not permission to rerun an uncontrolled historical queue. Always confirm the exact intended items first.

## Acceptance test sequence

For each newly enabled profile:

1. one non-production test image;
2. Storage, MIME, media row, link, HTTP and rendering verification;
3. one controlled replacement using the established canonical identity;
4. a small batch;
5. only then normal production use.

Reader and Canon must each complete this sequence after their current implementation blockers are fixed.
