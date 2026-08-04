import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const PRIVATE_BUCKET = "stories";
const PUBLIC_BUCKET = "story-images";
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const MAX_BATCH_ITEMS = 50;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const OPERATIONS = new Set([
  "storage_list",
  "storage_inspect",
  "storage_upload",
  "storage_copy",
  "storage_publish_batch",
]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Visibility = "private" | "public";
type FileReference = {
  name?: string;
  id?: string;
  mime_type?: string;
  download_link?: string;
};
type PublishEntry = { sourcePath?: string; destinationPath?: string };
type RequestBody = {
  storySlug?: string;
  visibility?: Visibility;
  prefix?: string;
  path?: string;
  sourceVisibility?: Visibility;
  sourcePath?: string;
  destinationVisibility?: Visibility;
  destinationPath?: string;
  openaiFileIdRefs?: Array<FileReference | string>;
  entries?: PublishEntry[];
  dryRun?: boolean;
};

class ClientError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function requireText(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ClientError(`${label} is required`);
  }
  return value.trim();
}

function cleanSlug(value: unknown): string {
  const slug = requireText(value, "storySlug").toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new ClientError("storySlug must contain lowercase letters, numbers and hyphens only");
  }
  return slug;
}

function cleanRelativePath(value: unknown, label: string, allowEmpty = false): string {
  if (allowEmpty && (value === undefined || value === null || value === "")) return "";
  const path = requireText(value, label).replace(/^\/+|\/+$/g, "");
  if (
    path.includes("..") || path.includes("\\") || path.includes("//") ||
    /[\u0000-\u001f]/.test(path)
  ) throw new ClientError(`Invalid ${label}`);
  if (!/^[a-z0-9][a-z0-9._/-]*$/.test(path)) {
    throw new ClientError(`${label} must use lowercase letters, numbers, dots, hyphens, underscores and slashes only`);
  }
  return path;
}

function visibility(value: unknown, fallback: Visibility): Visibility {
  const result = value ?? fallback;
  if (result !== "private" && result !== "public") throw new ClientError("visibility must be private or public");
  return result;
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function operationFromRequest(req: Request): string {
  const action = new URL(req.url).pathname.split("/").filter(Boolean).at(-1)?.replaceAll("-", "_") ?? "";
  if (!OPERATIONS.has(action)) throw new ClientError("Unsupported action", 404);
  return action;
}

function bucketFor(value: Visibility) {
  return value === "private" ? PRIVATE_BUCKET : PUBLIC_BUCKET;
}

function storagePath(value: Visibility, storyId: string, slug: string, relativePath: string) {
  const root = value === "private" ? storyId : slug;
  return relativePath ? `${root}/${relativePath}` : root;
}

function relativeFromStorage(value: Visibility, storyId: string, slug: string, path: string) {
  const root = value === "private" ? storyId : slug;
  return path === root ? "" : path.slice(root.length + 1);
}

async function listAll(storage: any, prefix: string) {
  const files: Array<Record<string, unknown>> = [];
  const folders = [prefix.replace(/\/+$/, "")];
  while (folders.length) {
    const current = folders.shift()!;
    let offset = 0;
    while (true) {
      const { data, error } = await storage.list(current, {
        limit: 1000,
        offset,
        sortBy: { column: "name", order: "asc" },
      });
      if (error) throw new ClientError(error.message, 502);
      if (!data?.length) break;
      for (const item of data) {
        const itemPath = current ? `${current}/${item.name}` : item.name;
        if (!item.id) folders.push(itemPath);
        else files.push({ ...item, storagePath: itemPath });
      }
      if (data.length < 1000) break;
      offset += data.length;
    }
  }
  return files;
}

async function inspectObject(storage: any, path: string) {
  const slash = path.lastIndexOf("/");
  const parent = slash < 0 ? "" : path.slice(0, slash);
  const name = slash < 0 ? path : path.slice(slash + 1);
  const { data, error } = await storage.list(parent, { search: name, limit: 100 });
  if (error) throw new ClientError(error.message, 502);
  const match = data?.find((item: any) => item.id && item.name === name);
  return match ? { ...match, storagePath: path } : null;
}

async function copyObject(admin: any, sourceBucket: string, sourcePath: string, destinationBucket: string, destinationPath: string) {
  if (await inspectObject(admin.storage.from(destinationBucket), destinationPath)) {
    throw new ClientError(`Destination already exists: ${destinationPath}`, 409);
  }
  if (sourceBucket === destinationBucket) {
    const { error } = await admin.storage.from(sourceBucket).copy(sourcePath, destinationPath);
    if (error) throw new ClientError(error.message, 502);
    return;
  }
  const { data, error: downloadError } = await admin.storage.from(sourceBucket).download(sourcePath);
  if (downloadError || !data) throw new ClientError(downloadError?.message ?? "Source file could not be downloaded", 502);
  const { error: uploadError } = await admin.storage.from(destinationBucket).upload(destinationPath, data, {
    contentType: data.type || "application/octet-stream",
    upsert: false,
  });
  if (uploadError) throw new ClientError(uploadError.message, 502);
}

async function authenticate(admin: any, req: Request, operation: string) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) throw new ClientError("Authentication required", 401);
  const presented = auth.slice(7).trim();
  if (!presented) throw new ClientError("Authentication required", 401);
  const hash = await sha256(presented);
  const { data, error } = await admin.from("storage_action_keys")
    .select("id,allowed_operations,expires_at")
    .eq("key_hash", hash)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data || (data.expires_at && new Date(data.expires_at) <= new Date())) {
    throw new ClientError("Invalid or expired Action key", 401);
  }
  if (!Array.isArray(data.allowed_operations) || !data.allowed_operations.includes(operation)) {
    throw new ClientError("Action key is not permitted to perform this operation", 403);
  }
  await admin.from("storage_action_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);
  return data.id as string;
}

