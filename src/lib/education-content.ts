export type EducationMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

export type EducationNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: EducationNode[];
  text?: string;
  marks?: EducationMark[];
};

export type EducationDocument = {
  type: "doc";
  content: EducationNode[];
};

export const SPEED_OF_LIGHT_METRES_PER_SECOND = 299_792_458;
export const ASTRONOMICAL_UNIT_KILOMETRES = 149_597_870.7;
export const LIGHT_YEAR_KILOMETRES = 9_460_730_472_580.8;

export function isEducationDocument(value: unknown): value is EducationDocument {
  if (!value || typeof value !== "object") return false;
  const document = value as { type?: unknown; content?: unknown };
  return document.type === "doc" && Array.isArray(document.content);
}

export function finiteNonNegative(value: number): number {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

export function formatNumber(value: number, maximumFractionDigits = 3): string {
  return value.toLocaleString("en-AU", { maximumFractionDigits });
}

export function formatDistance(kilometres: number): string {
  if (kilometres >= 1_000_000_000_000) {
    return `${formatNumber(kilometres / 1_000_000_000_000)} trillion km`;
  }
  if (kilometres >= 1_000_000_000) {
    return `${formatNumber(kilometres / 1_000_000_000)} billion km`;
  }
  if (kilometres >= 1_000_000) {
    return `${formatNumber(kilometres / 1_000_000)} million km`;
  }
  return `${formatNumber(kilometres)} km`;
}

export function formatDuration(seconds: number): string {
  if (seconds >= 3600) return `${formatNumber(seconds / 3600)} hours`;
  if (seconds >= 60) return `${formatNumber(seconds / 60)} minutes`;
  if (seconds >= 1) return `${formatNumber(seconds)} seconds`;
  if (seconds >= 0.001) return `${formatNumber(seconds * 1000)} milliseconds`;
  return `${formatNumber(seconds * 1_000_000)} microseconds`;
}
