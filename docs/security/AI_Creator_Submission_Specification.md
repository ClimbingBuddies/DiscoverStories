# AI Creator Submission Security Specification

**Audio Platform / Discover Stories**  
**Status:** Draft specification for review  
**Purpose:** Define how creators and reviewers can use their own AI tools while submitting controlled changes to the platform without exposing private platform specifications.

---

## 1. Design Principle

Creators use their own AI memberships and tools for creative development. Discover Stories does not provide unrestricted AI database access.

The platform accepts structured submissions only through controlled import points.

The AI conversation remains creator-owned. The platform remains the source of truth for validation, ownership, security and data loading.

---

## 2. High-Level Workflow

```
Creator's AI conversation
        ↓
Controlled submission format
        ↓
Discover Stories submission box
        ↓
Validation
        ↓
Preview / review
        ↓
Approved load process
        ↓
Database update
```

The creator AI should create content packages, not database commands.

---

## 3. Submission Types

The platform should expose controlled submission categories rather than direct database operations.

Examples:

- Story Deployment
- Story Update
- Episode Upload
- Private Canon Update
- Character Update
- Location Update
- Artwork Brief Submission
- Wiki Update

Each submission type has its own expected structure, validation rules and approved loading process.

---

## 4. AI Responsibility Boundary

The creator AI may assist with:

- brainstorming;
- story development;
- drafting narrative content;
- formatting approved submission packages;
- preparing JSON according to the published submission contract.

The creator AI must not:

- receive database credentials;
- execute SQL;
- call unrestricted stored procedures;
- access another creator's content;
- receive private platform specifications unless explicitly authorised.

---

## 5. Protected Platform Intelligence

The following remain private platform assets:

- internal creative methodology;
- validation rules;
- security rules;
- publication workflows;
- reviewer scoring logic;
- database structure;
- stored procedure names;
- internal quality controls.

Creators receive a submission contract, not the complete platform implementation.

---

## 6. Submission Validation Flow

All AI-generated submissions must pass:

1. Format validation.
2. Schema/version validation.
3. Authentication validation.
4. Ownership validation.
5. Submission type validation.
6. Required field validation.
7. Preview generation.
8. User confirmation.
9. Controlled database loading.

---

## 7. Database Loading Principle

AI submissions must never directly modify production records.

Recommended flow:

```
AI Package
    ↓
Submission Staging
    ↓
Validation Results
    ↓
Approved Change Set
    ↓
Controlled Loader Procedure
    ↓
Audit Record
```

Stored procedures remain internal implementation details.

---

## 8. JSON Submission Standard

Submission packages should describe the intended content change.

They should not contain:

- SQL statements;
- table names as instructions;
- procedure calls;
- security credentials;
- storage secrets.

Example concept:

```json
{
  "submission_type": "episode_upload",
  "schema_version": "1.0",
  "story_reference": "story-slug",
  "episode": {
    "episode_number": 1,
    "title": "Episode Title",
    "summary": "Episode summary",
    "content": "Narrative content"
  }
}
```

---

## 9. Creator and Reviewer Security

Creators:

- access only their owned stories;
- submit changes to permitted projects;
- cannot view other creators' private material.

Reviewers:

- access only assigned review items;
- provide feedback and approval decisions;
- cannot access unrelated private content.

Database Row Level Security remains the final enforcement layer.

---

## 10. Relationship to Existing Specifications

This specification extends the existing production workflow:

- Story Creation Specification defines the creative package, private story bible, episode batches and review gates.
- Story SQL Insert Specification defines safe, idempotent story and episode loading.
- Wiki SQL Insert Specification defines public/private continuity loading and spoiler controls.
- Episode Artwork Production Specification defines visual asset standards.

This document defines the security boundary between creator AI tools and the platform.

---

## 11. Future Options

Possible future implementations:

### Phase 1
Manual structured JSON submission.

### Phase 2
Creator tools provide formatting templates and validation assistance.

### Phase 3
Optional authenticated AI actions submit packages directly through approved APIs.

The submission contract remains the stable integration point.

---

## Definition of Done

The AI creator workflow is complete when creators can use their own AI tools, submit structured packages, receive validation feedback, and load approved content without exposing platform security controls or private implementation details.
