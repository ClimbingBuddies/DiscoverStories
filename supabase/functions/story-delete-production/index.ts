import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.55.0";

const url = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const bucket = Deno.env.get("SUPABASE_STORAGE_BUCKET") ?? "story-images";
const db = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function respond(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function secureEqual(a: string, b: string) {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  if (x.length !== y.length) return false;
  let difference = 0;
  for (let i = 0; i < x.length; i++) difference |= x[i] ^ y[i];
  return difference === 0;
}

function requireOperator(request: Request) {
  const header = request.headers.get("authorization");
  if (
    !header?.startsWith("Bearer ") ||
    !secureEqual(header.slice(7).trim(), serviceKey)
  ) {
    throw new Error("Supabase operator access is required.");
  }
}

function cleanSlug(value: unknown) {
  const slug = String(value ?? "").trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("A valid exact storySlug is required.");
  }
  return slug;
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function count(
  table: string,
  column: string,
  value: string | string[],
) {
  let query = db.from(table).select("*", { count: "exact", head: true });
  query = Array.isArray(value)
    ? query.in(column, value.length ? value : ["00000000-0000-0000-0000-000000000000"])
    : query.eq(column, value);
  const result = await query;
  if (result.error) {
    throw new Error(`Could not count ${table}: ${result.error.message}`);
  }
  return result.count ?? 0;
}

async function listFolder(prefix: string): Promise<string[]> {
  const paths: string[] = [];
  let offset = 0;
  while (true) {
    const result = await db.storage.from(bucket).list(prefix, {
      limit: 100,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (result.error) {
      throw new Error(`Storage listing failed: ${result.error.message}`);
    }
    const rows = result.data ?? [];
    for (const row of rows) {
      const path = `${prefix}/${row.name}`;
      if (row.id === null) paths.push(...await listFolder(path));
      else paths.push(path);
    }
    if (rows.length < 100) break;
    offset += rows.length;
  }
  return paths.sort();
}

async function manifest(slug: string) {
  const storyResult = await db
    .from("stories")
    .select("id,slug,title,content_status,cover_image_path,banner_image_path")
    .eq("slug", slug)
    .single();
  if (storyResult.error || !storyResult.data) {
    throw new Error(`Story '${slug}' was not found.`);
  }
  const story = storyResult.data;
  if (!["draft", "review"].includes(story.content_status)) {
    throw new Error(
      `Only draft or review stories can be deleted. '${slug}' is '${story.content_status}'.`,
    );
  }

  const episodeResult = await db
    .from("episodes")
    .select("id")
    .eq("story_id", story.id);
  if (episodeResult.error) throw episodeResult.error;
  const episodeIds = (episodeResult.data ?? []).map((row) => row.id);
  const storagePaths = await listFolder(slug);

  const mediaResult = await db
    .from("media_assets")
    .select("id,story_id,episode_id,storage_path")
    .or(
      `story_id.eq.${story.id}${
        episodeIds.length ? `,episode_id.in.(${episodeIds.join(",")})` : ""
      }`,
    );
  if (mediaResult.error) throw mediaResult.error;

  const pathReferenceResult = storagePaths.length
    ? await db
      .from("media_assets")
      .select("id,story_id,episode_id,storage_path")
      .in("storage_path", storagePaths)
    : { data: [], error: null };
  if (pathReferenceResult.error) throw pathReferenceResult.error;
  const foreignReferences = (pathReferenceResult.data ?? []).filter((row) =>
    row.story_id !== story.id &&
    !episodeIds.includes(row.episode_id ?? "")
  );
  if (foreignReferences.length > 0) {
    throw new Error("A Storage object is referenced outside the target story.");
  }

  const counts = {
    stories: 1,
    episodes: episodeIds.length,
    storyGenres: await count("story_genres", "story_id", story.id),
    wikiSettings: await count("story_wiki_settings", "story_id", story.id),
    wikiEntries: await count("wiki_entries", "story_id", story.id),
    productionProfiles: await count("story_production_profiles", "story_id", story.id),
    canonRules: await count("story_canon_rules", "story_id", story.id),
    mediaAssets: mediaResult.data?.length ?? 0,
    episodeArtDirections: await count("episode_art_direction", "episode_id", episodeIds),
    storageObjects: storagePaths.length,
  };
  const fingerprintSource = JSON.stringify({
    storyId: story.id,
    slug,
    title: story.title,
    status: story.content_status,
    counts,
    storagePaths,
  });
  const fingerprint = await sha256(fingerprintSource);
  const operationId = await sha256(
    `${serviceKey}:${story.id}:${slug}:${fingerprint}`,
  );

  return {
    operationId,
    fingerprint,
    story,
    counts,
    storageBucket: bucket,
    storagePaths,
    sharedStorageReferences: 0,
  };
}

async function removeStorage(paths: string[]) {
  for (let start = 0; start < paths.length; start += 100) {
    const batch = paths.slice(start, start + 100);
    const removed = await db.storage.from(bucket).remove(batch);
    if (removed.error) {
      throw new Error(`Storage deletion failed: ${removed.error.message}`);
    }
  }
}

async function executeDelete(body: Record<string, unknown>) {
  const slug = cleanSlug(body.storySlug);
  const current = await manifest(slug);
  if (body.confirmation !== `DELETE ${slug}`) {
    throw new Error(`confirmation must exactly equal 'DELETE ${slug}'.`);
  }
  if (
    typeof body.operationId !== "string" ||
    !secureEqual(body.operationId, current.operationId)
  ) {
    throw new Error("The preview operationId is missing or stale. Run preview again.");
  }

  const storiesBefore = await count("stories", "id", current.story.id);
  await removeStorage(current.storagePaths);
  const remainingStorage = await listFolder(slug);
  if (remainingStorage.length > 0) {
    throw new Error(
      `Storage verification failed; ${remainingStorage.length} object(s) remain.`,
    );
  }

  const deleted = await db
    .from("stories")
    .delete()
    .eq("id", current.story.id)
    .eq("slug", slug)
    .select("id");
  if (deleted.error) {
    throw new Error(`Database deletion failed: ${deleted.error.message}`);
  }
  if (deleted.data?.length !== 1 || storiesBefore !== 1) {
    throw new Error("Exact story deletion verification failed.");
  }

  const storyAfter = await db
    .from("stories")
    .select("id", { count: "exact", head: true })
    .eq("slug", slug);
  if (storyAfter.error || (storyAfter.count ?? 0) !== 0) {
    throw new Error("Post-deletion story verification failed.");
  }

  return {
    deleted: true,
    story: current.story,
    removed: current.counts,
    storageObjectsRemaining: 0,
    databaseStoryRowsRemaining: 0,
    note:
      "GitHub queue files are repository records and must be removed separately using the exact slug path.",
  };
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return respond({ error: "POST is required." }, 405);
  }
  try {
    requireOperator(request);
    const body = await request.json();
    const action = String(body.action ?? "");
    if (action === "delete-preview") {
      return respond({
        preview: true,
        manifest: await manifest(cleanSlug(body.storySlug)),
      });
    }
    if (action === "delete-execute") {
      return respond(await executeDelete(body));
    }
    throw new Error("Unsupported action.");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    return respond(
      { error: message },
      /operator access/.test(message) ? 403 : 400,
    );
  }
});