async function getStory(admin: any, slug: string) {
  const { data, error } = await admin.from("stories").select("id,slug,title").eq("slug", slug).maybeSingle();
  if (error || !data) throw new ClientError("Story could not be resolved", 404);
  return data as { id: string; slug: string; title: string };
}

async function getOpenAIFile(body: RequestBody) {
  if (!Array.isArray(body.openaiFileIdRefs) || body.openaiFileIdRefs.length !== 1) {
    throw new ClientError("storage_upload requires exactly one conversation file");
  }
  const ref = body.openaiFileIdRefs[0];
  if (typeof ref !== "object" || !ref) throw new ClientError("The conversation file reference is invalid");
  const downloadLink = requireText(ref.download_link, "openaiFileIdRefs[0].download_link");
  const url = new URL(downloadLink);
  if (!url.hostname.endsWith("oaiusercontent.com")) throw new ClientError("The file download host is not permitted", 403);
  const response = await fetch(downloadLink);
  if (!response.ok) throw new ClientError(`Conversation file download failed with ${response.status}`, 502);
  const contentType = (ref.mime_type || response.headers.get("content-type") || "").split(";")[0].toLowerCase();
  if (!IMAGE_TYPES.has(contentType)) throw new ClientError("Only JPG, PNG and WEBP images are permitted");
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!bytes.length || bytes.length > MAX_UPLOAD_BYTES) throw new ClientError("Image must be between 1 byte and 12 MB");
  return { bytes, contentType, originalName: ref.name ?? null, fileId: ref.id ?? null };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const requestId = crypto.randomUUID();
  try {
    if (req.method !== "POST") throw new ClientError("Only POST is supported", 405);
    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) throw new Error("Supabase function secrets are unavailable");
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const operation = operationFromRequest(req);
    const actionKeyId = await authenticate(admin, req, operation);
    const body = (await req.json()) as RequestBody;
    const slug = cleanSlug(body.storySlug);
    const story = await getStory(admin, slug);

    if (operation === "storage_list") {
      const access = visibility(body.visibility, "private");
      const relativePrefix = cleanRelativePath(body.prefix, "prefix", true);
      const root = storagePath(access, story.id, slug, relativePrefix);
      const files = await listAll(admin.storage.from(bucketFor(access)), root);
      return json({
        requestId, operation, story: { id: story.id, slug, title: story.title }, visibility: access,
        prefix: relativePrefix,
        files: files.map((item) => ({ ...item, relativePath: relativeFromStorage(access, story.id, slug, String(item.storagePath)) })),
      });
    }

    if (operation === "storage_inspect") {
      const access = visibility(body.visibility, "private");
      const relativePath = cleanRelativePath(body.path, "path");
      const fullPath = storagePath(access, story.id, slug, relativePath);
      const metadata = await inspectObject(admin.storage.from(bucketFor(access)), fullPath);
      return json({ requestId, operation, storySlug: slug, visibility: access, relativePath, exists: Boolean(metadata), metadata });
    }

    if (operation === "storage_upload") {
      const relativePath = cleanRelativePath(body.path, "path");
      if (!/\.(jpe?g|png|webp)$/.test(relativePath)) throw new ClientError("Upload path must end in .jpg, .jpeg, .png or .webp");
      const file = await getOpenAIFile(body);
      const fullPath = storagePath("private", story.id, slug, relativePath);
      const { error } = await admin.storage.from(PRIVATE_BUCKET).upload(fullPath, file.bytes, {
        contentType: file.contentType,
        upsert: false,
        cacheControl: "31536000",
      });
      if (error) throw new ClientError(error.message, error.message.toLowerCase().includes("exists") ? 409 : 502);
      console.info(JSON.stringify({ requestId, actionKeyId, operation, storySlug: slug, bucket: PRIVATE_BUCKET, path: fullPath, fileId: file.fileId }));
      return json({ requestId, operation, result: "uploaded", storySlug: slug, visibility: "private", relativePath, storagePath: fullPath, contentType: file.contentType, bytes: file.bytes.length });
    }

    if (operation === "storage_copy") {
      const sourceAccess = visibility(body.sourceVisibility, "private");
      const destinationAccess = visibility(body.destinationVisibility, "private");
      const sourceRelative = cleanRelativePath(body.sourcePath, "sourcePath");
      const destinationRelative = cleanRelativePath(body.destinationPath, "destinationPath");
      const sourceFull = storagePath(sourceAccess, story.id, slug, sourceRelative);
      const destinationFull = storagePath(destinationAccess, story.id, slug, destinationRelative);
      if (!await inspectObject(admin.storage.from(bucketFor(sourceAccess)), sourceFull)) throw new ClientError("Source file does not exist", 404);
      await copyObject(admin, bucketFor(sourceAccess), sourceFull, bucketFor(destinationAccess), destinationFull);
      console.info(JSON.stringify({ requestId, actionKeyId, operation, storySlug: slug, sourceFull, destinationFull }));
      return json({ requestId, operation, result: "copied", storySlug: slug, sourceVisibility: sourceAccess, sourcePath: sourceRelative, destinationVisibility: destinationAccess, destinationPath: destinationRelative });
    }

    if (!Array.isArray(body.entries) || !body.entries.length || body.entries.length > MAX_BATCH_ITEMS) {
      throw new ClientError(`entries must contain between 1 and ${MAX_BATCH_ITEMS} items`);
    }
    const entries = body.entries.map((entry, index) => ({
      sourcePath: cleanRelativePath(entry.sourcePath, `entries[${index}].sourcePath`),
      destinationPath: cleanRelativePath(entry.destinationPath, `entries[${index}].destinationPath`),
    }));
    const duplicateDestinations = entries.filter((entry, index) => entries.findIndex((candidate) => candidate.destinationPath === entry.destinationPath) !== index);
    if (duplicateDestinations.length) throw new ClientError("Batch contains duplicate destination paths");
    const manifest = [];
    for (const entry of entries) {
      const sourceFull = storagePath("private", story.id, slug, entry.sourcePath);
      const destinationFull = storagePath("public", story.id, slug, entry.destinationPath);
      const source = await inspectObject(admin.storage.from(PRIVATE_BUCKET), sourceFull);
      const destination = await inspectObject(admin.storage.from(PUBLIC_BUCKET), destinationFull);
      manifest.push({ ...entry, sourceExists: Boolean(source), destinationExists: Boolean(destination) });
    }
    const blocked = manifest.filter((entry) => !entry.sourceExists || entry.destinationExists);
    const dryRun = body.dryRun !== false;
    if (dryRun || blocked.length) {
      return json({ requestId, operation, dryRun: true, ready: blocked.length === 0, itemCount: manifest.length, blockedCount: blocked.length, manifest });
    }
    const completed: string[] = [];
    try {
      for (const entry of entries) {
        const sourceFull = storagePath("private", story.id, slug, entry.sourcePath);
        const destinationFull = storagePath("public", story.id, slug, entry.destinationPath);
        await copyObject(admin, PRIVATE_BUCKET, sourceFull, PUBLIC_BUCKET, destinationFull);
        completed.push(destinationFull);
      }
    } catch (error) {
      if (completed.length) await admin.storage.from(PUBLIC_BUCKET).remove(completed);
      throw error;
    }
    console.info(JSON.stringify({ requestId, actionKeyId, operation, storySlug: slug, affectedFileCount: completed.length }));
    return json({ requestId, operation, dryRun: false, result: "published", affectedFileCount: completed.length, publicPaths: entries.map((entry) => `${slug}/${entry.destinationPath}`) });
  } catch (error) {
    const status = error instanceof ClientError ? error.status : 500;
    console.error(JSON.stringify({ requestId, error: error instanceof Error ? error.message : String(error) }));
    return json({ requestId, error: error instanceof Error ? error.message : "Unexpected error" }, status);
  }
});
