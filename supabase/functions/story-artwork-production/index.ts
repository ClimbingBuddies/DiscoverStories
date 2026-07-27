import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.55.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BUCKET = Deno.env.get("SUPABASE_STORAGE_BUCKET") ?? "story-images";
const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const allowedStatuses = new Set(["draft", "review"]);
const allowedStages = new Set(["concept", "refined", "production"]);
const allowedRoles = new Set(["cover", "banner", "episode"]);
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileBytes = 12 * 1024 * 1024;

type AssetRole = "cover" | "banner" | "episode";
type Stage = "concept" | "refined" | "production";

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}

function cleanSlug(value: string): string {
  const slug = value.trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Invalid storySlug.");
  return slug;
}

function positiveInteger(value: FormDataEntryValue | null, field: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`${field} must be a positive integer.`);
  return parsed;
}

function fileExtension(mimeType: string): string {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  throw new Error(`Unsupported MIME type: ${mimeType}`);
}

function canonicalPath(args: {
  slug: string;
  role: AssetRole;
  stage: Stage;
  season?: number;
  episode?: number;
  version: number;
  extension: string;
}): string {
  const suffix = args.stage === "production" ? "" : `-${args.stage}-${String(args.version).padStart(2, "0")}`;
  if (args.role === "cover") return `${args.slug}/${args.slug}-cover${suffix}.${args.extension}`;
  if (args.role === "banner") return `${args.slug}/${args.slug}-banner${suffix}.${args.extension}`;
  return `${args.slug}/episodes/${args.slug}-s${String(args.season).padStart(2, "0")}e${String(args.episode).padStart(2, "0")}${suffix}.${args.extension}`;
}

async function requireAdmin(request: Request): Promise<string> {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) throw new Error("Missing bearer token.");

  const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) throw new Error("Authentication failed.");

  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("is_admin")
    .eq("user_id", userData.user.id)
    .single();
  if (profileError || profile?.is_admin !== true) throw new Error("Administrator access is required.");
  return userData.user.id;
}

async function resolveStory(slug: string) {
  const { data, error } = await db
    .from("stories")
    .select("id, slug, title, content_status, cover_image_path, banner_image_path")
    .eq("slug", slug)
    .single();
  if (error || !data) throw new Error(`Story '${slug}' was not found.`);
  return data;
}

async function setStoryWorkflowStatus(slug: string, status: string) {
  if (!allowedStatuses.has(status)) throw new Error("Status must be draft or review.");
  const story = await resolveStory(slug);
  const now = new Date().toISOString();

  const { error: storyError } = await db.from("stories")
    .update({ content_status: status, updated_at: now })
    .eq("id", story.id);
  if (storyError) throw storyError;

  const { error: episodeError } = await db.from("episodes")
    .update({ episode_status: status, updated_at: now })
    .eq("story_id", story.id)
    .neq("episode_status", "archived");
  if (episodeError) throw episodeError;

  return { storyId: story.id, storySlug: slug, status };
}

