import { CANONICAL_STORY_BUCKET, LEGACY_IMAGE_BUCKET } from "@/lib/story-storage-paths";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
}

export function getPublicStorageUrl(path: string): string {
  const trimmedPath = path.replace(/^\/+/, "");
  const cacheBuster = Math.floor(Date.now() / 3600000);
  return `${supabaseUrl}/storage/v1/object/public/${LEGACY_IMAGE_BUCKET}/${trimmedPath}?v=${cacheBuster}`;
}

function isCanonicalPrivatePath(path: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\//i.test(path);
}

export function getPrivateStorageUrl(path: string): string {
  const trimmedPath = path.replace(/^\/+/, "");
  return `${supabaseUrl}/functions/v1/storage-media?path=${encodeURIComponent(trimmedPath)}`;
}

type StorageAssetResolution = {
  canonicalUrl?: string | null;
  legacyPath?: string | null;
  fallbackUrl?: string;
};

export function resolveStorageAssetUrl({
  canonicalUrl,
  legacyPath,
  fallbackUrl = "/images/story-placeholder.png",
}: StorageAssetResolution): string {
  if (canonicalUrl) return canonicalUrl;
  if (legacyPath) {
    const trimmedPath = legacyPath.replace(/^\/+/, "");
    return isCanonicalPrivatePath(trimmedPath)
      ? getPrivateStorageUrl(trimmedPath)
      : getPublicStorageUrl(trimmedPath);
  }
  return fallbackUrl;
}

export function getStorageImageUrl(imagePath: string | null): string {
  return resolveStorageAssetUrl({ legacyPath: imagePath });
}

export { CANONICAL_STORY_BUCKET };
