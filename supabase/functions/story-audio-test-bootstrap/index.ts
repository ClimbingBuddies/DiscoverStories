import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(() =>
  Response.json(
    { disabled: true, message: "The one-time audio pipeline bootstrap is disabled." },
    {
      status: 410,
      headers: { "Cache-Control": "no-store" },
    },
  )
);

