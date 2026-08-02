import Link from "next/link";
import { notFound } from "next/navigation";
import PlanningBlockReviewStudio from "@/components/PlanningBlockReviewStudio";
import { isEducationDocument } from "@/lib/education-content";
import { isStudioModeEnabled } from "@/lib/studio-mode";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{ slug: string; episodeNumber: string }>;
};

type PlannedEpisode = {
  episode_number: number;
  title: string;
};

export default async function EducationStudioPage({ params }: Props) {
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
    .select("episode_number, episode_end_number, season_number, title, reader_content_json")
    .eq("story_id", story.id)
    .eq("episode_number", episodeIndex)
    .single();
  if (!episode || !episode.episode_end_number || !isEducationDocument(episode.reader_content_json)) notFound();

  const { data: planningBlock } = await supabase
    .from("story_episode_planning_blocks")
    .select("id, episode_start, episode_end, title, arc_summary, episode_summaries")
    .eq("story_id", story.id)
    .eq("season_number", episode.season_number)
    .eq("episode_start", episode.episode_number)
    .eq("episode_end", episode.episode_end_number)
    .single();
  if (!planningBlock) notFound();

  const { data: reviewNotes } = await supabase
    .from("planning_block_review_notes")
    .select("id, episode_number, parent_note_id, reviewer_user_id, reviewer_name, note_text, status, author_response, created_at, updated_at")
    .eq("planning_block_id", planningBlock.id)
    .order("created_at", { ascending: false });

  const plannedEpisodes = Array.isArray(planningBlock.episode_summaries)
    ? planningBlock.episode_summaries
        .filter((item): item is PlannedEpisode => {
          if (!item || typeof item !== "object") return false;
          const candidate = item as { episode_number?: unknown; title?: unknown };
          return Number.isInteger(candidate.episode_number) && typeof candidate.title === "string";
        })
        .map((item) => ({ episode_number: item.episode_number, title: item.title }))
    : [];

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-[1700px]">
        <header className="education-studio-header">
          <div>
            <p className="education-panel-label">Education Studio · Review</p>
            <h1>{story.title}</h1>
            <p>Episodes {planningBlock.episode_start}–{planningBlock.episode_end}: {planningBlock.title}</p>
          </div>
          <Link
            href={`/stories/${story.slug}/episodes/${episode.episode_number}/read`}
            className="education-studio-back"
          >
            Back to Reader
          </Link>
        </header>

        <PlanningBlockReviewStudio
          storyId={story.id}
          planningBlockId={planningBlock.id}
          episodeStart={planningBlock.episode_start}
          episodeEnd={planningBlock.episode_end}
          blockTitle={planningBlock.title}
          blockDescription={planningBlock.arc_summary}
          plannedEpisodes={plannedEpisodes}
          readerDocument={episode.reader_content_json}
          initialNotes={reviewNotes ?? []}
        />
      </div>
    </main>
  );
}
