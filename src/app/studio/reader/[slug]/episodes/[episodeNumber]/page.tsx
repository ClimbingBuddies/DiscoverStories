import Link from "next/link";
import { notFound } from "next/navigation";
import EducationReader from "@/components/EducationReader";
import { isEducationDocument } from "@/lib/education-content";
import { isStudioModeEnabled } from "@/lib/studio-mode";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{ slug: string; episodeNumber: string }>;
};

export default async function StudioReaderPage({ params }: Props) {
  if (!(await isStudioModeEnabled())) notFound();

  const { slug, episodeNumber } = await params;
  const episodeIndex = Number(episodeNumber);
  if (!Number.isInteger(episodeIndex) || episodeIndex <= 0) notFound();

  const { data: story } = await supabase
    .from("stories")
    .select("id, slug, title")
    .eq("slug", slug)
    .single();
  if (!story) notFound();

  const { data: episode } = await supabase
    .from("episodes")
    .select("id, episode_number, season_number, title, script_text, word_count, duration_seconds, audio_url, reader_content_json")
    .eq("story_id", story.id)
    .eq("episode_number", episodeIndex)
    .single();
  if (!episode) notFound();

  const { data: previousEpisode } = await supabase
    .from("episodes")
    .select("episode_number")
    .eq("story_id", story.id)
    .lt("episode_number", episodeIndex)
    .order("episode_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: nextEpisode } = await supabase
    .from("episodes")
    .select("episode_number")
    .eq("story_id", story.id)
    .gt("episode_number", episodeIndex)
    .order("episode_number", { ascending: true })
    .limit(1)
    .maybeSingle();

  const readingMinutes = episode.word_count ? Math.max(1, Math.round(episode.word_count / 200)) : 0;
  const readerDocument = isEducationDocument(episode.reader_content_json)
    ? episode.reader_content_json
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900 px-6 py-4 sm:px-8">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-4">
          <Link
            href={`/StudioWorkflow3?story_id=${story.id}`}
            className="rounded-lg bg-zinc-800 px-3 py-2 text-sm font-medium transition-colors hover:bg-zinc-700"
          >
            Back to Studio
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Studio Reader</p>
            <h1 className="truncate text-xl font-semibold sm:text-2xl">{story.title} · Episode {episode.episode_number}</h1>
            <p className="truncate text-zinc-400">{episode.title}</p>
          </div>
          <div className="hidden text-right text-sm text-zinc-400 sm:block">
            <p>{episode.word_count?.toLocaleString() ?? "-"} words</p>
            <p>{readingMinutes ? `~${readingMinutes} min read` : ""}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
        <article className="mx-auto w-full max-w-3xl leading-relaxed text-zinc-200">
          {readerDocument ? (
            <EducationReader document={readerDocument} />
          ) : episode.script_text ? (
            <div className="whitespace-pre-wrap text-lg">{episode.script_text}</div>
          ) : (
            <div className="py-12 text-center text-zinc-500">No script available for this episode.</div>
          )}
        </article>
      </main>

      <footer className="border-t border-zinc-800 bg-zinc-900 px-6 py-4 sm:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap gap-3">
          {previousEpisode ? (
            <Link
              href={`/studio/reader/${story.slug}/episodes/${previousEpisode.episode_number}`}
              className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-700"
            >
              Previous
            </Link>
          ) : null}
          {episode.audio_url ? (
            <Link
              href={`/stories/${story.slug}/episodes/${episode.episode_number}/listen`}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-emerald-500"
            >
              Listen
            </Link>
          ) : null}
          {nextEpisode ? (
            <Link
              href={`/studio/reader/${story.slug}/episodes/${nextEpisode.episode_number}`}
              className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-700"
            >
              Next
            </Link>
          ) : null}
        </div>
      </footer>
    </div>
  );
}
