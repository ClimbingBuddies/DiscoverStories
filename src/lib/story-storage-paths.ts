export const CANONICAL_STORY_BUCKET = "stories";
export const LEGACY_IMAGE_BUCKET = "story-images";

type StoryPathInput = {
  storyId: string;
};

type EpisodePathInput = StoryPathInput & {
  seasonId: string;
  episodeId: string;
};

function segment(value: string, name: string): string {
  const cleaned = value.trim().replace(/^\/+|\/+$/g, "");
  if (!cleaned || cleaned.includes("/")) {
    throw new Error(`${name} must be one storage path segment.`);
  }
  return cleaned;
}

export function storyStorageRoot({ storyId }: StoryPathInput): string {
  return `${segment(storyId, "storyId")}/`;
}

export function storyAssetPath(
  input: StoryPathInput,
  kind: "cover" | "banner" | "references",
  filename: string,
): string {
  return `${storyStorageRoot(input)}story/${kind}/${segment(filename, "filename")}`;
}

export function canonAssetPath(
  input: StoryPathInput,
  kind: "characters" | "locations" | "objects" | "visual-tests",
  filename: string,
): string {
  return `${storyStorageRoot(input)}canon/${kind}/${segment(filename, "filename")}`;
}

export function wikiAssetPath(
  input: StoryPathInput,
  kind: "characters" | "locations" | "concepts",
  filename: string,
): string {
  return `${storyStorageRoot(input)}wiki/${kind}/${segment(filename, "filename")}`;
}

export function episodeAssetPath(
  input: EpisodePathInput,
  kind: "artwork" | "reader" | "audio" | "attachments",
  filename: string,
): string {
  const seasonId = segment(input.seasonId, "seasonId");
  const episodeId = segment(input.episodeId, "episodeId");
  return `${storyStorageRoot(input)}seasons/${seasonId}/episodes/${episodeId}/${kind}/${segment(filename, "filename")}`;
}

