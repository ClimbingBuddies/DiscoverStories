import { LEGACY_IMAGE_BUCKET } from "@/lib/story-storage-paths";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
}

export function getPublicStorageUrl(path: string): string {
  const trimmedPath = path.replace(/^\/+/, "");
  // Add cache buster parameter to force fresh images
  const cacheBuster = Math.floor(Date.now() / 3600000); // Changes every hour
  return `${supabaseUrl}/storage/v1/object/public/${LEGACY_IMAGE_BUCKET}/${trimmedPath}?v=${cacheBuster}`;
}

type StorageAssetResolution = {
  canonicalUrl?: string | null;
  legacyPath?: string | null;
  fallbackUrl?: string;
};

/**
 * Release 2 resolver: prefer an authorised URL from the private stories bucket,
 * then fall back to the unchanged legacy public object path.
 */
export function resolveStorageAssetUrl({
  canonicalUrl,
  legacyPath,
  fallbackUrl = "/images/story-placeholder.png",
}: StorageAssetResolution): string {
  if (canonicalUrl) return canonicalUrl;
  if (legacyPath) return getPublicStorageUrl(legacyPath);
  return fallbackUrl;
}

export function getStorageImageUrl(imagePath: string | null): string {
  return resolveStorageAssetUrl({ legacyPath: imagePath });
}
