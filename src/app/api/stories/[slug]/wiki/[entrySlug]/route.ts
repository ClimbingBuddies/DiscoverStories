import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isStudioModeEnabled } from "@/lib/studio-mode";

function parseNumber(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; entrySlug: string }> }
) {
  const { slug, entrySlug } = await params;
  const spoilersOn = request.nextUrl.searchParams.get("spoilers") === "on";
  const completedSeason = spoilersOn
    ? null
    : parseNumber(request.nextUrl.searchParams.get("season"));
  const completedEpisode = spoilersOn
    ? null
    : parseNumber(request.nextUrl.searchParams.get("episode"));
  const studioModeEnabled = await isStudioModeEnabled();

  const { data, error } = await supabase.rpc("get_public_story_wiki", {
    p_story_slug: slug,
    p_entry_slug: entrySlug,
    p_completed_season: completedSeason,
    p_completed_episode: completedEpisode,
    p_include_spoilers: spoilersOn,
    p_include_drafts: studioModeEnabled,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data?.story || !data?.requested_entry) {
    return NextResponse.json({ error: "Wiki entry not found." }, { status: 404 });
  }

  return NextResponse.json({
    requested_entry: data.requested_entry,
    sections: data.sections ?? [],
    relationships: data.relationships ?? [],
    episodes: data.episodes ?? [],
  });
}
