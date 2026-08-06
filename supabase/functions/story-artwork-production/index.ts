import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.55.0";

const url = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const bucket = Deno.env.get("SUPABASE_STORAGE_BUCKET") ?? "story-images";
const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
const allowedStatuses = new Set(["draft", "review"]);
const allowedStages = new Set(["concept", "refined", "production"]);
const allowedRoles = new Set(["cover", "banner", "episode", "reader", "canon"]);
const allowedMimes = new Set(["image/jpeg", "image/png", "image/webp"]);

function respond(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}
function secureEqual(a: string, b: string) {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  if (x.length !== y.length) return false;
  let n = 0;
  for (let i = 0; i < x.length; i++) n |= x[i] ^ y[i];
  return n === 0;
}
function requireOperator(req: Request) {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ") || !secureEqual(header.slice(7).trim(), serviceKey)) {
    throw new Error("Supabase operator access is required.");
  }
}
function cleanSlug(value: unknown) {
  const result = String(value ?? "").trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result)) throw new Error("Invalid storySlug.");
  return result;
}
function positive(value: unknown, field: string) {
  const result = Number(value);
  if (!Number.isInteger(result) || result < 1) throw new Error(`${field} must be a positive integer.`);
  return result;
}
function nonNegative(value: unknown, field: string) {
  const result = Number(value);
  if (!Number.isInteger(result) || result < 0) throw new Error(`${field} must be a non-negative integer.`);
  return result;
}
function booleanField(value: unknown) {
  return String(value ?? "false").trim().toLowerCase() === "true";
}
function detectedMime(bytes: Uint8Array) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP") return "image/webp";
  return "application/octet-stream";
}
function ext(mime: string) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  throw new Error("Unsupported image type.");
}
function productionFilename(extension: string) {
  return `${crypto.randomUUID()}.${extension}`;
}
function canonicalPath(args: { slug: string; role: string; stage: string; version: number; season?: number; episode?: number; extension: string }) {
  if (args.stage === "production") {
    if (args.role === "cover" || args.role === "banner") return `${args.slug}/story/${productionFilename(args.extension)}`;
    const episodeName = `${args.slug}-s${String(args.season).padStart(2, "0")}e${String(args.episode).padStart(2, "0")}`;
    if (args.role === "reader") return `${args.slug}/episodes/${episodeName}/reader/${productionFilename(args.extension)}`;
    return `${args.slug}/episodes/${episodeName}/${productionFilename(args.extension)}`;
  }
  const suffix = `-${args.stage}-${String(args.version).padStart(2, "0")}`;
  if (args.role === "cover") return `${args.slug}/${args.slug}-cover${suffix}.${args.extension}`;
  if (args.role === "banner") return `${args.slug}/${args.slug}-banner${suffix}.${args.extension}`;
  if (args.role === "canon") throw new Error("Canon paths require a Canon object slug.");
  const episodeName = `${args.slug}-s${String(args.season).padStart(2, "0")}e${String(args.episode).padStart(2, "0")}`;
  const filename = `${episodeName}${suffix}.${args.extension}`;
  if (args.role === "reader") return `${args.slug}/episodes/${episodeName}/reader/${filename}`;
  return `${args.slug}/episodes/${filename}`;
}
function cleanObjectSlug(value: unknown) {
  const result = String(value ?? "").trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result)) throw new Error("Invalid canonObjectSlug.");
  return result;
}
async function storyBySlug(slug: string) {
  const result = await db.from("stories").select("id,slug,content_status,cover_image_path,banner_image_path").eq("slug", slug).single();
  if (result.error || !result.data) throw new Error(`Story '${slug}' was not found.`);
  return result.data;
}
async function setWorkflowStatus(slug: string, status: string) {
  if (!allowedStatuses.has(status)) throw new Error("Status must be draft or review.");
  const story = await storyBySlug(slug);
  const now = new Date().toISOString();
  const s = await db.from("stories").update({ content_status: status, updated_at: now }).eq("id", story.id);
  if (s.error) throw s.error;
  const e = await db.from("episodes").update({ episode_status: status, updated_at: now }).eq("story_id", story.id).neq("episode_status", "archived");
  if (e.error) throw e.error;
  return { storyId: story.id, storySlug: slug, status };
}
async function registerAsset(values: Record<string, unknown>, storagePath: string) {
  const existing = await db.from("media_assets").select("id").eq("storage_path", storagePath).maybeSingle();
  if (existing.error) throw new Error(`Asset lookup failed: ${existing.error.message}`);
  if (existing.data?.id) {
    const updated = await db.from("media_assets").update(values).eq("id", existing.data.id);
    if (updated.error) throw new Error(`Asset update failed: ${updated.error.message}`);
    return existing.data.id;
  }
  const inserted = await db.from("media_assets").insert(values).select("id").single();
  if (inserted.error) throw new Error(`Asset registration failed: ${inserted.error.message}`);
  return inserted.data.id;
}
async function uploadAsset(form: FormData) {
  const slug = cleanSlug(form.get("storySlug"));
  const role = String(form.get("assetRole") ?? "");
  const stage = String(form.get("stage") ?? "concept");
  const workflowStatus = String(form.get("workflowStatus") ?? "review");
  const version = positive(form.get("versionNumber") ?? 1, "versionNumber");
  const notes = String(form.get("generationNotes") ?? "").trim();
  const file = form.get("file");
  if (!allowedRoles.has(role)) throw new Error("assetRole must be cover, banner, episode, reader or canon.");
  if (!allowedStages.has(stage)) throw new Error("stage must be concept, refined or production.");
  if (!allowedStatuses.has(workflowStatus)) throw new Error("workflowStatus must be draft or review.");
  if (!(file instanceof File)) throw new Error("A file upload is required.");
  if (!allowedMimes.has(file.type)) throw new Error("Only JPEG, PNG and WebP images are accepted.");
  if (file.size < 1 || file.size > 12 * 1024 * 1024) throw new Error("Image must be between 1 byte and 12 MB.");

  let story = role === "canon" ? null : await storyBySlug(slug);
  const canonObjectSlug = role === "canon" ? cleanObjectSlug(form.get("canonObjectSlug")) : null;
  const canonProjectSlug = role === "canon" ? cleanSlug(form.get("canonProjectSlug") ?? slug) : null;
  const canonAssetTitle = role === "canon" ? String(form.get("canonAssetTitle") ?? "").trim() : "";
  const canonAssetRole = role === "canon" ? String(form.get("canonAssetRole") ?? "reference").trim() || "reference" : "";
  const canonAssetDescription = role === "canon" ? String(form.get("canonAssetDescription") ?? "").trim() : "";
  const canonSortOrder = role === "canon" ? nonNegative(form.get("canonSortOrder") ?? 0, "canonSortOrder") : 0;
  const canonIsPrimary = role === "canon" ? booleanField(form.get("canonIsPrimaryReference")) : false;
  if (role === "canon" && !canonAssetTitle) throw new Error("canonAssetTitle is required for Canon images.");
  if (role === "canon" && !/^[a-z0-9_-]{1,50}$/i.test(canonAssetRole)) throw new Error("canonAssetRole contains invalid characters.");
  let canonProject: { id: string; linked_story_id: string | null } | null = null;
  let canonRule: { id: string } | null = null;
  if (role === "canon") {
    const project = await db.from("private_canon_projects").select("id,linked_story_id").eq("slug", canonProjectSlug).single();
    if (project.error || !project.data) throw new Error(`Private Canon workspace '${canonProjectSlug}' was not found.`);
    if (!project.data.linked_story_id) throw new Error("The Canon workspace must be linked to a story before media can be registered.");
    canonProject = project.data;
    story = await storyBySlug(slug);
    if (story.id !== canonProject.linked_story_id) throw new Error("storySlug does not match the Canon workspace linked story.");
    const rule = await db.from("story_canon_rules").select("id").eq("canon_project_id", canonProject.id).eq("canon_key", canonObjectSlug).single();
    if (rule.error || !rule.data) throw new Error(`Canon object '${canonObjectSlug}' was not found.`);
    canonRule = rule.data;
  }
  let episode: { id: string } | null = null;
  let seasonNumber: number | undefined;
  let episodeNumber: number | undefined;
  if (role === "episode") {
    seasonNumber = positive(form.get("seasonNumber") ?? 1, "seasonNumber");
    episodeNumber = positive(form.get("episodeNumber"), "episodeNumber");
    const found = await db.from("episodes").select("id").eq("story_id", story.id).eq("season_number", seasonNumber).eq("episode_number", episodeNumber).single();
    if (found.error || !found.data) throw new Error(`Season ${seasonNumber}, Episode ${episodeNumber} was not found.`);
    episode = found.data;
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const actualMime = detectedMime(bytes);
  if (actualMime !== file.type) throw new Error(`Image content does not match declared MIME type (${file.type}).`);
  if (stage !== "production" && actualMime !== "image/jpeg") throw new Error("Draft and review artwork must be genuine JPEG data.");

  const sourceHash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");

  if (role === "canon") {
    const link = await db.from("private_canon_assets")
      .select("media_asset_id")
      .eq("canon_rule_id", canonRule!.id)
      .eq("asset_role", canonAssetRole)
      .eq("title", canonAssetTitle)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (link.error) throw new Error(`Canon idempotency lookup failed: ${link.error.message}`);
    if (link.data?.media_asset_id) {
      const asset = await db.from("media_assets")
        .select("id,storage_path,public_url,source_hash,lifecycle_status,asset_type,version_number")
        .eq("id", link.data.media_asset_id)
        .maybeSingle();
      if (asset.error) throw new Error(`Canon media lookup failed: ${asset.error.message}`);
      if (asset.data) {
        if (asset.data.source_hash && asset.data.source_hash !== sourceHash) {
          throw new Error("A Canon image with this title and role already exists with different image bytes. Use a new title or an explicit replacement workflow.");
        }
        if (!asset.data.source_hash) {
          const hashed = await db.from("media_assets").update({ source_hash: sourceHash }).eq("id", asset.data.id);
          if (hashed.error) throw new Error(`Canon source hash update failed: ${hashed.error.message}`);
        }
        return {
          uploaded: true,
          reused: true,
          assetId: asset.data.id,
          storySlug: slug,
          storyStatus: null,
          assetRole: role,
          productionStage: stage,
          seasonNumber: null,
          episodeNumber: null,
          storagePath: asset.data.storage_path,
          publicUrl: asset.data.public_url,
          canon: {
            projectSlug: canonProjectSlug,
            objectSlug: canonObjectSlug,
            title: canonAssetTitle,
            role: canonAssetRole,
            sortOrder: canonSortOrder,
            isPrimaryReference: canonIsPrimary,
          },
          mediaAsset: {
            assetType: asset.data.asset_type,
            lifecycleStatus: asset.data.lifecycle_status,
            isApproved: asset.data.lifecycle_status === "approved",
            versionNumber: asset.data.version_number,
          },
        };
      }
    }
  }

  const storagePath = role === "canon"
    ? `${canonProjectSlug}/canon/${canonObjectSlug}/${stage}/${productionFilename(ext(actualMime))}`
    : canonicalPath({ slug, role, stage, version, season: seasonNumber, episode: episodeNumber, extension: ext(actualMime) });
  const stored = await db.storage.from(bucket).upload(storagePath, bytes, {
    contentType: actualMime,
    cacheControl: stage === "production" ? "31536000" : "3600",
    upsert: role !== "canon",
  });
  if (stored.error) throw new Error(`Storage upload failed: ${stored.error.message}`);

  const publicUrl = db.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
  const lifecycleStatus = stage === "production" ? "approved" : stage;
  const assetType = role === "canon" ? "canon_reference" : role === "reader" ? "reader_image" : stage === "concept" ? "concept_image" : stage === "refined" ? "refined_image" : role === "cover" ? "cover_image" : role === "banner" ? "story_banner" : "episode_image";
  const now = new Date().toISOString();
  let registeredAssetId: string | null = null;
  try {
    const assetId = await registerAsset({
      story_id: episode ? null : story?.id ?? null,
      episode_id: episode?.id ?? null,
      asset_type: assetType,
      title: role === "canon" ? canonAssetTitle : null,
      storage_provider: "supabase",
      storage_path: storagePath,
      public_url: publicUrl,
      mime_type: actualMime,
      file_size_bytes: bytes.byteLength,
      lifecycle_status: lifecycleStatus,
      version_number: version,
      is_approved: stage === "production",
      generation_notes: notes || `Uploaded through the ChatGPT artwork bridge. Role: ${role}.`,
      source_hash: sourceHash,
      updated_at: now,
    }, storagePath);
    registeredAssetId = assetId;

    if (role === "canon") {
      const linked = await db.from("private_canon_assets").insert({
        canon_project_id: canonProject!.id,
        canon_rule_id: canonRule!.id,
        media_asset_id: assetId,
        asset_role: canonAssetRole,
        title: canonAssetTitle,
        description: canonAssetDescription || null,
        review_status: stage === "production" ? "approved" : stage === "refined" ? "review" : "draft",
        is_primary_reference: canonIsPrimary,
        sort_order: canonSortOrder,
        consistency_notes: String(form.get("consistencyNotes") ?? "").trim() || null,
        refinement_direction: String(form.get("refinementDirection") ?? "").trim() || null,
        updated_at: now,
      });
      if (linked.error) throw new Error(`Canon asset registration failed: ${linked.error.message}`);
    }

    if (role === "canon") {
      // Canon assets are linked through private_canon_assets; they must not
      // alter story or episode artwork columns.
    } else if (role === "cover") {
      const result = await db.from("stories").update({ cover_image_path: storagePath, cover_image_url: publicUrl, updated_at: now }).eq("id", story.id);
      if (result.error) throw result.error;
    } else if (role === "banner") {
      const result = await db.from("stories").update({ banner_image_path: storagePath, updated_at: now }).eq("id", story.id);
      if (result.error) throw result.error;
    } else if (role === "reader") {
      // Reader media is registered in media_assets and referenced by Reader JSON.
      // It must never replace the episode's primary artwork fields.
    } else {
      const result = await db.from("episodes").update({ artwork_path: storagePath, artwork_url: publicUrl, updated_at: now }).eq("id", episode!.id);
      if (result.error) throw result.error;
    }

    const folder = storagePath.slice(0, storagePath.lastIndexOf("/"));
    const filename = storagePath.slice(storagePath.lastIndexOf("/") + 1);
    const verified = await db.storage.from(bucket).list(folder, { search: filename, limit: 10 });
    if (verified.error || !verified.data?.some((row) => row.name === filename)) throw new Error("Storage verification failed.");

    if (story && role !== "canon") await setWorkflowStatus(slug, workflowStatus);
    return {
      uploaded: true,
      assetId,
      storySlug: slug,
      storyStatus: role === "canon" ? null : workflowStatus,
      assetRole: role,
      productionStage: stage,
      seasonNumber: seasonNumber ?? null,
      episodeNumber: episodeNumber ?? null,
      storagePath,
      publicUrl,
      canon: role === "canon" ? {
        projectSlug: canonProjectSlug,
        objectSlug: canonObjectSlug,
        title: canonAssetTitle,
        role: canonAssetRole,
        sortOrder: canonSortOrder,
        isPrimaryReference: canonIsPrimary,
      } : null,
      mediaAsset: { assetType, lifecycleStatus, isApproved: stage === "production", versionNumber: version },
    };
  } catch (error) {
    if (role === "canon" && registeredAssetId) {
      await db.from("media_assets").delete().eq("id", registeredAssetId);
    }
    await db.storage.from(bucket).remove([storagePath]);
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return respond({ error: "POST is required." }, 405);
  try {
    requireOperator(req);
    const type = req.headers.get("content-type") ?? "";
    if (type.includes("multipart/form-data")) return respond(await uploadAsset(await req.formData()), 201);
    const body = await req.json();
    if (body.action === "set-status") return respond(await setWorkflowStatus(cleanSlug(body.storySlug), String(body.status ?? "review")));
    throw new Error("Unsupported action.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    return respond({ error: message }, /operator access/.test(message) ? 403 : 400);
  }
});
