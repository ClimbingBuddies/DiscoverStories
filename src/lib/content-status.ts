export const CONTENT_STATUSES = [
  "draft",
  "review",
  "scheduled",
  "published",
  "archived",
] as const;

export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const PUBLIC_CONTENT_STATUSES: readonly ContentStatus[] = ["published"];

export const PRODUCTION_STATUS_LABELS: Record<Exclude<ContentStatus, "published">, string> = {
  draft: "Draft",
  review: "In Review",
  scheduled: "Scheduled",
  archived: "Archived",
};

export function isPublishedStatus(status: string): status is "published" {
  return status === "published";
}

export function isProductionStatus(
  status: string
): status is Exclude<ContentStatus, "published"> {
  return CONTENT_STATUSES.includes(status as ContentStatus) && status !== "published";
}
