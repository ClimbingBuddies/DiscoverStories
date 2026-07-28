# Draft Story Pipeline Verification Specification

**Version:** 1.0  
**Status:** Working standard

## 1. Purpose

This specification proves that a story has reached a technically complete Draft. It does not assess literary or artwork quality. Quality review begins only after this verification passes.

## 2. Current Draft Story Pipeline scope

A complete draft currently contains:

- one story row with `content_status = 'draft'`,
- exactly ten Season 1 episode rows with `episode_status = 'draft'`,
- a populated wiki for the opening batch,
- one linked story cover,
- one linked story banner,
- ten linked episode images,
- matching Storage objects,
- matching `media_assets` records.

The pipeline finishes at Draft. Review and publication are separate editorial workflow stages.

## 3. Required verification result

| Stage | Required evidence |
|---|---|
| Story | Exactly one story for the slug and status `draft`. |
| Episodes | Exactly ten episodes, numbered 1–10 once each, all status `draft`. |
| Wiki | At least one valid wiki entry for the story; deeper specification compliance is tested later. |
| Artwork generated | Cover, banner and ten episode assets exist as files or registered generated assets. |
| Artwork uploaded | Twelve expected Storage objects exist and have non-zero size. |
| Artwork linked | Story cover/banner paths and every episode artwork path are non-null and point to the intended story folder. |
| Media registration | Twelve corresponding `media_assets` records exist. |
| Verification | Counts, identities, paths and statuses agree across database and Storage. |

## 4. Pass rule

`Pipeline Complete = Yes` only when every required stage passes.

Do not report completion when images have merely been generated, when uploads are still pending, or when paths exist but Storage objects do not.

## 5. Required report

```text
Story Pipeline
Story                 ✅
Episodes              ✅ 10/10
Wiki                  ✅
Artwork Generated     ✅ 12/12
Artwork Uploaded      ✅ 12/12
Artwork Linked        ✅ 12/12
Verification          ✅

Pipeline Complete     Yes
```

If a stage fails, report the exact failing stage and evidence. Do not replace a failed stage with a quality qualification or partial-completion claim.

## 6. Separation from quality review

Pipeline verification answers: **Is the complete draft present and connected?**

Story Quality answers: **How strong is the writing?**

Artwork review answers: **Does each image meet the creative and technical specification?**

These reviews must not prevent the first technical pipeline proof from reaching Draft, but they are required before later approval or publication decisions.

## 7. Definition of done

The Draft Story Pipeline is complete when the story, ten episodes, wiki, cover, banner and ten episode images are present, uploaded, linked and verified while all story content remains in Draft.