async function uploadAsset(form: FormData, actorUserId: string) {
  const slug = cleanSlug(String(form.get("storySlug") ?? ""));
  const role = String(form.get("assetRole") ?? "") as AssetRole;
  const stage = String(form.get("stage") ?? "concept") as Stage;
  const workflowStatus = String(form.get("workflowStatus") ?? "review");
  const version = positiveInteger(form.get("versionNumber") ?? "1", "versionNumber");
  const generationNotes = String(form.get("generationNotes") ?? "").trim() || null;
  const file = form.get("file");

  if (!allowedRoles.has(role)) throw new Error("assetRole must be cover, banner or episode.");
  if (!allowedStages.has(stage)) throw new Error("stage must be concept, refined or production.");
  if (!allowedStatuses.has(workflowStatus)) throw new Error("workflowStatus must be draft or review.");
  if (!(file instanceof File)) throw new Error("A file upload is required.");
  if (!allowedMimeTypes.has(file.type)) throw new Error("Only JPEG, PNG and WebP images are accepted.");
  if (file.size < 1 || file.size > maxFileBytes) throw new Error("Image must be between 1 byte and 12 MB.");

  const story = await resolveStory(slug);
  await setStoryWorkflowStatus(slug, workflowStatus);

  let episode: { id: string; season_number: number; episode_number: number } | null = null;
  let season: number | undefined;
  let episodeNumber: number | undefined;
  if (role === "episode") {
    season = positiveInteger(form.get("seasonNumber") ?? "1", "seasonNumber");
    episodeNumber = positiveInteger(form.get("episodeNumber"), "episodeNumber");
    const { data, error } = await db.from("episodes")
      .select("id, season_number, episode_number")
      .eq("story_id", story.id)
      .eq("season_number", season)
      .eq("episode_number", episodeNumber)
      .single();
    if (error || !data) throw new Error(`Season ${season}, Episode ${episodeNumber} was not found for '${slug}'.`);
    episode = data;
  }

  const extension = fileExtension(file.type);
  const storagePath = canonicalPath({ slug, role, stage, season, episode: episodeNumber, version, extension });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await db.storage.from(BUCKET).upload(storagePath, bytes, {
    contentType: file.type,
    cacheControl: stage === "production" ? "31536000" : "3600",
    upsert: stage === "production",
  });
  if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

  const publicUrl = db.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
  const now = new Date().toISOString();
  const lifecycleStatus = stage === "production" ? "approved" : stage;
  const assetType = stage === "concept"
    ? "concept_image"
    : stage === "refined"
    ? "refined_image"
    : role === "cover"
    ? "cover_image"
    : role === "banner"
    ? "story_banner"
    : "episode_image";

  const { error: assetError } = await db.from("media_assets").upsert({
    story_id: story.id,
    episode_id: episode?.id ?? null,
    asset_type: assetType,
    storage_provider: "supabase",
    storage_path: storagePath,
    public_url: publicUrl,
    mime_type: file.type,
    file_size_bytes: file.size,
    lifecycle_status: lifecycleStatus,
    version_number: version,
    is_approved: stage === "production",
    generation_notes: generationNotes
      ? `${generationNotes}\nUploaded by admin ${actorUserId}. Role: ${role}.`
      : `Uploaded by admin ${actorUserId}. Role: ${role}.`,
    updated_at: now,
  }, { onConflict: "storage_path" });
  if (assetError) {
    await db.storage.from(BUCKET).remove([storagePath]);
    throw new Error(`Asset registration failed: ${assetError.message}`);
  }

  if (role === "cover") {
    const { error } = await db.from("stories").update({
      cover_image_path: storagePath,
      cover_image_url: publicUrl,
      updated_at: now,
    }).eq("id", story.id);
    if (error) throw error;
  } else if (role === "banner") {
    const { error } = await db.from("stories").update({ banner_image_path: storagePath, updated_at: now }).eq("id", story.id);
    if (error) throw error;
  } else {
    const { error } = await db.from("episodes").update({
      artwork_path: storagePath,
      artwork_url: publicUrl,
      updated_at: now,
    }).eq("id", episode!.id);
    if (error) throw error;
  }

  const { data: objectRows, error: objectError } = await db.storage.from(BUCKET).list(
    storagePath.substring(0, storagePath.lastIndexOf("/")),
    { search: storagePath.substring(storagePath.lastIndexOf("/") + 1), limit: 10 },
  );
  if (objectError || !objectRows?.some((row) => storagePath.endsWith(`/${row.name}`))) {
    throw new Error("Upload completed but Storage verification failed.");
  }

  return {
    uploaded: true,
    storySlug: slug,
    storyStatus: workflowStatus,
    assetRole: role,
    productionStage: stage,
    seasonNumber: season ?? null,
    episodeNumber: episodeNumber ?? null,
    storagePath,
    publicUrl,
    mediaAsset: { assetType, lifecycleStatus, isApproved: stage === "production", versionNumber: version },
  };
}

