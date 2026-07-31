import Link from "next/link";
import { notFound } from "next/navigation";
import EducationStudio from "@/components/EducationStudio";
import { isEducationDocument } from "@/lib/education-content";
import { isStudioModeEnabled } from "@/lib/studio-mode";
import { supabase } from "@/lib/supabase";

type Props = {
  params: Promise<{ slug: string; episodeNumber: string }>;
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
    .select("episode_number, title, reader_content_json")
    .eq("story_id", story.id)
    .eq("episode_number", episodeIndex)
    .single();
  if (!episode || !isEducationDocument(episode.reader_content_json)) notFound();

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="education-studio-header">
          <div>
            <p className="education-panel-label">Education Studio · Draft</p>
            <h1>{story.title}</h1>
            <p>Episode {episode.episode_number}: {episode.title}</p>
          </div>
          <Link
            href={`/stories/${story.slug}/episodes/${episode.episode_number}/read`}
            className="education-studio-back"
          >
            Back to Reader
          </Link>
        </header>
        <EducationStudio
          initialContent={episode.reader_content_json}
          filename={`${story.slug}-episode-${episode.episode_number}-reader.json`}
        />
      </div>
    </main>
  );
}
