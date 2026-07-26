import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getStorageImageUrl } from "@/lib/supabase-storage";
import StoryEpisodesSection from "@/components/StoryEpisodesSection";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function StoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const searchParamsObj = await searchParams;
  const page = Math.max(1, Number(searchParamsObj.page ?? 1));
  const pageSize = 10;

  const { data: story } = await supabase
    .from("stories")
    .select("id, slug, title, description, short_description, banner_image_path")
    .eq("slug", slug)
    .eq("content_status", "published")
    .single();

  if (!story) notFound();

  const { data: episodes, error } = await supabase
    .from("episodes")
    .select(
      "id, season_number, episode_number, title, summary, word_count, duration_seconds, episode_status, audio_url, artwork_path"
    )
    .eq("story_id", story.id)
    .eq("episode_status", "published")
    .order("season_number")
    .order("episode_number");

  if (error) {
    throw new Error(error.message);
  }

  // Get total count of published episodes to determine if there's a next page
  const { count: totalEpisodes, error: countError } = await supabase
    .from("episodes")
    .select("id", { count: "exact", head: true })
    .eq("story_id", story.id)
    .eq("episode_status", "published");

  if (countError) {
    throw new Error(countError.message);
  }

  const { data: hasWiki, error: wikiError } = await supabase.rpc("has_public_story_wiki", {
    p_story_id: story.id,
  });

  if (wikiError) {
    throw new Error(wikiError.message);
  }

  const wikiEnabled = Boolean(hasWiki);
  const initialEpisodes = (episodes ?? []).slice((page - 1) * pageSize, page * pageSize);

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="text-sm text-emerald-400 hover:text-emerald-300"
        >
          ← Back to library
        </Link>

        <div className="mt-10 overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900">
          <div className="relative h-72 sm:h-96">
            <Image
              src={getStorageImageUrl(story.banner_image_path ?? null)}
              alt={story.title}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>

          <div className="space-y-6 p-6 sm:p-10">
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-400">
              Discover Stories
            </p>

            <h1 className="text-4xl font-bold text-white">{story.title}</h1>

            <p className="max-w-3xl text-lg leading-8 text-zinc-300">
              {story.description ?? story.short_description}
            </p>
          </div>
        </div>

        <div className="mt-12">
          <StoryEpisodesSection
            story={{ slug: story.slug, title: story.title }}
            wikiEnabled={wikiEnabled}
            initialPage={page}
            initialEpisodes={initialEpisodes}
            episodes={episodes ?? []}
            pageSize={pageSize}
            totalEpisodes={totalEpisodes}
          />
        </div>
      </div>
    </main>
  );
}
