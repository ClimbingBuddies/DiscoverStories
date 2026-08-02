export const CANONICAL_STORY_BUCKET = "stories";
export const LEGACY_IMAGE_BUCKET = "story-images";
export const LEGACY_AUDIO_BUCKET = "story-audio";

function segment(value: string, name: string): string {
  const cleaned = value.trim().replace(/^\/+|\/+$/g, "");
  if (!cleaned || cleaned.includes("/")) {
    throw new Error(`${name} must be one storage path segment.`);
  }
  return cleaned;
}

export function canonicalEpisodeAssetPath(input: {
  storyId: string;
  seasonId: string;
  episodeId: string;
  kind: "artwork" | "reader" | "audio" | "attachments";
  filename: string;
}): string {
  return `${segment(input.storyId, "storyId")}/seasons/${segment(input.seasonId, "seasonId")}/episodes/${segment(input.episodeId, "episodeId")}/${input.kind}/${segment(input.filename, "filename")}`;
}

