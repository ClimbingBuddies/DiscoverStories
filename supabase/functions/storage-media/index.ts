import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const path = new URL(req.url).searchParams.get("path")?.replace(/^\/+/, "");
  if (!path || !/^[0-9a-f-]{36}\//i.test(path)) {
    return new Response("Invalid canonical storage path", { status: 400, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return new Response("Server configuration error", { status: 500, headers: corsHeaders });

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const { data: asset, error } = await supabase
    .from("media_assets")
    .select("storage_path, is_approved, content_status, lifecycle_status")
    .eq("storage_path", path)
    .maybeSingle();

  if (error) return new Response("Unable to load media", { status: 500, headers: corsHeaders });
  if (!asset || asset.is_approved !== true || !["approved", "published"].includes(asset.content_status) || asset.lifecycle_status !== "approved") {
    return new Response("Media not found", { status: 404, headers: corsHeaders });
  }

  const signed = await supabase.storage.from("stories").createSignedUrl(path, 300);
  if (signed.error || !signed.data?.signedUrl) return new Response("Unable to sign media", { status: 502, headers: corsHeaders });
  return Response.redirect(signed.data.signedUrl, { headers: { ...corsHeaders, "Cache-Control": "private, max-age=240" } });
});
