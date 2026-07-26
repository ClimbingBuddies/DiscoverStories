const bucketName = "story-images";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
}

export function getPublicStorageUrl(path: string): string {
  const trimmedPath = path.replace(/^\/+/, "");
  // Add cache buster parameter to force fresh images
  const cacheBuster = Math.floor(Date.now() / 3600000); // Changes every hour
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${trimmedPath}?v=${cacheBuster}`;
}

export function getStorageImageUrl(imagePath: string | null): string {
  if (!imagePath) {
    return "/images/story-placeholder.png";
  }

  return getPublicStorageUrl(imagePath);
}
