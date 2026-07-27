import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createRemoteJWKSet, jwtVerify } from "jose";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TARGET_URL = `${SUPABASE_URL}/functions/v1/story-artwork-production`;
const EXPECTED_REPOSITORY = "he84677-Platform/ai-audio-stories";
const EXPECTED_ACTOR = "he84677-Platform";
const EXPECTED_WORKFLOW = ".github/workflows/upload-story-artwork.yml";
const AUDIENCE = "supabase-story-artwork";
const ISSUER = "https://token.actions.githubusercontent.com";
const JWKS = createRemoteJWKSet(new URL("https://token.actions.githubusercontent.com/.well-known/jwks"));

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function verifyGitHubIdentity(request: Request): Promise<void> {
  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) throw new Error("Missing GitHub OIDC bearer token.");

  const { payload } = await jwtVerify(authorization.slice(7).trim(), JWKS, {
    issuer: ISSUER,
    audience: AUDIENCE,
  });

  if (payload.repository !== EXPECTED_REPOSITORY) throw new Error("Unexpected GitHub repository.");
  if (payload.actor !== EXPECTED_ACTOR) throw new Error("Unexpected GitHub actor.");
  if (payload.event_name !== "pull_request" && payload.event_name !== "workflow_dispatch") {
    throw new Error("Unsupported GitHub event.");
  }
  if (payload.event_name === "pull_request" && payload.base_ref !== "main") {
    throw new Error("Pull request must target main.");
  }

  const workflowRef = String(payload.workflow_ref ?? "");
  if (!workflowRef.includes(`${EXPECTED_REPOSITORY}/${EXPECTED_WORKFLOW}@`)) {
    throw new Error("Unexpected GitHub workflow.");
  }
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "POST is required." }, 405);

  try {
    await verifyGitHubIdentity(request);
    const contentType = request.headers.get("content-type") ?? "application/octet-stream";
    const body = await request.arrayBuffer();
    if (body.byteLength === 0) throw new Error("Request body is empty.");

    const upstream = await fetch(TARGET_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": contentType,
      },
      body,
    });

    return new Response(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    return json({ error: message }, 403);
  }
});
