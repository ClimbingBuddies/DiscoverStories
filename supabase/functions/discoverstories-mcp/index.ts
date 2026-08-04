import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, mcp-session-id",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Content-Type": "application/json",
};

const MCP_VERSION = "2025-06-18";
const STORAGE_ADMIN = `${Deno.env.get("SUPABASE_URL")}/functions/v1/storage-admin`;

function response(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, ...extra } });
}

function errorResponse(id: unknown, code: number, message: string) {
  return response({ jsonrpc: "2.0", id, error: { code, message } }, 200);
}

function toolDefinitions() {
  return [{
    name: "list_story_files",
    description: "List files beneath an authorised story folder. Read-only.",
    inputSchema: {
      type: "object",
      properties: {
        storySlug: { type: "string", description: "Story slug, for example the-nature-of-light" },
        prefix: { type: "string", description: "Optional relative folder prefix within the story" },
        bucket: { type: "string", enum: ["stories", "story-published"] },
      },
      required: ["storySlug"],
      additionalProperties: false,
    },
  }, {
    name: "storage_upload",
    description: "Upload one file to an authorised story Storage path.",
    inputSchema: {
      type: "object",
      properties: {
        storySlug: { type: "string" }, bucket: { type: "string", enum: ["stories", "story-published"] },
        path: { type: "string" }, contentBase64: { type: "string" }, contentType: { type: "string" }, upsert: { type: "boolean" },
      }, required: ["storySlug", "path", "contentBase64"], additionalProperties: false,
    },
  }, {
    name: "storage_copy",
    description: "Copy one file within an authorised story Storage scope.",
    inputSchema: {
      type: "object",
      properties: {
        storySlug: { type: "string" }, sourceBucket: { type: "string", enum: ["stories", "story-published"] },
        sourcePath: { type: "string" }, destinationBucket: { type: "string", enum: ["stories", "story-published"] }, destinationPath: { type: "string" },
      }, required: ["storySlug", "sourcePath", "destinationPath"], additionalProperties: false,
    },
  }];
}

async function callStorageAdmin(auth: string, args: Record<string, unknown>) {
  const upstream = await fetch(STORAGE_ADMIN, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({
      operation: args.operation ?? "list",
      storySlug: args.storySlug,
      bucket: args.bucket ?? "stories",
      prefix: args.prefix ?? `${args.storySlug}/`,
      path: args.path,
      sourceBucket: args.sourceBucket,
      sourcePath: args.sourcePath,
      destinationBucket: args.destinationBucket,
      destinationPath: args.destinationPath,
      contentBase64: args.contentBase64,
      contentType: args.contentType,
      upsert: args.upsert,
    }),
  });
  const payload = await upstream.json();
  if (!upstream.ok) throw new Error(payload?.error ?? `storage-admin returned ${upstream.status}`);
  return payload;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return response({ error: "Authentication required" }, 401);
  if (!["POST", "GET", "DELETE"].includes(req.method)) return response({ error: "Method not allowed" }, 405);

  if (req.method === "GET") {
    return response({ name: "discoverstories-mcp", version: "0.1.0", protocol: MCP_VERSION });
  }
  if (req.method === "DELETE") return new Response(null, { status: 204, headers: corsHeaders });

  let message: any;
  try { message = await req.json(); } catch { return errorResponse(null, -32700, "Invalid JSON"); }
  const id = message?.id ?? null;
  if (message?.jsonrpc !== "2.0" || typeof message?.method !== "string") return errorResponse(id, -32600, "Invalid JSON-RPC request");

  if (message.method === "initialize") {
    return response({ jsonrpc: "2.0", id, result: {
      protocolVersion: MCP_VERSION,
      capabilities: { tools: {} },
      serverInfo: { name: "discoverstories-mcp", version: "0.1.0" },
    } }, 200, { "Mcp-Session-Id": crypto.randomUUID() });
  }
  if (message.method === "notifications/initialized") return new Response(null, { status: 202, headers: corsHeaders });
  if (message.method === "tools/list") return response({ jsonrpc: "2.0", id, result: { tools: toolDefinitions() } });
  if (message.method === "tools/call") {
    const toolName = message.params?.name;
    const operationByTool: Record<string, string> = { list_story_files: "list", storage_upload: "upload", storage_copy: "copy" };
    if (!operationByTool[toolName]) return errorResponse(id, -32601, "Unknown tool");
    try {
      const result = await callStorageAdmin(auth, { ...(message.params.arguments ?? {}), operation: operationByTool[toolName] });
      return response({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(result) }], structuredContent: result } });
    } catch (error) {
      return response({ jsonrpc: "2.0", id, result: { isError: true, content: [{ type: "text", text: error instanceof Error ? error.message : "Tool failed" }] } });
    }
  }
  return errorResponse(id, -32601, `Unsupported method: ${message.method}`);
});