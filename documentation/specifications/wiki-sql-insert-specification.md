# Wiki SQL Insert Specification

**Status:** Current project standard  
**Scope:** Idempotent loading of private Story Bible, Studio Wiki and published Wiki records

## 1. Separation of responsibilities

- **Private Story Bible:** complete internal canon, secrets, future plans and production context.
- **Studio Wiki:** draft and review presentation of private, planned and draft knowledge when Studio is enabled.
- **Published Wiki:** reader-facing, spoiler-safe content only.

The Studio toggle is a temporary development control. Authentication, roles and database-enforced permissions/RLS are the future access boundary.

## 2. Episode references

Published Wiki entries may reference only published, reader-safe individual episode rows.

Studio Wiki and private Story Bible entries may reference:
- a full episode row; or
- a roadmap-block row such as Episodes 11–20, together with a planned episode number stored in the block's structured data.

A roadmap block does not require ten individual episode rows and must not be represented as ten completed public episodes.

## 3. Loading

Loads must be idempotent and scoped to one story. Use stable story/wiki keys and upsert records. Do not delete records merely because they are absent from a revision. Keep private fields out of published responses.

## 4. Repeatable workflow

Draft runs may create or revise Story Bible, Studio Wiki and roadmap knowledge. Review runs may assess and revise that material repeatedly. Public Wiki loading occurs only after the Public Pipeline has approved the content and its episode dependencies.

## 5. Verification

Verify story scope, stable keys, public/private classification, roadmap-block references, planned episode numbers, spoiler controls and rerun counts. Public queries must return published public-safe content only.

## 6. Definition of done

A Wiki load is complete when it can be safely rerun, preserves private/public separation, supports Studio review of roadmap blocks and prevents unpublished or private material from appearing in the published Wiki.
