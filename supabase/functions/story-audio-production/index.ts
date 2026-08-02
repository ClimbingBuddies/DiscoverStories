import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.110.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
const audioBucket = "story-audio";
const openAiSpeechUrl = "https://api.openai.com/v1/audio/speech";
const model = "gpt-4o-mini-tts";
const allowedVoices = new Set([
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "fable",
  "nova",
  "onyx",
  "sage",
  "shimmer",
  "verse",
  "marin",
  "cedar",
]);

const db = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type GenerateRequest = {
  action?: string;
  storySlug?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  text?: string;
  voice?: string;
  instructions?: string;
};

function respond(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function secureEqual(a: string, b: string) {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index++) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

function requireOperator(request: Request) {
  const header = request.headers.get("authorization");
  if (
    !header?.startsWith("Bearer ") ||
    !secureEqual(header.slice(7).trim(), serviceRoleKey)
  ) {
    throw new Error("Supabase service operator access is required.");
  }
}

function cleanSlug(value: unknown) {
  const slug = String(value ?? "").trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("A valid storySlug is required.");
  }
  return slug;
}

function positiveInteger(value: unknown, field: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${field} must be a positive integer.`);
  }
  return parsed;
}

function cleanText(value: unknown, field: string, maximum: number) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`${field} is required.`);
  if (text.length > maximum) {
    throw new Error(`${field} must not exceed ${maximum} characters.`);
  }
  return text;
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function isMp3(bytes: Uint8Array) {
  const hasId3 = bytes.length >= 3 &&
    bytes[0] === 0x49 &&
    bytes[1] === 0x44 &&
    bytes[2] === 0x33;
  const hasFrameSync = bytes.length >= 2 &&
    bytes[0] === 0xff &&
    (bytes[1] & 0xe0) === 0xe0;
  return hasId3 || hasFrameSync;
}

async function nextVersion(episodeId: string) {
  const result = await db
    .from("media_assets")
    .select("version_number")
    .eq("episode_id", episodeId)
    .eq("asset_type", "audio_file")
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (result.error) throw new Error(`Audio version lookup failed: ${result.error.message}`);
  return Number(result.data?.version_number ?? 0) + 1;
}

async function generatePreview(body: GenerateRequest) {
  if (!openAiApiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const storySlug = cleanSlug(body.storySlug);
  const seasonNumber = positiveInteger(body.seasonNumber ?? 1, "seasonNumber");
  const episodeNumber = positiveInteger(body.episodeNumber, "episodeNumber");
  const input = cleanText(body.text, "text", 1_200);
  const voice = String(body.voice ?? "marin").trim().toLowerCase();
  const instructions = cleanText(
    body.instructions ??
      "Read as a calm, natural audiobook narrator. Use clear Australian English-friendly pronunciation and measured pacing.",
    "instructions",
    500,
  );
  if (!allowedVoices.has(voice)) throw new Error("The requested voice is not supported.");

  const storyResult = await db
    .from("stories")
    .select("id,slug,title,content_status")
    .eq("slug", storySlug)
    .single();
  if (storyResult.error || !storyResult.data) {
    throw new Error(`Story '${storySlug}' was not found.`);
  }
  const story = storyResult.data;

  const episodeResult = await db
    .from("episodes")
    .select("id,title,episode_status")
    .eq("story_id", story.id)
    .eq("season_number", seasonNumber)
    .eq("episode_number", episodeNumber)
    .single();
  if (episodeResult.error || !episodeResult.data) {
    throw new Error(`Season ${seasonNumber}, Episode ${episodeNumber} was not found.`);
  }
  const episode = episodeResult.data;

  const sourceHash = await sha256(
    JSON.stringify({ model, voice, instructions, input }),
  );
  const existingResult = await db
    .from("audio_generation_runs")
    .select("id,output_storage_path,created_at,completed_at")
    .eq("story_id", story.id)
    .eq("episode_id", episode.id)
    .eq("source_script_hash", sourceHash)
    .eq("run_status", "completed")
    .not("output_storage_path", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existingResult.error) {
    throw new Error(`Audio deduplication check failed: ${existingResult.error.message}`);
  }
  if (existingResult.data?.output_storage_path) {
    const signed = await db.storage
      .from(audioBucket)
      .createSignedUrl(existingResult.data.output_storage_path, 3_600);
    if (signed.error) throw new Error(`Signed URL creation failed: ${signed.error.message}`);
    return {
      generated: false,
      reused: true,
      pipelineTest: true,
      runId: existingResult.data.id,
      story: story.title,
      episode: episode.title,
      model,
      voice,
      storagePath: existingResult.data.output_storage_path,
      signedUrl: signed.data.signedUrl,
      signedUrlExpiresInSeconds: 3_600,
      publicEpisodePointerUpdated: false,
    };
  }

  const versionNumber = await nextVersion(episode.id);
  const paddedSeason = String(seasonNumber).padStart(2, "0");
  const paddedEpisode = String(episodeNumber).padStart(2, "0");
  const storagePath =
    `${storySlug}/audio/s${paddedSeason}e${paddedEpisode}/${storySlug}-s${paddedSeason}e${paddedEpisode}-preview-v${String(versionNumber).padStart(2, "0")}.mp3`;
  const notes = JSON.stringify({
    purpose: "pipeline_test",
    model,
    voice,
    instructions,
    inputCharacters: input.length,
    publicEpisodePointerUpdated: false,
  });

  const runInsert = await db
    .from("audio_generation_runs")
    .insert({
      story_id: story.id,
      episode_id: episode.id,
      provider: "openai",
      provider_voice_id: voice,
      source_script_hash: sourceHash,
      production_mode: "single_narrator",
      run_status: "running",
      quality_notes: notes,
    })
    .select("id")
    .single();
  if (runInsert.error || !runInsert.data) {
    throw new Error(`Audio run creation failed: ${runInsert.error?.message ?? "Unknown error"}`);
  }
  const runId = runInsert.data.id;

  try {
    const speechResponse = await fetch(openAiSpeechUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        voice,
        input,
        instructions,
        response_format: "mp3",
      }),
    });
    if (!speechResponse.ok) {
      const errorText = (await speechResponse.text()).slice(0, 1_000);
      throw new Error(`OpenAI speech generation failed (${speechResponse.status}): ${errorText}`);
    }

    const bytes = new Uint8Array(await speechResponse.arrayBuffer());
    if (bytes.length < 256 || !isMp3(bytes)) {
      throw new Error("OpenAI returned data that did not validate as an MP3.");
    }

    const uploaded = await db.storage
      .from(audioBucket)
      .upload(storagePath, bytes, {
        contentType: "audio/mpeg",
        cacheControl: "3600",
        upsert: false,
      });
    if (uploaded.error) throw new Error(`Audio upload failed: ${uploaded.error.message}`);

    const assetInsert = await db
      .from("media_assets")
      .insert({
        story_id: null,
        episode_id: episode.id,
        asset_type: "audio_file",
        storage_provider: "supabase",
        storage_path: storagePath,
        public_url: null,
        mime_type: "audio/mpeg",
        file_size_bytes: bytes.byteLength,
        lifecycle_status: "draft",
        version_number: versionNumber,
        is_approved: false,
        source_hash: sourceHash,
        generation_notes: notes,
      })
      .select("id")
      .single();
    if (assetInsert.error || !assetInsert.data) {
      await db.storage.from(audioBucket).remove([storagePath]);
      throw new Error(`Audio asset registration failed: ${assetInsert.error?.message ?? "Unknown error"}`);
    }

    const completedAt = new Date().toISOString();
    const runUpdate = await db
      .from("audio_generation_runs")
      .update({
        run_status: "completed",
        output_storage_path: storagePath,
        completed_at: completedAt,
      })
      .eq("id", runId)
      .eq("run_status", "running");
    if (runUpdate.error) throw new Error(`Audio run completion failed: ${runUpdate.error.message}`);

    const storedFolder = storagePath.slice(0, storagePath.lastIndexOf("/"));
    const storedFilename = storagePath.slice(storagePath.lastIndexOf("/") + 1);
    const verified = await db.storage.from(audioBucket).list(storedFolder, {
      search: storedFilename,
      limit: 10,
    });
    if (
      verified.error ||
      !verified.data?.some((item) => item.name === storedFilename)
    ) {
      throw new Error("Audio storage read-back verification failed.");
    }

    const signed = await db.storage
      .from(audioBucket)
      .createSignedUrl(storagePath, 3_600);
    if (signed.error) throw new Error(`Signed URL creation failed: ${signed.error.message}`);

    return {
      generated: true,
      reused: false,
      pipelineTest: true,
      runId,
      assetId: assetInsert.data.id,
      story: story.title,
      episode: episode.title,
      storyStatus: story.content_status,
      episodeStatus: episode.episode_status,
      model,
      voice,
      inputCharacters: input.length,
      fileSizeBytes: bytes.byteLength,
      storagePath,
      signedUrl: signed.data.signedUrl,
      signedUrlExpiresInSeconds: 3_600,
      publicEpisodePointerUpdated: false,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db
      .from("audio_generation_runs")
      .update({
        run_status: "failed",
        error_message: message.slice(0, 2_000),
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId);
    throw error;
  }
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return respond({ error: "POST is required." }, 405);
  }
  try {
    requireOperator(request);
    const body = await request.json() as GenerateRequest;
    if (body.action !== "generate-preview") {
      throw new Error("action must be 'generate-preview'.");
    }
    return respond(await generatePreview(body), 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    const status = /operator access/.test(message) ? 403 : 400;
    return respond({ error: message }, status);
  }
});
