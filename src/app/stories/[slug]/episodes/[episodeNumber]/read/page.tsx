import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { isStudioModeEnabled } from "@/lib/studio-mode";

type Props = {
  params: Promise<{ slug: string; episodeNumber: string }>;
};

export default async function ReadPage({ params }: Props) {
  const studioModeEnabled = await isStudioModeEnabled();
  const { slug, episodeNumber } = await params;

  let storyQuery = supabase
    .from("stories")
    .select("id, slug, title")
    .eq("slug", slug);

  if (!studioModeEnabled) {
    storyQuery = storyQuery.eq("content_status", "published");
  }

  const { data: story } = await storyQuery.single();

  if (!story) notFound();

  let episodeQuery = supabase
    .from("episodes")
    .select("id, episode_number, episode_end_number, season_number, title, script_text, word_count, duration_seconds, audio_url")
    .eq("story_id", story.id)
    .eq("episode_number", parseInt(episodeNumber));

  if (!studioModeEnabled) {
    episodeQuery = episodeQuery.eq("episode_status", "published");
  }

  const { data: episode } = await episodeQuery.single();

  if (!episode) notFound();

  let nextEpisodeQuery = supabase
    .from("episodes")
    .select("episode_number")
    .eq("story_id", story.id)
    .gt("episode_number", parseInt(episodeNumber))
    .order("episode_number", { ascending: true })
    .limit(1);

  if (!studioModeEnabled) {
    nextEpisodeQuery = nextEpisodeQuery.eq("episode_status", "published");
  }

  const { data: nextEpisode } = await nextEpisodeQuery.single();

  const readingMinutes = episode.word_count ? Math.round(episode.word_count / 200) : 0;
  const episodeLabel = episode.episode_end_number
    ? `Episodes ${episode.episode_number}–${episode.episode_end_number}`
    : `Episode ${episode.episode_number}`;

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900 px-6 py-4 sm:px-8">
        <div className="flex items-center gap-4">
          <Link
            href={`/stories/${slug}`}
            className="rounded-lg p-2 hover:bg-zinc-800 transition-colors"
            title="Back to episodes"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <p className="text-sm text-emerald-400 uppercase tracking-wide">{episodeLabel}</p>
            <h1 className="text-2xl font-bold">{episode.title}</h1>
          </div>
          <div className="text-right text-sm text-zinc-400">
            <p>{episode.word_count?.toLocaleString()} words</p>
            <p>~{readingMinutes} min read</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
        <article className="prose prose-invert max-w-3xl mx-auto text-zinc-300 leading-relaxed">
          {episode.script_text ? (
            <div className="whitespace-pre-wrap text-lg">
              {episode.script_text}
            </div>
          ) : (
            <div className="text-zinc-500 text-center py-12">
              No script available for this episode.
            </div>
          )}
        </article>
      </main>

      <footer className="border-t border-zinc-800 bg-zinc-900 p-4 sm:p-6">
        <div className="flex gap-4 max-w-3xl mx-auto">
          <Link
            href={`/stories/${slug}`}
            className="flex-1 rounded-lg bg-zinc-800 px-4 py-3 text-center hover:bg-zinc-700 transition-colors font-medium"
          >
            ← Back
          </Link>
          {episode.audio_url && (
            <Link
              href={`/stories/${slug}/episodes/${episode.episode_number}/listen`}
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-3 text-center hover:bg-emerald-500 transition-colors font-medium text-zinc-950"
            >
              🎵 Listen to Audio
            </Link>
          )}
          {nextEpisode ? (
            <Link
              href={`/stories/${slug}/episodes/${nextEpisode.episode_number}/read`}
              className="flex-1 rounded-lg bg-zinc-800 px-4 py-3 text-center hover:bg-zinc-700 transition-colors font-medium"
            >
              Next →
            </Link>
          ) : (
            <button
              disabled
              className="flex-1 rounded-lg bg-zinc-800 px-4 py-3 text-center text-zinc-600 cursor-not-allowed"
            >
              Next →
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
