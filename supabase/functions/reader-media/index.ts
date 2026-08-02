import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const assetId = url.searchParams.get("id");
  if (!assetId || !/^[0-9a-f-]{36}$/i.test(assetId)) {
    return new Response("Invalid media asset id", { status: 400, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response("Server configuration error", { status: 500, headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from("media_asset_inline_content")
    .select("content_type, content_text, media_assets!inner(id, is_approved, is_reader_visible, content_status, lifecycle_status)")
    .eq("media_asset_id", assetId)
    .eq("media_assets.is_approved", true)
    .eq("media_assets.is_reader_visible", true)
    .in("media_assets.content_status", ["approved", "published"])
    .in("media_assets.lifecycle_status", ["approved", "published"])
    .maybeSingle();

  if (error) {
    console.error(error);
    return new Response("Unable to load media", { status: 500, headers: corsHeaders });
  }
  if (!data) {
    return new Response("Media not found", { status: 404, headers: corsHeaders });
  }

  return new Response(data.content_text, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": data.content_type,
      "Cache-Control": "public, max-age=300, s-maxage=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
});