async function verifyBatch(payload: Record<string, unknown>) {
  const slug = cleanSlug(String(payload.storySlug ?? ""));
  const season = Number(payload.seasonNumber ?? 1);
  const startEpisode = Number(payload.startEpisode ?? 1);
  const endEpisode = Number(payload.endEpisode ?? 10);
  if (![season, startEpisode, endEpisode].every(Number.isInteger) || season < 1 || startEpisode < 1 || endEpisode < startEpisode) {
    throw new Error("Invalid verification episode range.");
  }

  const story = await resolveStory(slug);
  const { data: episodes, error: episodeError } = await db.from("episodes")
    .select("id, season_number, episode_number, title, artwork_path, artwork_url, episode_status")
    .eq("story_id", story.id)
    .eq("season_number", season)
    .gte("episode_number", startEpisode)
    .lte("episode_number", endEpisode)
    .order("episode_number");
  if (episodeError) throw episodeError;

  const expectedEpisodes = endEpisode - startEpisode + 1;
  const paths = [story.cover_image_path, story.banner_image_path, ...(episodes ?? []).map((e) => e.artwork_path)].filter(Boolean) as string[];
  const { data: assets, error: assetError } = await db.from("media_assets")
    .select("storage_path, asset_type, lifecycle_status, is_approved, story_id, episode_id")
    .eq("story_id", story.id)
    .in("storage_path", paths.length ? paths : ["__none__"]);
  if (assetError) throw assetError;

  const assetByPath = new Map((assets ?? []).map((a) => [a.storage_path, a]));
  const checks = [];
  for (const path of paths) {
    const folder = path.substring(0, path.lastIndexOf("/"));
    const filename = path.substring(path.lastIndexOf("/") + 1);
    const { data: rows } = await db.storage.from(BUCKET).list(folder, { search: filename, limit: 10 });
    checks.push({
      storagePath: path,
      existsInStorage: rows?.some((row) => row.name === filename) ?? false,
      registeredInMediaAssets: assetByPath.has(path),
      publicUrl: db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl,
    });
  }

  const missingEpisodeNumbers = [];
  for (let n = startEpisode; n <= endEpisode; n++) {
    if (!(episodes ?? []).some((e) => e.episode_number === n)) missingEpisodeNumbers.push(n);
  }
  const complete = Boolean(story.cover_image_path)
    && Boolean(story.banner_image_path)
    && (episodes?.length ?? 0) === expectedEpisodes
    && (episodes ?? []).every((e) => Boolean(e.artwork_path))
    && checks.every((c) => c.existsInStorage && c.registeredInMediaAssets);

  return {
    status: complete ? "complete" : "incomplete",
    story: {
      slug,
      status: story.content_status,
      coverImagePath: story.cover_image_path,
      bannerImagePath: story.banner_image_path,
    },
    episodeRange: { seasonNumber: season, startEpisode, endEpisode, expectedEpisodes },
    foundEpisodes: episodes?.length ?? 0,
    missingEpisodeNumbers,
    expectedAssets: expectedEpisodes + 2,
    linkedPaths: paths.length,
    verifiedAssets: checks.filter((c) => c.existsInStorage && c.registeredInMediaAssets).length,
    checks,
  };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return json({ ok: true });
  if (request.method !== "POST") return json({ error: "POST is required." }, 405);

  try {
    const actorUserId = await requireAdmin(request);
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const action = String(form.get("action") ?? "upload");
      if (action !== "upload") throw new Error("Multipart requests support only action=upload.");
      return json(await uploadAsset(form, actorUserId), 201);
    }

    const payload = await request.json() as Record<string, unknown>;
    const action = String(payload.action ?? "");
    if (action === "set-status") {
      return json(await setStoryWorkflowStatus(cleanSlug(String(payload.storySlug ?? "")), String(payload.status ?? "review")));
    }
    if (action === "verify") return json(await verifyBatch(payload));
    throw new Error("action must be set-status, upload or verify.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    const status = /Authentication|bearer token/.test(message) ? 401 : /Administrator/.test(message) ? 403 : 400;
    return json({ error: message }, status);
  }
});
